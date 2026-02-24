import fs from "fs";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find Hostinger .env file by walking up directories
let currentDir = __dirname;
let foundEnvPath = null;

// Specific check for the path shown in screenshots
const absoluteHostingerPath = "/home/u477692720/domains/app.auragoldelite.com/public_html/.builds/config/.env";
const screenshotPath = path.resolve(__dirname, "../public_html/.builds/config/.env");

if (fs.existsSync(absoluteHostingerPath)) {
  foundEnvPath = absoluteHostingerPath;
} else if (fs.existsSync(screenshotPath)) {
  foundEnvPath = screenshotPath;
} else {
  while (currentDir !== path.parse(currentDir).root) {
    const checkPath = path.join(currentDir, '.builds/config/.env');
    if (fs.existsSync(checkPath)) {
      foundEnvPath = checkPath;
      break;
    }
    currentDir = path.dirname(currentDir);
  }
}

if (foundEnvPath) {
  console.log("Loading .env from:", foundEnvPath);
  dotenv.config({ path: foundEnvPath });
} else {
  console.log("No specific .env found, using default dotenv.config()");
  dotenv.config(); // Fallback to local .env
}

// Also try loading from process.env directly if Hostinger injected them
const getEnv = (key) => {
  let val = process.env[key];
  if (!val) return val;
  val = val.trim();
  while (val.length > 1 && ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"')))) {
    val = val.slice(1, -1);
  }
  return val;
};

const db = new Database("gold_app.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    gold_999_balance REAL DEFAULT 0,
    gold_916_balance REAL DEFAULT 0,
    silver_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'buy', 'redeem'
    metal_type TEXT, -- 'gold_999', 'gold_916', 'silver'
    amount_in_grams REAL,
    amount_in_currency REAL,
    payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metal_type TEXT UNIQUE,
    price_per_gram REAL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial prices if not exist
const seedPrices = db.prepare("INSERT OR IGNORE INTO prices (metal_type, price_per_gram) VALUES (?, ?)");
seedPrices.run('gold_999', 7500);
seedPrices.run('gold_916', 6800);
seedPrices.run('silver', 95);

// Seed or Update Admin
const adminEmail = getEnv('ADMIN_EMAIL') || 'jeevan@auragoldelite.com';
const adminPassword = getEnv('ADMIN_PASSWORD') || '12345678';
const adminCheck = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();

if (!adminCheck) {
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    'Admin', 
    adminEmail, 
    hashedPassword, 
    'admin'
  );
} else {
  // Always update admin credentials to match the current .env file
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);
  try {
    // Check if the email is already taken by a non-admin
    const existingUser = db.prepare("SELECT * FROM users WHERE email = ? AND role != 'admin'").get(adminEmail);
    if (existingUser) {
      // If taken, we can't update the admin email to this. We'll just update the password.
      db.prepare("UPDATE users SET password = ? WHERE role = 'admin'").run(hashedPassword);
      console.error(`Cannot update admin email to ${adminEmail} because a customer already uses it.`);
    } else {
      db.prepare("UPDATE users SET email = ?, password = ? WHERE role = 'admin'").run(
        adminEmail,
        hashedPassword
      );
    }
  } catch (e) {
    console.error("Failed to update admin credentials:", e);
  }
}

const app = express();
const PORT = getEnv('PORT') || 3000;

app.use(cors());
app.use(express.json());

// Temporary debug route to see what env vars Hostinger is actually passing
app.get("/api/debug/env", (req, res) => {
  const users = db.prepare("SELECT id, name, email, role FROM users").all();
  res.json({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    CLEAN_EMAIL: getEnv('ADMIN_EMAIL'),
    CLEAN_PASSWORD: getEnv('ADMIN_PASSWORD'),
    DEFAULT_EMAIL: adminEmail,
    DEFAULT_PASSWORD: adminPassword,
    DIRNAME: __dirname,
    FOUND_ENV_PATH: foundEnvPath,
    USERS_IN_DB: users
  });
});

// Force reset admin route
app.get("/api/debug/reset-admin", (req, res) => {
  try {
    const email = getEnv('ADMIN_EMAIL') || 'admin@auragoldelite.com';
    const password = getEnv('ADMIN_PASSWORD') || 'admin123';
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Delete any existing admin
    db.prepare("DELETE FROM users WHERE role = 'admin'").run();
    
    // Delete any customer with the same email
    db.prepare("DELETE FROM users WHERE email = ?").run(email);
    
    // Insert fresh admin
    db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      'Admin', 
      email, 
      hashedPassword, 
      'admin'
    );
    
    res.json({ success: true, message: `Admin reset to ${email}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const JWT_SECRET = getEnv('JWT_SECRET') || "gold-secret";

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(name, email, hashedPassword);
    res.json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email ? email.trim() : '';
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);
  
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials (User not found)" });
  }
  
  if (bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid credentials (Wrong password)" });
  }
});

// Price Routes
app.get("/api/prices", (req, res) => {
  const prices = db.prepare("SELECT * FROM prices").all();
  res.json(prices);
});

app.post("/api/admin/prices", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { gold_999, gold_916, silver } = req.body;
  
  const update = db.prepare("UPDATE prices SET price_per_gram = ?, updated_at = CURRENT_TIMESTAMP WHERE metal_type = ?");
  update.run(gold_999, 'gold_999');
  update.run(gold_916, 'gold_916');
  update.run(silver, 'silver');
  
  res.json({ success: true });
});

// User Data
app.get("/api/user/profile", authenticateToken, (req, res) => {
  const user = db.prepare("SELECT id, name, email, role, gold_999_balance, gold_916_balance, silver_balance FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

app.get("/api/user/transactions", authenticateToken, (req, res) => {
  const transactions = db.prepare(`
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).all(req.user.id);
  res.json(transactions);
});

// Razorpay Integration
const razorpay = new Razorpay({
  key_id: getEnv('RAZORPAY_KEY_ID') || 'rzp_test_placeholder',
  key_secret: getEnv('RAZORPAY_KEY_SECRET') || 'placeholder_secret',
});

app.post("/api/payments/create-order", authenticateToken, async (req, res) => {
  const { amount } = req.body; // amount in INR
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/payments/verify", authenticateToken, (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, metal_type, grams, amount } = req.body;
  
  db.transaction(() => {
    const balanceField = `${metal_type}_balance`;
    db.prepare(`UPDATE users SET ${balanceField} = ${balanceField} + ? WHERE id = ?`).run(grams, req.user.id);
    
    db.prepare("INSERT INTO transactions (user_id, type, metal_type, amount_in_grams, amount_in_currency, payment_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(req.user.id, 'buy', metal_type, grams, amount, razorpay_payment_id, 'completed');
  })();

  res.json({ success: true });
});

// Redemption
app.post("/api/redeem", authenticateToken, (req, res) => {
  const { metal_type, grams } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  
  const balanceField = `${metal_type}_balance`;
  if (user[balanceField] < grams) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  db.transaction(() => {
    db.prepare(`UPDATE users SET ${balanceField} = ${balanceField} - ? WHERE id = ?`).run(grams, req.user.id);
    db.prepare("INSERT INTO transactions (user_id, type, metal_type, amount_in_grams, status) VALUES (?, ?, ?, ?, ?)")
      .run(req.user.id, 'redeem', metal_type, grams, 'pending_at_store');
  })();

  res.json({ success: true, message: "Redemption request created. Visit store to complete." });
});

// Admin: Reports and Stats
app.get("/api/admin/users", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const users = db.prepare(`
      SELECT id, name, email, role, created_at, 
      gold_999_balance, gold_916_balance, silver_balance 
      FROM users WHERE role = 'customer' ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/users/:id", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const user = db.prepare("SELECT id, name, email, created_at, gold_999_balance, gold_916_balance, silver_balance FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC").all(req.params.id);
    
    res.json({ user, transactions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/stats", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get();
  const totalSales = db.prepare("SELECT SUM(amount_in_currency) as total FROM transactions WHERE type = 'buy' AND status = 'completed'").get();
  
  const metalDistribution = db.prepare(`
    SELECT metal_type, SUM(amount_in_grams) as total_grams, SUM(amount_in_currency) as total_value 
    FROM transactions 
    WHERE type = 'buy' AND status = 'completed'
    GROUP BY metal_type
  `).all();

  const dailyVolume = db.prepare(`
    SELECT DATE(created_at) as date, SUM(amount_in_currency) as volume 
    FROM transactions 
    WHERE type = 'buy' AND status = 'completed'
    AND created_at >= date('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();

  res.json({
    totalUsers: totalUsers.count,
    totalSales: totalSales.total || 0,
    metalDistribution,
    dailyVolume
  });
});

app.get("/api/admin/transactions", authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const transactions = db.prepare(`
    SELECT t.*, u.name as user_name, u.email as user_email 
    FROM transactions t 
    JOIN users u ON t.user_id = u.id 
    ORDER BY t.created_at DESC
  `).all();
  res.json(transactions);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

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

dotenv.config();

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

// Seed Admin
const adminCheck = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminCheck) {
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    'Admin', 
    process.env.ADMIN_EMAIL || 'admin@aurumgold.com', 
    hashedPassword, 
    'admin'
  );
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "gold-secret";

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
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
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
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
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

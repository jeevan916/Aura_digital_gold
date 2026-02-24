import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useNavigate 
} from 'react-router-dom';
import { 
  Coins, 
  TrendingUp, 
  History, 
  User as UserIcon, 
  LayoutDashboard, 
  Store, 
  LogOut,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Search,
  Filter,
  ChevronDown,
  Users,
  Settings,
  FileText,
  Gift,
  Bell,
  X,
  Menu,
  Check,
  Wallet,
  Shield,
  CreditCard,
  Minus,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Components ---

const Navbar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  if (user.role === 'admin') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-none border-x-0 border-b-0 px-6 py-4 flex justify-around items-center z-50">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Dash</span>
        </Link>
        <Link to="/admin/inventory" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <Coins size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Prices</span>
        </Link>
        <Link to="/admin/reports" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <TrendingUp size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Reports</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <UserIcon size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Profile</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-none border-x-0 border-b-0 px-6 py-4 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <Link to="/" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Home</span>
      </Link>
      <Link to="/buy" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <div className="bg-gold text-aurum-black rounded-full p-2 neon-glow">
          <Plus size={24} />
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase mt-1">Buy</span>
      </Link>
      <Link to="/redeem" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <Store size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Redeem</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <UserIcon size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Profile</span>
      </Link>
    </nav>
  );
};

const Header = () => (
  <header className="glass-card rounded-none border-x-0 border-t-0 py-4 px-6 flex justify-between items-center sticky top-0 z-40">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center font-serif font-bold text-aurum-black text-xl neon-glow">A</div>
      <h1 className="font-serif text-2xl font-bold tracking-tight text-white">AURUM</h1>
    </div>
    <div className="flex items-center gap-4">
      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gold">
        <div className="w-2 h-2 bg-gold rounded-full animate-pulse neon-glow" />
        Live
      </div>
    </div>
  </header>
);

// --- Pages ---

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        if (isRegister) {
          setIsRegister(false);
          toast.success('Registration successful! Please login.');
        } else {
          if (data.user.role === 'admin') {
            toast.error('Please use the Admin Login portal');
            return;
          }
          login(data.token, data.user);
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-aurum-black text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-aurum-red/20 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 glass-card p-8 relative z-10"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg neon-glow">
            <Coins className="text-aurum-black" size={32} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Aurum Gold</h2>
          <p className="text-white/50 mt-2 text-sm">{isRegister ? 'Create your customer account' : 'Customer Sign In'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full gold-gradient text-aurum-black font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity mt-4 uppercase tracking-widest"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-white/50">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-gold font-bold hover:underline uppercase tracking-widest text-[10px]"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
          <div className="pt-4 border-t border-white/10">
            <Link to="/admin/login" className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-aurum-red transition-colors">
              Are you an Admin? Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.user.role !== 'admin') {
          toast.error('Access denied. Admin only portal.');
          return;
        }
        login(data.token, data.user);
        toast.success('Admin access granted');
        navigate('/admin');
      } else {
        toast.error(data.error || 'Invalid admin credentials');
      }
    } catch (e) {
      toast.error('Network error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-aurum-black text-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-aurum-red/20 rounded-full blur-[100px]" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 glass-card p-8 border-aurum-red/30 relative z-10"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-aurum-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,51,102,0.3)]">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Aurum Admin</h2>
          <p className="text-white/50 mt-2 text-sm">Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-aurum-red transition-colors text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Security Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-aurum-red transition-colors text-white"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full red-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity mt-4 uppercase tracking-widest"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-gold transition-colors">
            Back to Customer Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const [prices, setPrices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/prices').then(res => res.ok ? res.json() : []).then(setPrices).catch(() => {});
    fetch('/api/user/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setTransactions).catch(() => {});
  }, []);

  if (!user) return null;

  const currentPrices = prices.reduce((acc, p) => ({ ...acc, [p.metal_type]: p.price_per_gram }), {});
  
  const totalInvestment = transactions
    .filter(t => t.type === 'buy' && t.status === 'completed')
    .reduce((acc, t) => acc + t.amount_in_currency, 0);

  const currentPortfolioValue = 
    user.gold_999_balance * (currentPrices['gold_999'] || 0) +
    user.gold_916_balance * (currentPrices['gold_916'] || 0) +
    user.silver_balance * (currentPrices['silver'] || 0);

  const totalProfit = currentPortfolioValue - totalInvestment;
  const profitPercentage = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

  return (
    <div className="pb-24 min-h-screen bg-aurum-black text-white">
      <Header />
      <main className="p-6 space-y-6">
        {/* Balance Card */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="red-gradient rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Current Portfolio Value</p>
            <h2 className="text-4xl font-bold mt-1 font-serif">
              ₹{currentPortfolioValue.toLocaleString('en-IN')}
            </h2>
            
            <div className="mt-4 flex items-center gap-2">
              <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${totalProfit >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {totalProfit >= 0 ? <ArrowUpRight size={12} /> : <TrendingUp size={12} className="rotate-180" />}
                {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')} ({profitPercentage.toFixed(2)}%)
              </div>
              <span className="text-white/50 text-[10px] uppercase font-bold tracking-widest">Total Appreciation</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <p className="text-[10px] text-white/60 uppercase">24K Gold</p>
                <p className="font-bold">{user.gold_999_balance.toFixed(3)}g</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-white/60 uppercase">22K Gold</p>
                <p className="font-bold">{user.gold_916_balance.toFixed(3)}g</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-white/60 uppercase">Silver</p>
                <p className="font-bold">{user.silver_balance.toFixed(2)}g</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Savings Card */}
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="bg-gold text-aurum-black p-3 rounded-xl neon-glow">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Smart Savings</p>
            <p className="text-sm text-white/80 font-medium mt-1">You've saved <span className="font-bold text-gold neon-text">₹{Math.max(0, totalProfit).toLocaleString('en-IN')}</span> through gold appreciation!</p>
          </div>
        </div>

        {/* Live Prices */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-serif text-xl font-bold">Live Market Prices</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Updated just now</p>
          </div>
          <div className="grid gap-3">
            {prices.map((price) => (
              <div key={price.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${price.metal_type.includes('gold') ? 'bg-gold/10 text-gold' : 'bg-white/10 text-white/70'}`}>
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{price.metal_type === 'gold_999' ? '24K Gold (999)' : price.metal_type === 'gold_916' ? '22K Gold (916)' : 'Silver (999)'}</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest">Per Gram</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gold">₹{price.price_per_gram.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-green-400 flex items-center justify-end gap-0.5 font-bold">
                    <ArrowUpRight size={10} /> +0.45%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-xl font-bold">Your Transactions</h3>
            <Link to="/profile" className="text-xs text-gold font-bold uppercase tracking-widest">View All</Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 3).map(t => (
              <div key={t.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.type === 'buy' ? <Plus size={16} /> : <Store size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-white/70 tracking-wider">{t.type} {t.metal_type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-white/40">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{t.amount_in_grams}g</p>
                  {t.amount_in_currency && <p className="text-[10px] text-white/50">₹{t.amount_in_currency.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-8 glass-card border-dashed">
                <p className="text-sm text-white/50">No transactions yet. Start your gold journey today!</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link to="/buy" className="gold-gradient p-4 rounded-2xl flex flex-col items-center gap-2 shadow-lg">
            <div className="bg-aurum-black text-gold p-2 rounded-full">
              <Plus size={20} />
            </div>
            <span className="text-sm font-bold text-aurum-black uppercase tracking-widest">Buy Gold</span>
          </Link>
          <Link to="/redeem" className="glass-card p-4 flex flex-col items-center gap-2">
            <div className="bg-white/10 text-white p-2 rounded-full">
              <Store size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Redeem</span>
          </Link>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

const BuyGold = () => {
  const { user, token, refreshUser } = useAuth();
  const [prices, setPrices] = useState<any[]>([]);
  const [selectedMetal, setSelectedMetal] = useState('gold_999');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/prices').then(res => res.ok ? res.json() : []).then(setPrices).catch(() => {});
  }, []);

  const currentPrice = prices.find(p => p.metal_type === selectedMetal)?.price_per_gram || 0;
  const grams = amount ? (parseFloat(amount) / currentPrice).toFixed(4) : '0.0000';

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });
      const order = await orderRes.json();

      // 2. Open Razorpay (Mocking for this environment as we can't load external scripts easily without setup)
      // In real app, you'd load Razorpay script and call Checkout
      toast.loading('Redirecting to Payment Gateway...');
      
      setTimeout(async () => {
        // Mocking success
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            razorpay_order_id: order.id,
            razorpay_payment_id: 'pay_mock_' + Date.now(),
            metal_type: selectedMetal,
            grams: parseFloat(grams),
            amount: parseFloat(amount)
          })
        });

        if (verifyRes.ok) {
          toast.dismiss();
          toast.success('Purchase Successful!');
          await refreshUser();
          navigate('/');
        }
        setLoading(false);
      }, 2000);

    } catch (e) {
      toast.error('Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-aurum-black text-white">
      <Header />
      <main className="p-6 space-y-6">
        <h2 className="font-serif text-2xl font-bold">Buy Digital Gold</h2>
        
        <div className="space-y-4">
          <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Select Metal Type</label>
          <div className="grid grid-cols-3 gap-2">
            {prices.map(p => (
              <button
                key={p.metal_type}
                onClick={() => setSelectedMetal(p.metal_type)}
                className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  selectedMetal === p.metal_type 
                    ? 'border-gold bg-gold/10 text-gold neon-glow' 
                    : 'border-white/10 glass-card text-white/50'
                }`}
              >
                {p.metal_type === 'gold_999' ? '24K Gold' : p.metal_type === 'gold_916' ? '22K Gold' : 'Silver'}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Enter Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-white/5 rounded-2xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-gold/20 border border-white/10 text-white"
              />
            </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gold/5 rounded-2xl border border-gold/20">
            <div>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Estimated Weight</p>
              <p className="text-xl font-bold text-white neon-text">{grams} <span className="text-sm font-normal text-white/50">grams</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Live Price</p>
              <p className="font-bold text-gold">₹{currentPrice}/g</p>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading || !amount}
            className="w-full gold-gradient text-aurum-black font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Processing...' : 'Proceed to Pay'}
          </button>
        </div>

        <div className="glass-card p-4 text-[10px] text-white/50 leading-relaxed">
          * Prices are inclusive of GST. Digital gold is stored in secure vaults and can be redeemed at our offline store anytime.
        </div>
      </main>
      <Navbar />
    </div>
  );
};

const RedeemGold = () => {
  const { user, token, refreshUser } = useAuth();
  const [selectedMetal, setSelectedMetal] = useState('gold_999');
  const [grams, setGrams] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRedeem = async () => {
    if (!grams || parseFloat(grams) <= 0) {
      toast.error('Enter valid weight');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ metal_type: selectedMetal, grams: parseFloat(grams) })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Redemption request sent!');
        await refreshUser();
        navigate('/');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pb-24 min-h-screen bg-aurum-black text-white">
      <Header />
      <main className="p-6 space-y-6">
        <h2 className="font-serif text-2xl font-bold">Redeem at Store</h2>
        <p className="text-sm text-white/50">Exchange your digital gold for physical jewelry or coins at our offline store.</p>

        <div className="glass-card p-6 space-y-4">
          <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Available Balance</p>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-2xl border transition-all ${selectedMetal === 'gold_999' ? 'border-gold bg-gold/10 neon-glow' : 'border-white/10'}`} onClick={() => setSelectedMetal('gold_999')}>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">24K Gold</p>
              <p className="font-bold text-gold">{user.gold_999_balance.toFixed(3)}g</p>
            </div>
            <div className={`p-3 rounded-2xl border transition-all ${selectedMetal === 'gold_916' ? 'border-gold bg-gold/10 neon-glow' : 'border-white/10'}`} onClick={() => setSelectedMetal('gold_916')}>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">22K Gold</p>
              <p className="font-bold text-gold">{user.gold_916_balance.toFixed(3)}g</p>
            </div>
            <div className={`p-3 rounded-2xl border transition-all ${selectedMetal === 'silver' ? 'border-gold bg-gold/10 neon-glow' : 'border-white/10'}`} onClick={() => setSelectedMetal('silver')}>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Silver</p>
              <p className="font-bold text-white">{user.silver_balance.toFixed(2)}g</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Weight to Redeem (grams)</label>
            <input 
              type="number" 
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="0.000"
              className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-2xl font-bold focus:outline-none focus:border-aurum-red transition-colors text-white"
            />
          </div>

          <div className="p-4 bg-aurum-red/10 rounded-2xl border border-aurum-red/20">
            <p className="text-[10px] text-aurum-red font-bold uppercase tracking-widest mb-1">Store Instructions</p>
            <p className="text-[10px] text-white/50 leading-relaxed">Visit our store with your ID proof. Making charges and taxes will be applicable on physical jewelry as per store rates.</p>
          </div>

          <button 
            onClick={handleRedeem}
            disabled={loading || !grams}
            className="w-full red-gradient text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Processing...' : 'Generate Redemption Code'}
          </button>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#E3FF00', '#FF3366', '#00F0FF', '#FFB800'];

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prices, setPrices] = useState<any>({ gold_999: 0, gold_916: 0, silver: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetch('/api/prices').then(res => res.ok ? res.json() : []).then(data => {
      const p = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.metal_type]: curr.price_per_gram }), {});
      setPrices(p);
    }).catch(() => {});
    
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : null).then(setStats).catch(() => {});

    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setUsers).catch(() => {});

    fetch('/api/admin/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setTransactions).catch(() => {});
  }, []);

  const updatePrice = async (metal: string, price: number) => {
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ metal_type: metal, price_per_gram: price })
      });
      if (res.ok) {
        setPrices({ ...prices, [metal]: price });
        toast.success('Price updated');
      }
    } catch (e) {
      toast.error('Failed to update price');
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      }
    } catch (e) {
      toast.error('Failed to fetch user details');
    }
  };

  const updateTransactionStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
        toast.success('Status updated');
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-gold text-aurum-black font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  if (user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-aurum-black text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <Shield className="text-aurum-black" size={16} />
            </div>
            <span className="font-serif font-bold text-lg">Admin Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="users" icon={Users} label="Customers" />
          <SidebarItem id="transactions" icon={History} label="Transactions" />
          <SidebarItem id="reports" icon={TrendingUp} label="Reports" />
          <SidebarItem id="orders" icon={Store} label="Sell Orders" />
          <SidebarItem id="settings" icon={Settings} label="Settings" />
          
          <div className="pt-8 mt-8 border-t border-white/5">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-aurum-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={16} className="text-white/70" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              A
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Price Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['gold_999', 'gold_916', 'silver'].map(metal => (
                  <div key={metal} className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Coins size={48} />
                    </div>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">{metal.replace('_', ' ')} Price</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-white">₹</span>
                      <input 
                        type="number" 
                        value={prices[metal] || ''}
                        onChange={(e) => updatePrice(metal, parseFloat(e.target.value))}
                        className="bg-transparent text-3xl font-bold text-gold focus:outline-none w-32 border-b border-white/10 focus:border-gold"
                      />
                      <span className="text-white/50 text-sm mb-1">/gm</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Inventory Overview</h3>
                    <div className="space-y-4">
                      {stats.metalDistribution.map((m: any) => (
                        <div key={m.metal_type} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <span className="uppercase text-xs font-bold tracking-widest text-white/70">{m.metal_type.replace('_', ' ')}</span>
                          <span className="text-gold font-bold">{m.total_grams.toFixed(3)}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((t: any) => (
                        <div key={t.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                          <div>
                            <p className="text-white font-medium">{t.type.toUpperCase()} - {t.metal_type.replace('_', ' ')}</p>
                            <p className="text-white/30 text-xs">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gold text-aurum-black rounded-lg text-sm font-bold">
                  <Filter size={16} /> Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Holdings (Gold/Silver)</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-white/70">{u.email}</td>
                        <td className="px-6 py-4 text-white/50">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-gold text-xs">{(u.gold_999_balance + u.gold_916_balance).toFixed(3)}g</span>
                            <span className="text-white/50 text-[10px]">{u.silver_balance.toFixed(2)}g Ag</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => fetchUserDetails(u.id)}
                            className="px-3 py-1 bg-white/10 hover:bg-gold hover:text-aurum-black rounded text-xs font-bold transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg">All Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Metal</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Payment Ref</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/70">
                          <div>
                            <p className="font-bold text-xs">{t.user_name}</p>
                            <p className="text-[10px] text-white/30">#{t.user_id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 uppercase font-bold text-xs">{t.type}</td>
                        <td className="px-6 py-4 uppercase text-xs tracking-wider">{t.metal_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono">{t.amount_in_grams}g</td>
                        <td className="px-6 py-4 font-mono text-gold">₹{t.amount_in_currency || 0}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-white/50">{t.payment_id || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {t.status}
                            </span>
                            {t.status !== 'completed' && (
                              <button 
                                onClick={() => updateTransactionStatus(t.id, 'completed')}
                                className="p-1 hover:bg-white/10 rounded text-gold"
                                title="Mark as Completed"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && stats && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-6">Inventory Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.metalDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="metal_type" tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Bar dataKey="total_grams" fill="#E3FF00" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-6">Sales Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.dailyVolume}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" hide />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Line type="monotone" dataKey="volume" stroke="#FF3366" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.metalDistribution.map((m: any) => (
                  <div key={m.metal_type} className="glass-card p-6 border-l-4 border-gold">
                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{m.metal_type.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold">{m.total_grams.toFixed(3)}g</p>
                    <p className="text-gold font-bold mt-2">₹{m.total_value.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg">Pending Redemptions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Metal</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.filter(t => t.type === 'redeem' && t.status === 'pending_at_store').map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/70">{t.user_name}</td>
                        <td className="px-6 py-4 uppercase text-xs">{t.metal_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono">{t.amount_in_grams}g</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => updateTransactionStatus(t.id, 'completed')}
                            className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                          >
                            <Check size={14} /> Mark Completed
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.type === 'redeem' && t.status === 'pending_at_store').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-white/30 italic">No pending redemptions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-bold text-sm">Maintenance Mode</p>
                      <p className="text-xs text-white/50">Disable all customer transactions</p>
                    </div>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-bold text-sm">Price Auto-Update</p>
                      <p className="text-xs text-white/50">Sync prices with global market every 5 mins</p>
                    </div>
                    <div className="w-12 h-6 bg-gold rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-aurum-black rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">Admin Security</h3>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-colors">
                  Change Admin Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
              <h2 className="text-xl font-bold font-serif">Customer Details</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Profile Header */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                  <UserIcon size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.user.name}</h3>
                  <p className="text-white/50">{selectedUser.user.email}</p>
                  <p className="text-white/30 text-xs mt-1">Joined: {new Date(selectedUser.user.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Holdings */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Current Holdings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] uppercase text-white/50">24K Gold</p>
                    <p className="text-xl font-bold text-gold">{selectedUser.user.gold_999_balance.toFixed(4)}g</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] uppercase text-white/50">22K Gold</p>
                    <p className="text-xl font-bold text-gold">{selectedUser.user.gold_916_balance.toFixed(4)}g</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="text-[10px] uppercase text-white/50">Silver</p>
                    <p className="text-xl font-bold text-white">{selectedUser.user.silver_balance.toFixed(4)}g</p>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Transaction History</h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Metal</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedUser.transactions.map((t: any) => (
                        <tr key={t.id}>
                          <td className="px-4 py-3 text-white/50">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 uppercase font-bold text-xs">{t.type}</td>
                          <td className="px-4 py-3 uppercase text-xs">{t.metal_type.replace('_', ' ')}</td>
                          <td className="px-4 py-3">{t.amount_in_grams}g</td>
                          <td className="px-4 py-3 text-gold">₹{t.amount_in_currency}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const Profile = () => {
  const { user, token, logout } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetch('/api/prices').then(res => res.ok ? res.json() : []).then(setPrices).catch(() => {});
      fetch('/api/user/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.ok ? res.json() : []).then(setTransactions).catch(() => {});
    }
  }, [token]);

  if (!user) return null;

  const currentPrices = prices.reduce((acc, p) => ({ ...acc, [p.metal_type]: p.price_per_gram }), {});

  return (
    <div className="pb-24 min-h-screen bg-aurum-black text-white">
      <Header />
      <main className="p-6 space-y-6">
        <div className="flex flex-col items-center py-8 space-y-4">
          <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center text-gold neon-glow">
            <UserIcon size={48} />
          </div>
          <div className="text-center">
            <h2 className="font-serif text-2xl font-bold">{user.name}</h2>
            <p className="text-white/50 text-sm">{user.email}</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-full uppercase tracking-widest">
                {user.role}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-widest">
                Saved ₹{Math.max(0, (
                  user.gold_999_balance * (currentPrices['gold_999'] || 0) +
                  user.gold_916_balance * (currentPrices['gold_916'] || 0) +
                  user.silver_balance * (currentPrices['silver'] || 0)
                ) - transactions.filter(t => t.type === 'buy' && t.status === 'completed').reduce((acc, t) => acc + t.amount_in_currency, 0)).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <section className="space-y-4">
          <h3 className="font-serif text-xl font-bold">Full Transaction History</h3>
          <div className="space-y-3">
            {transactions.map(t => (
              <div key={t.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.type === 'buy' ? <Plus size={16} /> : <Store size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-white/70 tracking-wider">{t.type} {t.metal_type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-white/40">{new Date(t.created_at).toLocaleString()}</p>
                    <p className="text-[8px] text-white/30 font-mono mt-1">ID: {t.payment_id || 'REDEEM-' + t.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{t.amount_in_grams}g</p>
                  {t.amount_in_currency && (
                    <p className="text-[10px] text-white/50">
                      ₹{t.amount_in_currency.toLocaleString('en-IN')}
                      {t.type === 'buy' && (
                        <span className={`ml-1 font-bold ${((t.amount_in_grams * (currentPrices[t.metal_type] || 0)) - t.amount_in_currency) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ({((t.amount_in_grams * (currentPrices[t.metal_type] || 0)) - t.amount_in_currency) >= 0 ? '+' : ''}
                          {(((t.amount_in_grams * (currentPrices[t.metal_type] || 0)) - t.amount_in_currency) / t.amount_in_currency * 100).toFixed(1)}%)
                        </span>
                      )}
                    </p>
                  )}
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-2">
          <button className="w-full glass-card p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Store size={20} className="text-white/50" />
              <span className="font-medium">Store Locator</span>
            </div>
            <ChevronRight size={16} className="text-white/30" />
          </button>
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full bg-aurum-red/10 p-4 rounded-2xl border border-aurum-red/20 flex justify-between items-center text-aurum-red mt-4 transition-colors hover:bg-aurum-red/20"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span className="font-bold">Logout</span>
            </div>
          </button>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

const CustomerLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-md mx-auto min-h-screen bg-aurum-black shadow-2xl relative text-white">
    {children}
  </div>
);

const AppContent = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurum-black">
        <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center font-serif font-bold text-aurum-black text-3xl neon-glow animate-pulse">A</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!token ? <CustomerLayout><CustomerLogin /></CustomerLayout> : <Navigate to={user?.role === 'admin' ? '/admin' : '/'} />} />
      <Route path="/admin/login" element={!token ? <CustomerLayout><AdminLogin /></CustomerLayout> : <Navigate to="/admin" />} />

      {/* Customer Routes */}
      <Route path="/" element={token && user?.role === 'customer' ? <CustomerLayout><Dashboard /></CustomerLayout> : <Navigate to="/login" />} />
      <Route path="/buy" element={token && user?.role === 'customer' ? <CustomerLayout><BuyGold /></CustomerLayout> : <Navigate to="/login" />} />
      <Route path="/redeem" element={token && user?.role === 'customer' ? <CustomerLayout><RedeemGold /></CustomerLayout> : <Navigate to="/login" />} />
      
      {/* Admin Routes - Full Screen */}
      <Route path="/admin" element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
      <Route path="/admin/inventory" element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />
      <Route path="/admin/reports" element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} />

      {/* Shared Routes */}
      <Route path="/profile" element={token ? <CustomerLayout><Profile /></CustomerLayout> : <Navigate to="/login" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-aurum-black shadow-2xl relative text-white">
          <AppContent />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Coins, 
  TrendingUp, 
  Plus, 
  Store, 
  ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const [prices, setPrices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/prices').then(res => res.ok ? res.json() : []).then(setPrices).catch(() => {});
    fetch('/api/user/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setTransactions).catch(() => {});
  }, [token]);

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
    <div className="pb-24 min-h-screen bg-background text-white selection:bg-brand-primary/30">
      <Header />
      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        {/* Portfolio Hero */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="brand-gradient rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden neon-glow-primary"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Net Worth</p>
                <h2 className="text-5xl font-extrabold mt-2 tracking-tight">
                  ₹{currentPortfolioValue.toLocaleString('en-IN')}
                </h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${totalProfit >= 0 ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'}`}>
                {totalProfit >= 0 ? <ArrowUpRight size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
              </div>
              <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Total Growth</span>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">24K Gold</p>
                <p className="text-lg font-bold mt-1">{user.gold_999_balance.toFixed(3)}<span className="text-xs font-normal opacity-60 ml-0.5">g</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">22K Gold</p>
                <p className="text-lg font-bold mt-1">{user.gold_916_balance.toFixed(3)}<span className="text-xs font-normal opacity-60 ml-0.5">g</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Silver</p>
                <p className="text-lg font-bold mt-1">{user.silver_balance.toFixed(2)}<span className="text-xs font-normal opacity-60 ml-0.5">g</span></p>
              </div>
            </div>
          </div>
          
          {/* Abstract background shapes for engagement */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-brand-secondary/20 rounded-full blur-3xl" />
        </motion.div>

        {/* Quick Actions Bento */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/buy" className="glass-card p-6 flex flex-col justify-between h-40 group relative overflow-hidden">
            <div className="bg-brand-primary/20 text-brand-primary p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Plus size={24} />
            </div>
            <div>
              <p className="text-lg font-bold">Buy Assets</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Invest Now</p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-brand-primary/5 group-hover:text-brand-primary/10 transition-colors">
              <Coins size={100} />
            </div>
          </Link>
          <Link to="/redeem" className="glass-card p-6 flex flex-col justify-between h-40 group relative overflow-hidden">
            <div className="bg-brand-secondary/20 text-brand-secondary p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Store size={24} />
            </div>
            <div>
              <p className="text-lg font-bold">Redeem</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mt-1">Cash Out</p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-brand-secondary/5 group-hover:text-brand-secondary/10 transition-colors">
              <Store size={100} />
            </div>
          </Link>
        </div>

        {/* Live Market - Modern List */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold tracking-tight">Live Market</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Live</span>
            </div>
          </div>
          <div className="space-y-4">
            {prices.map((price) => (
              <motion.div 
                key={price.id} 
                whileHover={{ x: 4 }}
                className="glass-card p-5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${price.metal_type.includes('gold') ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                    <Coins size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-base">{price.metal_type === 'gold_999' ? '24K Gold' : price.metal_type === 'gold_916' ? '22K Gold' : 'Pure Silver'}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Market Price</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-white">₹{price.price_per_gram.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-bold mt-1">
                    <ArrowUpRight size={12} /> +0.45%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold tracking-tight">Recent Activity</h3>
            <Link to="/profile" className="text-[10px] text-brand-primary font-bold uppercase tracking-widest hover:underline">See All</Link>
          </div>
          <div className="space-y-4">
            {transactions.slice(0, 3).map(t => (
              <div key={t.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {t.type === 'buy' ? <Plus size={18} /> : <Store size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize">{t.type} {t.metal_type.replace('_', ' ')}</p>
                    <p className="text-[10px] text-white/30 font-medium">{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{t.amount_in_grams}g</p>
                  {t.amount_in_currency && <p className="text-[10px] text-white/40">₹{t.amount_in_currency.toLocaleString('en-IN')}</p>}
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 glass-card border-dashed border-white/10">
                <p className="text-sm text-white/30">No transactions yet. Start investing!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

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

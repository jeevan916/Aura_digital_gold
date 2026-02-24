import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Plus, 
  Store, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';

export const Profile = () => {
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

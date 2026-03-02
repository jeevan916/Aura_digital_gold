import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';
import { ArrowLeft, Store, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const RedeemGold = () => {
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
        toast.error(data.error || 'Redemption failed');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-background text-white selection:bg-brand-primary/30">
      <Header />
      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Physical Redemption</h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Convert digital assets to physical form</p>
        </div>
        
        <div className="glass-card p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <Store size={120} />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Select Asset</label>
            <div className="grid grid-cols-3 gap-3">
              {['gold_999', 'gold_916', 'silver'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMetal(m)}
                  className={`py-4 rounded-2xl text-xs font-black transition-all border-2 uppercase tracking-widest ${
                    selectedMetal === m 
                      ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary shadow-lg neon-glow-secondary' 
                      : 'border-white/5 bg-white/[0.02] text-white/30'
                  }`}
                >
                  {m === 'gold_999' ? '24K Gold' : m === 'gold_916' ? '22K Gold' : 'Silver'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end mb-1 ml-1">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Weight to Redeem (g)</label>
              <span className="text-[10px] text-brand-secondary font-black uppercase tracking-widest">Balance: {user?.[`${selectedMetal}_balance` as keyof typeof user]?.toFixed(4)}g</span>
            </div>
            <input 
              type="number" 
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="0.0000"
              className="w-full px-6 py-6 bg-white/[0.03] rounded-3xl text-4xl font-black focus:outline-none focus:border-brand-secondary border-2 border-white/5 text-white transition-all placeholder:text-white/10"
            />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRedeem}
            disabled={loading || !grams}
            className="w-full brand-gradient-secondary text-white font-black py-6 rounded-3xl shadow-2xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm neon-glow-secondary"
          >
            {loading ? 'Processing...' : 'Request Store Pickup'}
          </motion.button>
        </div>

        <div className="glass-card p-8 space-y-6">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-secondary">Redemption Protocol</h4>
          <div className="space-y-4">
            {[
              { step: '01', text: 'Submit your redemption request through the app.' },
              { step: '02', text: 'Visit our flagship AURUM store with a valid government ID.' },
              { step: '03', text: 'Present your unique redemption ID to the store concierge.' },
              { step: '04', text: 'Receive your physical assets after biometric verification.' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <span className="text-brand-secondary font-black text-xs mt-0.5">{item.step}</span>
                <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

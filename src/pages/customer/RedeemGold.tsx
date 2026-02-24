import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';

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
    <div className="pb-24 min-h-screen bg-aurum-black text-white">
      <Header />
      <main className="p-6 space-y-6">
        <h2 className="font-serif text-2xl font-bold">Redeem at Store</h2>
        
        <div className="glass-card p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Select Metal to Redeem</label>
            <div className="grid grid-cols-3 gap-2">
              {['gold_999', 'gold_916', 'silver'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMetal(m)}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                    selectedMetal === m 
                      ? 'border-gold bg-gold/10 text-gold neon-glow' 
                      : 'border-white/10 bg-white/5 text-white/50'
                  }`}
                >
                  {m === 'gold_999' ? '24K Gold' : m === 'gold_916' ? '22K Gold' : 'Silver'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest">Weight to Redeem (g)</label>
              <span className="text-[10px] text-gold font-bold">Available: {user?.[`${selectedMetal}_balance` as keyof typeof user]?.toFixed(4)}g</span>
            </div>
            <input 
              type="number" 
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="0.0000"
              className="w-full px-4 py-4 bg-white/5 rounded-2xl text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-gold/20 border border-white/10 text-white"
            />
          </div>

          <button 
            onClick={handleRedeem}
            disabled={loading || !grams}
            className="w-full bg-white text-aurum-black font-bold py-4 rounded-2xl shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50 uppercase tracking-widest"
          >
            {loading ? 'Processing...' : 'Request Redemption'}
          </button>
        </div>

        <div className="glass-card p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-gold">How it works?</h4>
          <ol className="text-[10px] text-white/50 space-y-2 list-decimal ml-4">
            <li>Submit your redemption request online.</li>
            <li>Visit our nearest AURUM store with your ID.</li>
            <li>Show your redemption ID to the store manager.</li>
            <li>Collect your physical gold/silver after verification.</li>
          </ol>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

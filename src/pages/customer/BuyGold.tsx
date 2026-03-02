import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';
import { ArrowLeft, Wallet, TrendingUp, ShieldCheck, Coins } from 'lucide-react';
import { motion } from 'motion/react';

export const BuyGold = () => {
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

      // 2. Open Razorpay (Mocking for this environment)
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
    <div className="pb-24 min-h-screen bg-background text-white selection:bg-brand-primary/30">
      <Header />
      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Invest in Assets</h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Secure your future with digital gold</p>
        </div>
        
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Choose Asset</label>
          <div className="grid grid-cols-3 gap-3">
            {prices.map(p => (
              <button
                key={p.metal_type}
                onClick={() => setSelectedMetal(p.metal_type)}
                className={`py-4 rounded-2xl text-xs font-black transition-all border-2 uppercase tracking-widest ${
                  selectedMetal === p.metal_type 
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary shadow-lg neon-glow-primary' 
                    : 'border-white/5 glass-card text-white/30'
                }`}
              >
                {p.metal_type === 'gold_999' ? '24K Gold' : p.metal_type === 'gold_916' ? '22K Gold' : 'Silver'}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <Coins size={120} />
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Investment Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 text-2xl font-black">₹</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-6 py-6 bg-white/[0.03] rounded-3xl text-4xl font-black focus:outline-none focus:border-brand-primary border-2 border-white/5 text-white transition-all placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="flex justify-between items-center p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
            <div>
              <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest mb-1">Estimated Weight</p>
              <p className="text-2xl font-black text-white">{grams} <span className="text-xs font-medium text-white/30 ml-1 uppercase">grams</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-1">Live Rate</p>
              <p className="font-black text-brand-primary text-lg">₹{currentPrice}/g</p>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={loading || !amount}
            className="w-full brand-gradient text-white font-black py-6 rounded-3xl shadow-2xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm neon-glow-primary"
          >
            {loading ? 'Processing...' : 'Confirm Investment'}
          </motion.button>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] text-[10px] text-white/30 leading-relaxed font-medium uppercase tracking-widest text-center">
          * Prices include GST. Assets are stored in certified vaults and can be redeemed at our store anytime.
        </div>
      </main>
      <Navbar />
    </div>
  );
};

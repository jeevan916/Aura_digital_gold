import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';

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

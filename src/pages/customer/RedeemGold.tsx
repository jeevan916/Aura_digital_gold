import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Navbar } from '../../components/layout/Navbar';
import { Store, QrCode, ShieldCheck, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const RedeemGold = () => {
  const { user, token, refreshUser } = useAuth();
  const [selectedMetal, setSelectedMetal] = useState('gold_999');
  const [amountType, setAmountType] = useState<'grams' | 'rupees'>('rupees');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'init' | 'otp'>('init');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If navigated from QR scan, we might have params, but for now just show the UI
    const params = new URLSearchParams(location.search);
    if (params.get('metal')) setSelectedMetal(params.get('metal')!);
  }, [location]);

  const handleInitiate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/redeem/initiate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          metal_type: selectedMetal, 
          amount_type: amountType,
          amount: parseFloat(amount) 
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Security code sent to your WhatsApp!');
        setStep('otp');
      } else {
        toast.error(data.error || 'Failed to initiate redemption');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!otp || otp.length < 4) {
      toast.error('Enter valid security code');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/redeem/confirm', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          metal_type: selectedMetal, 
          amount_type: amountType,
          amount: parseFloat(amount),
          otp: otp
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment successful!');
        await refreshUser();
        navigate('/');
      } else {
        toast.error(data.error || 'Verification failed');
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
          <h2 className="text-3xl font-black tracking-tight">QR Pay & Redeem</h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Pay at store using your digital wallet</p>
        </div>
        
        <AnimatePresence mode="wait">
          {step === 'init' ? (
            <motion.div 
              key="init"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                <QrCode size={120} />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Select Wallet</label>
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

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1 ml-1">
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Amount Type</label>
                  <span className="text-[10px] text-brand-secondary font-black uppercase tracking-widest">Balance: {user?.[`${selectedMetal}_balance` as keyof typeof user]?.toFixed(4)}g</span>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl">
                  <button
                    onClick={() => setAmountType('rupees')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${amountType === 'rupees' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                  >
                    Rupees (₹)
                  </button>
                  <button
                    onClick={() => setAmountType('grams')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${amountType === 'grams' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                  >
                    Grams (g)
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">
                  Enter Amount ({amountType === 'rupees' ? '₹' : 'g'})
                </label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-6 py-6 bg-white/[0.03] rounded-3xl text-4xl font-black focus:outline-none focus:border-brand-secondary border-2 border-white/5 text-white transition-all placeholder:text-white/10"
                />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInitiate}
                disabled={loading || !amount}
                className="w-full brand-gradient-secondary text-white font-black py-6 rounded-3xl shadow-2xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm neon-glow-secondary flex items-center justify-center gap-3"
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-8 space-y-8 relative overflow-hidden text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="text-[#25D366]" size={40} />
              </div>
              
              <h3 className="text-2xl font-black tracking-tight">Security Verification</h3>
              <p className="text-white/50 text-sm">
                We've sent a security code to your registered WhatsApp number. Please enter it below to confirm your payment.
              </p>

              <div className="space-y-4 max-w-xs mx-auto">
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter Code"
                  className="w-full px-6 py-4 bg-white/[0.03] rounded-2xl text-2xl font-black focus:outline-none focus:border-[#25D366] border-2 border-white/5 text-white transition-all placeholder:text-white/10 text-center tracking-[0.5em]"
                  maxLength={6}
                />
              </div>

              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  disabled={loading || !otp}
                  className="w-full bg-[#25D366] text-black font-black py-5 rounded-2xl shadow-xl hover:brightness-110 transition-all disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                >
                  {loading ? 'Verifying...' : 'Confirm Payment'}
                </motion.button>
                
                <button 
                  onClick={() => setStep('init')}
                  className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel & Go Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-card p-8 space-y-6">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-secondary">Payment Protocol</h4>
          <div className="space-y-4">
            {[
              { step: '01', text: 'Scan the store QR code or select Pay from the app.' },
              { step: '02', text: 'Choose the wallet you want to deduct from.' },
              { step: '03', text: 'Enter the amount in Rupees or Grams.' },
              { step: '04', text: 'Verify the transaction with the code sent to your WhatsApp.' }
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

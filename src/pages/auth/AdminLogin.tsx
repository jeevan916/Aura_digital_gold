import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-white relative overflow-hidden selection:bg-brand-primary/30">
      {/* Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md space-y-10 glass-card p-10 border-white/5 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center mx-auto shadow-2xl neon-glow-primary rotate-3">
            <TrendingUp className="text-white" size={40} />
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tighter">AURUM<span className="text-brand-primary">.</span>ADMIN</h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">System Authentication Required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Admin Identifier</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aurum.com"
              className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-brand-primary transition-all text-white font-medium placeholder:text-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Security Key</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-brand-primary transition-all text-white font-medium placeholder:text-white/10"
              required
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full brand-gradient text-white font-black py-5 rounded-2xl shadow-2xl hover:brightness-110 transition-all mt-4 uppercase tracking-[0.2em] text-sm neon-glow-primary"
          >
            Access Terminal
          </motion.button>
        </form>

        <div className="pt-6 text-center">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-brand-primary transition-colors"
          >
            Return to Customer Portal
          </button>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
        Secure Environment Alpha-7
      </div>
    </div>
  );
};

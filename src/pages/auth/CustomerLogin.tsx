import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CustomerLogin = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-white relative overflow-hidden selection:bg-brand-primary/30">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md space-y-10 glass-card p-10 relative z-10 shadow-2xl border-white/10"
      >
        <div className="text-center">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="brand-gradient w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-2xl neon-glow-primary"
          >
            <Coins className="text-white" size={40} strokeWidth={2.5} />
          </motion.div>
          <h2 className="text-4xl font-black tracking-tighter text-white">AURUM<span className="text-brand-primary">.</span></h2>
          <p className="text-white/40 mt-3 text-sm font-medium uppercase tracking-[0.2em]">{isRegister ? 'Join the future of gold' : 'Welcome back, Investor'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white placeholder:text-white/20"
                placeholder="Enter your name"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white placeholder:text-white/20"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-brand-primary focus:bg-white/[0.05] transition-all text-white placeholder:text-white/20"
              placeholder="••••••••"
              required
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full brand-gradient text-white font-black py-5 rounded-2xl shadow-2xl hover:brightness-110 transition-all mt-6 uppercase tracking-[0.2em] text-sm neon-glow-primary"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </motion.button>
        </form>

        <div className="text-center space-y-6">
          <p className="text-xs text-white/40 font-medium">
            {isRegister ? 'Already have an account?' : "New to Aurum?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand-primary font-black hover:text-brand-secondary transition-colors uppercase tracking-widest ml-1"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
          <div className="pt-8 border-t border-white/5">
            <Link to="/admin/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-white/20 hover:text-brand-secondary transition-colors">
              Access Admin Portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

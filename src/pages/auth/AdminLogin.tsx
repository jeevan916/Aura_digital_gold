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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-aurum-black text-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-aurum-red/20 rounded-full blur-[100px]" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 glass-card p-8 border-aurum-red/30 relative z-10"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-aurum-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,51,102,0.3)]">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Aurum Admin</h2>
          <p className="text-white/50 mt-2 text-sm">Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Admin Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-aurum-red transition-colors text-white"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Security Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-aurum-red transition-colors text-white"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-aurum-red text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity mt-4 uppercase tracking-widest"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};

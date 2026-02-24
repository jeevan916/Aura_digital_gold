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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-aurum-black text-white relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-aurum-red/20 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 glass-card p-8 relative z-10"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg neon-glow">
            <Coins className="text-aurum-black" size={32} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Aurum Gold</h2>
          <p className="text-white/50 mt-2 text-sm">{isRegister ? 'Create your customer account' : 'Customer Sign In'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
                placeholder="John Doe"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold transition-colors text-white"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full gold-gradient text-aurum-black font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity mt-4 uppercase tracking-widest"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-white/50">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => setIsRegister(!isRegister)}
              className="text-gold font-bold hover:underline uppercase tracking-widest text-[10px]"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
          <div className="pt-4 border-t border-white/10">
            <Link to="/admin/login" className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-aurum-red transition-colors">
              Are you an Admin? Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

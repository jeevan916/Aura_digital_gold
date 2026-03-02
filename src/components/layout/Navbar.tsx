import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Coins, 
  TrendingUp, 
  User as UserIcon, 
  Plus, 
  Store 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  if (user.role === 'admin') {
    return (
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card px-8 py-4 flex justify-around items-center z-50 shadow-2xl border-white/10">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Dash</span>
        </Link>
        <Link to="/admin/inventory" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
          <Coins size={22} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Prices</span>
        </Link>
        <Link to="/admin/reports" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
          <TrendingUp size={22} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Stats</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
          <UserIcon size={22} />
          <span className="text-[10px] font-bold tracking-widest uppercase">Admin</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md glass-card px-8 py-4 flex justify-between items-center z-50 shadow-2xl border-white/10">
      <Link to="/" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
        <LayoutDashboard size={22} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Home</span>
      </Link>
      <Link to="/buy" className="flex flex-col items-center gap-1 group">
        <div className="brand-gradient text-white rounded-2xl p-3 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all neon-glow-primary -mt-8">
          <Plus size={24} strokeWidth={3} />
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase mt-1 text-brand-primary">Invest</span>
      </Link>
      <Link to="/redeem" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-secondary transition-all hover:scale-110">
        <Store size={22} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Redeem</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1 text-white/40 hover:text-brand-primary transition-all hover:scale-110">
        <UserIcon size={22} />
        <span className="text-[10px] font-bold tracking-widest uppercase">Me</span>
      </Link>
    </nav>
  );
};

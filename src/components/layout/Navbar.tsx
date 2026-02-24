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
      <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-none border-x-0 border-b-0 px-6 py-4 flex justify-around items-center z-50">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Dash</span>
        </Link>
        <Link to="/admin/inventory" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <Coins size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Prices</span>
        </Link>
        <Link to="/admin/reports" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <TrendingUp size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Reports</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
          <UserIcon size={24} />
          <span className="text-[10px] font-medium tracking-widest uppercase">Profile</span>
        </Link>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card rounded-none border-x-0 border-b-0 px-6 py-4 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <Link to="/" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Home</span>
      </Link>
      <Link to="/buy" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <div className="bg-gold text-aurum-black rounded-full p-2 neon-glow">
          <Plus size={24} />
        </div>
        <span className="text-[10px] font-medium tracking-widest uppercase mt-1">Buy</span>
      </Link>
      <Link to="/redeem" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <Store size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Redeem</span>
      </Link>
      <Link to="/profile" className="flex flex-col items-center gap-1 text-white/50 hover:text-gold transition-colors">
        <UserIcon size={24} />
        <span className="text-[10px] font-medium tracking-widest uppercase">Profile</span>
      </Link>
    </nav>
  );
};

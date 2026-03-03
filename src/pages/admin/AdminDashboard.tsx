import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  TrendingUp, 
  Store, 
  Settings, 
  LogOut, 
  Shield, 
  X, 
  Menu, 
  Bell, 
  Search, 
  Filter, 
  Check,
  User as UserIcon,
  Coins,
  RefreshCw,
  Plus,
  Minus,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [prices, setPrices] = useState<any>({ gold_999: 0, gold_916: 0, silver: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [manualTx, setManualTx] = useState({ type: 'manual_credit', metal_type: 'gold_999', amount: '', notes: '' });
  const [editUser, setEditUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rawPriceData, setRawPriceData] = useState<any>(null);
  const [showRawModal, setShowRawModal] = useState(false);

  const fetchRawData = async () => {
    try {
      const res = await fetch('/api/admin/raw-price-data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRawPriceData(data.raw);
      }
    } catch (e) {}
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices');
      if (res.ok) {
        const data = await res.json();
        const p = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.metal_type]: curr.price_per_gram }), {});
        setPrices(p);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPrices();
    
    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : null).then(setStats).catch(() => {});

    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setUsers).catch(() => {});

    fetch('/api/admin/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.ok ? res.json() : []).then(setTransactions).catch(() => {});
  }, [token]);

  const updatePrice = async (metal: string, price: number) => {
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ metal_type: metal, price_per_gram: price })
      });
      if (res.ok) {
        setPrices({ ...prices, [metal]: price });
        toast.success('Price updated');
      }
    } catch (e) {
      toast.error('Failed to update price');
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      }
    } catch (e) {
      toast.error('Failed to fetch user details');
    }
  };

  const updateTransactionStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTransactions(transactions.map(t => t.id === id ? { ...t, status } : t));
        toast.success('Status updated');
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleManualTransaction = async () => {
    if (!selectedUser || !manualTx.amount) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.user.id}/manual-transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: manualTx.type,
          metal_type: manualTx.metal_type,
          amount_in_grams: parseFloat(manualTx.amount),
          notes: manualTx.notes
        })
      });
      if (res.ok) {
        toast.success('Transaction successful');
        fetchUserDetails(selectedUser.user.id);
        setManualTx({ ...manualTx, amount: '', notes: '' });
      }
    } catch (e) {
      toast.error('Transaction failed');
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editUser)
      });
      if (res.ok) {
        toast.success('User updated');
        fetchUserDetails(editUser.id);
        setEditUser(null);
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const refreshLivePrices = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/refresh-live-prices', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('Prices synced with Sagar Jewellers');
        setRawPriceData(data.raw);
        fetchPrices();
      } else {
        toast.error('Failed to sync live prices');
      }
    } catch (e) {
      toast.error('Network error while syncing prices');
    } finally {
      setIsRefreshing(false);
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${activeTab === id ? 'brand-gradient text-white font-bold shadow-lg neon-glow-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} />
      <span className="text-sm tracking-tight">{label}</span>
    </button>
  );

  if (user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-background text-white flex selection:bg-brand-primary/30">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface/50 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="brand-gradient w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl neon-glow-primary">
              <Shield className="text-white" size={20} />
            </div>
            <span className="font-black text-xl tracking-tighter">AURUM<span className="text-brand-primary">.</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-3 overflow-y-auto h-[calc(100vh-100px)]">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 ml-2">Main Menu</div>
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" />
          <SidebarItem id="users" icon={Users} label="Customers" />
          <SidebarItem id="transactions" icon={History} label="Ledger" />
          <SidebarItem id="reports" icon={TrendingUp} label="Analytics" />
          <SidebarItem id="orders" icon={Store} label="Redemptions" />
          <SidebarItem id="qrpay" icon={QrCode} label="QR Pay" />
          <SidebarItem id="settings" icon={Settings} label="System" />
          
          <div className="pt-10 mt-10 border-t border-white/5">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/[0.05] px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-black tracking-tight capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">System Live</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold">{user.name}</p>
                <p className="text-[10px] text-white/30 font-medium">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-2xl brand-gradient flex items-center justify-center text-white font-black shadow-lg">
                {user.name[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              {/* Key Metrics Bento */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                        <Users size={24} />
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">+12%</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Users</p>
                    <p className="text-3xl font-black mt-1">{stats.totalUsers}</p>
                    <div className="absolute -right-4 -bottom-4 text-brand-primary/5 group-hover:text-brand-primary/10 transition-colors">
                      <Users size={80} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-brand-secondary/10 rounded-2xl text-brand-secondary">
                        <TrendingUp size={24} />
                      </div>
                      <span className="text-white/20 text-xs font-bold">Live</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Revenue</p>
                    <p className="text-3xl font-black mt-1">₹{stats.totalSales.toLocaleString('en-IN')}</p>
                    <div className="absolute -right-4 -bottom-4 text-brand-secondary/5 group-hover:text-brand-secondary/10 transition-colors">
                      <TrendingUp size={80} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <History size={24} />
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">Active</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Today's Volume</p>
                    <p className="text-3xl font-black mt-1">₹{stats.todaySales.toLocaleString('en-IN')}</p>
                    <div className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors">
                      <History size={80} />
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="glass-card p-6 relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                        <LayoutDashboard size={24} />
                      </div>
                      <span className="text-white/20 text-xs font-bold">Weekly</span>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Weekly Sales</p>
                    <p className="text-3xl font-black mt-1">₹{stats.weekSales.toLocaleString('en-IN')}</p>
                    <div className="absolute -right-4 -bottom-4 text-amber-500/5 group-hover:text-amber-500/10 transition-colors">
                      <LayoutDashboard size={80} />
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Price Management Section */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Market Control</h3>
                    <p className="text-xs text-white/30 font-medium">Manage live asset pricing and API sync</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { fetchRawData(); setShowRawModal(true); }}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black border border-white/10 transition-all uppercase tracking-widest"
                    >
                      Raw Data
                    </button>
                    <button 
                      onClick={refreshLivePrices}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 px-5 py-2.5 brand-gradient text-white rounded-2xl text-xs font-black shadow-lg transition-all disabled:opacity-50 uppercase tracking-widest neon-glow-primary"
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                      {isRefreshing ? 'Syncing...' : 'Sync Prices'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['gold_999', 'gold_916', 'silver'].map(metal => (
                    <div key={metal} className="glass-card p-8 group relative overflow-hidden">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${metal.includes('gold') ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'}`}>
                          <Coins size={24} />
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{metal.replace('_', ' ')}</p>
                          <p className="font-black text-lg">Live Rate</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white/20">₹</span>
                        <input 
                          type="number" 
                          value={prices[metal] || ''}
                          onChange={(e) => updatePrice(metal, parseFloat(e.target.value))}
                          className="bg-transparent text-4xl font-black text-white focus:outline-none w-full border-b-2 border-white/5 focus:border-brand-primary transition-colors pb-2"
                        />
                        <span className="text-white/20 text-xs font-bold">/gm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Overview */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Inventory Overview</h3>
                    <div className="space-y-4">
                      {stats.metalDistribution.map((m: any) => (
                        <div key={m.metal_type} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <span className="uppercase text-xs font-bold tracking-widest text-white/70">{m.metal_type.replace('_', ' ')}</span>
                          <span className="text-gold font-bold">{m.total_grams.toFixed(3)}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((t: any) => (
                        <div key={t.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0">
                          <div>
                            <p className="text-white font-medium">{t.type.toUpperCase()} - {t.metal_type.replace('_', ' ')}</p>
                            <p className="text-white/30 text-xs">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-card overflow-hidden border-white/[0.05]">
              <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name, email or ID..." 
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-white/10"
                  />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10">
                  <Filter size={16} /> Advanced Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-white/20 uppercase text-[10px] font-black tracking-[0.2em]">
                      <th className="px-8 py-5">Customer Profile</th>
                      <th className="px-8 py-5">Onboarding</th>
                      <th className="px-8 py-5">Portfolio Value</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-sm">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-black text-sm text-white group-hover:text-brand-primary transition-colors">{u.name}</p>
                              <p className="text-xs text-white/30 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-white/60">{new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-0.5">Verified Account</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-brand-primary font-black text-sm">₹{((u.gold_999_balance + u.gold_916_balance) * (prices.gold_999 || 0)).toLocaleString('en-IN')}</span>
                            <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">{(u.gold_999_balance + u.gold_916_balance).toFixed(3)}g Total Assets</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => fetchUserDetails(u.id)}
                            className="px-5 py-2.5 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="glass-card overflow-hidden border-white/[0.05]">
              <div className="p-6 border-b border-white/[0.05] bg-white/[0.02] flex justify-between items-center">
                <h3 className="text-xl font-black tracking-tight">Financial Ledger</h3>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                    <Search size={18} className="text-white/40" />
                  </button>
                  <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                    <Filter size={18} className="text-white/40" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/[0.02] text-white/20 uppercase text-[10px] font-black tracking-[0.2em]">
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Entity</th>
                      <th className="px-8 py-5">Operation</th>
                      <th className="px-8 py-5">Asset Class</th>
                      <th className="px-8 py-5">Volume</th>
                      <th className="px-8 py-5">Valuation</th>
                      <th className="px-8 py-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-white/60">{new Date(t.created_at).toLocaleDateString()}</p>
                          <p className="text-[10px] text-white/20 font-black mt-0.5">{new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-xs text-white group-hover:text-brand-primary transition-colors">{t.user_name}</p>
                          <p className="text-[10px] text-white/20 font-medium">ID: #{t.user_id}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${t.type.includes('buy') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black uppercase tracking-widest text-white/60">{t.metal_type.replace('_', ' ')}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-white">{t.amount_in_grams}g</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-brand-primary">₹{t.amount_in_currency?.toLocaleString('en-IN') || 0}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                              {t.status}
                            </span>
                            {t.status !== 'completed' && (
                              <button 
                                onClick={() => updateTransactionStatus(t.id, 'completed')}
                                className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-400 transition-all border border-emerald-500/20"
                                title="Approve Transaction"
                              >
                                <Check size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && stats && (
            <div className="space-y-10">
              {/* Analytics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.metalDistribution.map((m: any) => (
                  <motion.div 
                    key={m.metal_type} 
                    whileHover={{ scale: 1.02 }}
                    className="glass-card p-8 border-l-4 border-brand-primary relative overflow-hidden group"
                  >
                    <div className="absolute -right-6 -bottom-6 text-brand-primary/5 group-hover:text-brand-primary/10 transition-colors">
                      <Coins size={120} />
                    </div>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{m.metal_type.replace('_', ' ')} Performance</p>
                    <p className="text-3xl font-black">₹{m.total_value.toLocaleString('en-IN')}</p>
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Total Weight</p>
                        <p className="text-sm font-black text-brand-primary">{m.total_grams.toFixed(3)}g</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl">
                        <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">Avg Yield</p>
                        <p className="text-sm font-black text-white">₹{(m.total_value / m.total_grams).toFixed(0)}/g</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-8">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-lg font-black tracking-tight">Inventory Distribution</h3>
                    <div className="px-4 py-1.5 bg-brand-primary/10 rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest">Live Assets</div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.metalDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="metal_type" 
                          tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} 
                          stroke="rgba(255,255,255,0.2)" 
                          tick={{ fontSize: 10, fontWeight: 900 }}
                        />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10, fontWeight: 900 }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                          contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#E3FF00', fontWeight: 900, fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}
                        />
                        <Bar dataKey="total_grams" fill="#E3FF00" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-lg font-black tracking-tight">Market Velocity</h3>
                    <div className="px-4 py-1.5 bg-brand-secondary/10 rounded-full text-[10px] font-black text-brand-secondary uppercase tracking-widest">30D Volume</div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.dailyVolume}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF3366" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FF3366" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="rgba(255,255,255,0.2)" 
                          tick={{fontSize: 10, fontWeight: 900}}
                          tickFormatter={(str) => new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        />
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10, fontWeight: 900}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0A0A0A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#FF3366', fontWeight: 900, fontSize: '12px' }}
                          labelStyle={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' }}
                        />
                        <Area type="monotone" dataKey="volume" stroke="#FF3366" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Inventory Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.metalDistribution.map((m: any) => (
                  <div key={m.metal_type} className="glass-card p-6 border-l-4 border-white/10">
                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">Current Inventory: {m.metal_type.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold">{m.total_grams.toFixed(3)}g</p>
                    <p className="text-white/30 text-xs mt-2">Estimated Value: ₹{m.total_value.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg">Redemption History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Metal</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.filter(t => t.type === 'redeem').map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/70">{t.user_name}</td>
                        <td className="px-6 py-4 uppercase text-xs">{t.metal_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono">{t.amount_in_grams}g</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                            t.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {t.status === 'pending_at_store' && (
                            <button 
                              onClick={() => updateTransactionStatus(t.id, 'completed')}
                              className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                            >
                              <Check size={14} /> Mark Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.type === 'redeem').length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-white/30 italic">No redemptions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'qrpay' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="glass-card p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 brand-gradient"></div>
                
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
                  <QrCode className="text-brand-primary" size={32} />
                </div>
                
                <h2 className="text-2xl font-black tracking-tight mb-2">Scan to Pay</h2>
                <p className="text-white/50 text-sm mb-8">
                  Customers can scan this QR code to initiate a redemption directly from their wallet.
                </p>
                
                <div className="bg-white p-6 rounded-3xl inline-block mx-auto shadow-2xl shadow-brand-primary/20 mb-8">
                  <QRCodeSVG 
                    value={`${window.location.origin}/redeem`} 
                    size={240}
                    level="H"
                    includeMargin={true}
                    fgColor="#000000"
                    bgColor="#FFFFFF"
                  />
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3">How it works</h4>
                  <ol className="space-y-3 text-sm text-white/50">
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Customer scans QR code with any scanner or camera.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>They select wallet and enter amount.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>They verify with WhatsApp OTP.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <span>Transaction completes and you receive a WhatsApp notification.</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-bold text-sm">Maintenance Mode</p>
                      <p className="text-xs text-white/50">Disable all customer transactions</p>
                    </div>
                    <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white/30 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="font-bold text-sm">Price Auto-Update</p>
                      <p className="text-xs text-white/50">Sync prices with global market every 5 mins</p>
                    </div>
                    <div className="w-12 h-6 bg-gold rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-aurum-black rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4">Admin Security</h3>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-colors">
                  Change Admin Password
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
              <h2 className="text-xl font-bold font-serif">Customer Details</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setEditUser(selectedUser.user)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors"
                >
                  Edit Profile
                </button>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Profile Header & Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                    <UserIcon size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedUser.user.name}</h3>
                    <p className="text-white/50">{selectedUser.user.email}</p>
                    <p className="text-white/30 text-xs mt-1">Joined: {new Date(selectedUser.user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="glass-card p-4 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase">Mobile</p>
                      <p>{selectedUser.user.mobile || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] uppercase">Alt Mobile</p>
                      <p>{selectedUser.user.alt_mobile || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-white/30 text-[10px] uppercase">Address</p>
                      <p className="text-xs">{selectedUser.user.address || 'No address provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats & Valuation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['gold_999', 'gold_916', 'silver'].map(metal => {
                  const balance = selectedUser.user[`${metal}_balance`];
                  const totalPurchased = selectedUser.stats[`total_${metal}_purchased`];
                  const avgCost = selectedUser.stats[`avg_cost_${metal}`];
                  const currentPrice = prices[metal] || 0;
                  const currentValue = balance * currentPrice;
                  const totalCost = totalPurchased * avgCost;
                  const profit = currentValue - (balance * avgCost);
                  const profitPercent = avgCost > 0 ? (profit / (balance * avgCost)) * 100 : 0;

                  return (
                    <div key={metal} className="glass-card p-4 border-l-4 border-gold">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">{metal.replace('_', ' ')}</p>
                        <span className="text-xs font-bold text-gold">{balance.toFixed(3)}g</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/30">Total Purchased</span>
                          <span>{totalPurchased.toFixed(3)}g</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/30">Avg Cost</span>
                          <span>₹{avgCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-white/30">Current Value</span>
                          <span className="text-gold font-bold">₹{currentValue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-[10px] pt-1 border-t border-white/5">
                          <span className="text-white/30">P/L</span>
                          <span className={`font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}₹{Math.abs(profit).toLocaleString('en-IN')} ({profitPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Manual Transaction Form */}
              <div className="glass-card p-6 border border-gold/20">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-4">Manual Wallet Adjustment</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select 
                    value={manualTx.type}
                    onChange={(e) => setManualTx({...manualTx, type: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="manual_credit">Credit (Add)</option>
                    <option value="manual_debit">Debit (Subtract)</option>
                  </select>
                  <select 
                    value={manualTx.metal_type}
                    onChange={(e) => setManualTx({...manualTx, metal_type: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  >
                    <option value="gold_999">24K Gold (999)</option>
                    <option value="gold_916">22K Gold (916)</option>
                    <option value="silver">Silver (999)</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Amount in grams"
                    value={manualTx.amount}
                    onChange={(e) => setManualTx({...manualTx, amount: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                  <button 
                    onClick={handleManualTransaction}
                    className="bg-gold text-aurum-black font-bold rounded-lg text-sm hover:bg-gold/80 transition-colors"
                  >
                    Apply Adjustment
                  </button>
                  <div className="md:col-span-4">
                    <input 
                      type="text" 
                      placeholder="Reason / Notes for this manual adjustment..."
                      value={manualTx.notes}
                      onChange={(e) => setManualTx({...manualTx, notes: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Full Transaction History</h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Metal</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Notes</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedUser.transactions.map((t: any) => (
                        <tr key={t.id}>
                          <td className="px-4 py-3 text-white/50">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 uppercase font-bold text-[10px]">
                            <span className={t.type.includes('credit') ? 'text-green-400' : t.type.includes('debit') ? 'text-red-400' : ''}>
                              {t.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 uppercase text-[10px]">{t.metal_type.replace('_', ' ')}</td>
                          <td className="px-4 py-3 font-mono">{t.amount_in_grams}g</td>
                          <td className="px-4 py-3 text-gold">₹{t.amount_in_currency || 0}</td>
                          <td className="px-4 py-3 text-[10px] text-white/40 max-w-xs truncate">{t.notes || t.payment_id || '-'}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-6">
            <h3 className="text-xl font-bold font-serif">Edit Customer Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-white/50 font-bold mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/50 font-bold mb-1 block">Email Address</label>
                <input 
                  type="email" 
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-1 block">Mobile</label>
                  <input 
                    type="text" 
                    value={editUser.mobile || ''}
                    onChange={(e) => setEditUser({...editUser, mobile: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-white/50 font-bold mb-1 block">Alt Mobile</label>
                  <input 
                    type="text" 
                    value={editUser.alt_mobile || ''}
                    onChange={(e) => setEditUser({...editUser, alt_mobile: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/50 font-bold mb-1 block">Address</label>
                <textarea 
                  value={editUser.address || ''}
                  onChange={(e) => setEditUser({...editUser, address: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setEditUser(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateUser}
                className="flex-1 py-3 bg-gold text-aurum-black rounded-xl text-sm font-bold hover:bg-gold/80 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw API Data Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold font-serif">Raw Sagar Jewellers API Data</h3>
              <button onClick={() => setShowRawModal(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="bg-black/50 rounded-xl p-4 overflow-auto max-h-[60vh]">
              <pre className="text-[10px] font-mono text-green-400">
                {rawPriceData ? JSON.stringify(rawPriceData, null, 2) : 'No data fetched yet. Click sync to fetch.'}
              </pre>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowRawModal(false)}
                className="px-6 py-2 bg-gold text-aurum-black rounded-xl text-sm font-bold hover:bg-gold/80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

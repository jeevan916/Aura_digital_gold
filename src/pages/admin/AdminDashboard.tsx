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
  Coins
} from 'lucide-react';
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

  useEffect(() => {
    fetch('/api/prices').then(res => res.ok ? res.json() : []).then(data => {
      const p = data.reduce((acc: any, curr: any) => ({ ...acc, [curr.metal_type]: curr.price_per_gram }), {});
      setPrices(p);
    }).catch(() => {});
    
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

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-gold text-aurum-black font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  if (user?.role !== 'admin') return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-aurum-black text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/5 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <Shield className="text-aurum-black" size={16} />
            </div>
            <span className="font-serif font-bold text-lg">Admin Panel</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="users" icon={Users} label="Customers" />
          <SidebarItem id="transactions" icon={History} label="Transactions" />
          <SidebarItem id="reports" icon={TrendingUp} label="Reports" />
          <SidebarItem id="orders" icon={Store} label="Sell Orders" />
          <SidebarItem id="settings" icon={Settings} label="Settings" />
          
          <div className="pt-8 mt-8 border-t border-white/5">
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-screen overflow-y-auto">
        <header className="sticky top-0 z-40 bg-aurum-black/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={16} className="text-white/70" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
              A
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Price Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['gold_999', 'gold_916', 'silver'].map(metal => (
                  <div key={metal} className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Coins size={48} />
                    </div>
                    <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">{metal.replace('_', ' ')} Price</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-white">₹</span>
                      <input 
                        type="number" 
                        value={prices[metal] || ''}
                        onChange={(e) => updatePrice(metal, parseFloat(e.target.value))}
                        className="bg-transparent text-3xl font-bold text-gold focus:outline-none w-32 border-b border-white/10 focus:border-gold"
                      />
                      <span className="text-white/50 text-sm mb-1">/gm</span>
                    </div>
                  </div>
                ))}
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
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search customers..." 
                    className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gold text-aurum-black rounded-lg text-sm font-bold">
                  <Filter size={16} /> Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Holdings (Gold/Silver)</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{u.name}</td>
                        <td className="px-6 py-4 text-white/70">{u.email}</td>
                        <td className="px-6 py-4 text-white/50">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-gold text-xs">{(u.gold_999_balance + u.gold_916_balance).toFixed(3)}g</span>
                            <span className="text-white/50 text-[10px]">{u.silver_balance.toFixed(2)}g Ag</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => fetchUserDetails(u.id)}
                            className="px-3 py-1 bg-white/10 hover:bg-gold hover:text-aurum-black rounded text-xs font-bold transition-colors"
                          >
                            View
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
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg">All Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Metal</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Payment Ref</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/70">
                          <div>
                            <p className="font-bold text-xs">{t.user_name}</p>
                            <p className="text-[10px] text-white/30">#{t.user_id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 uppercase font-bold text-xs">{t.type}</td>
                        <td className="px-6 py-4 uppercase text-xs tracking-wider">{t.metal_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono">{t.amount_in_grams}g</td>
                        <td className="px-6 py-4 font-mono text-gold">₹{t.amount_in_currency || 0}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-white/50">{t.payment_id || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {t.status}
                            </span>
                            {t.status !== 'completed' && (
                              <button 
                                onClick={() => updateTransactionStatus(t.id, 'completed')}
                                className="p-1 hover:bg-white/10 rounded text-gold"
                                title="Mark as Completed"
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
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-6">Inventory Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.metalDistribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="metal_type" tickFormatter={(v) => v.replace('_', ' ').toUpperCase()} stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Bar dataKey="total_grams" fill="#E3FF00" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-bold text-lg mb-6">Sales Performance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.dailyVolume}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="date" hide />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: '#050505', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                        <Line type="monotone" dataKey="volume" stroke="#FF3366" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.metalDistribution.map((m: any) => (
                  <div key={m.metal_type} className="glass-card p-6 border-l-4 border-gold">
                    <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{m.metal_type.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold">{m.total_grams.toFixed(3)}g</p>
                    <p className="text-gold font-bold mt-2">₹{m.total_value.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg">Pending Redemptions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 uppercase text-[10px] font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Metal</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.filter(t => t.type === 'redeem' && t.status === 'pending_at_store').map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white/50">{new Date(t.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-white/70">{t.user_name}</td>
                        <td className="px-6 py-4 uppercase text-xs">{t.metal_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-mono">{t.amount_in_grams}g</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => updateTransactionStatus(t.id, 'completed')}
                            className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-2"
                          >
                            <Check size={14} /> Mark Completed
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.filter(t => t.type === 'redeem' && t.status === 'pending_at_store').length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-white/30 italic">No pending redemptions</td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
    </div>
  );
};

import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';

// Auth Pages
import { CustomerLogin } from './pages/auth/CustomerLogin';
import { AdminLogin } from './pages/auth/AdminLogin';

// Customer Pages
import { Dashboard } from './pages/customer/Dashboard';
import { BuyGold } from './pages/customer/BuyGold';
import { RedeemGold } from './pages/customer/RedeemGold';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Shared Pages
import { Profile } from './pages/shared/Profile';

const AppContent = () => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurum-black">
        <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center font-serif font-bold text-aurum-black text-3xl neon-glow animate-pulse">A</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={!token ? <CustomerLayout><CustomerLogin /></CustomerLayout> : <Navigate to={user?.role === 'admin' ? '/admin' : '/'} />} 
      />
      <Route 
        path="/admin/login" 
        element={!token ? <CustomerLayout><AdminLogin /></CustomerLayout> : <Navigate to="/admin" />} 
      />

      {/* Customer Routes */}
      <Route 
        path="/" 
        element={token && user?.role === 'customer' ? <CustomerLayout><Dashboard /></CustomerLayout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/buy" 
        element={token && user?.role === 'customer' ? <CustomerLayout><BuyGold /></CustomerLayout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/redeem" 
        element={token && user?.role === 'customer' ? <CustomerLayout><RedeemGold /></CustomerLayout> : <Navigate to="/login" />} 
      />
      
      {/* Admin Routes - Full Screen */}
      <Route 
        path="/admin" 
        element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
      />
      <Route 
        path="/admin/inventory" 
        element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
      />
      <Route 
        path="/admin/reports" 
        element={token && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
      />

      {/* Shared Routes */}
      <Route 
        path="/profile" 
        element={token ? <CustomerLayout><Profile /></CustomerLayout> : <Navigate to="/login" />} 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-aurum-black shadow-2xl relative text-white">
          <AppContent />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

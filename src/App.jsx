import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Tactical Pages (Trifecta Brutalist Theme)
import Home from './pages/Home';
import Services from './pages/Services';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Order from './pages/Order';
import MixMyTrack from './pages/MixMyTrack';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import DemoDashboard from './pages/DemoDashboard';

// ─── Auth Guard ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Paid Access Guard (THE GATEKEEPER) ───────────────────────
function PaidRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // Admins always have access. Clients must have hasPaidMixMaster: true
  const isPaid = profile?.hasPaidMixMaster === true;
  const isAdmin = profile?.role === 'admin';
  
  if (!isPaid && !isAdmin) {
    return <Navigate to="/mix-master" replace />;
  }
  
  return children;
}

// ─── Admin Guard ─────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || profile.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const location = useLocation();
  const isFixedLayout = location.pathname === '/dashboard' || location.pathname === '/account';
  
  return (
    <div className={`flex flex-col text-white bg-black ${isFixedLayout ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isFixedLayout ? 'overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/services"      element={<Services />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          
          <Route path="/dashboard"     element={<PaidRoute><DemoDashboard /></PaidRoute>} />
          <Route path="/account"       element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/admin"         element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/order"         element={<ProtectedRoute><Order /></ProtectedRoute>} />
          <Route path="/mix-master"    element={<MixMyTrack />} />
          <Route path="/portfolio"     element={<Portfolio />} />
          <Route path="/contact"       element={<Contact />} />
          
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppShell() {
  return (
    <BrowserRouter>
       <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

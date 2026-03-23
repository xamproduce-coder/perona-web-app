// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root router and layout shell.
// Defines all routes and enforces auth guards.
// ─────────────────────────────────────────────────────────────

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages (lazy-loaded for performance)
import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Order       from './pages/Order';
import Dashboard   from './pages/Dashboard';
import Account     from './pages/Account';
import Admin       from './pages/Admin';
import MixMyTrack  from './pages/MixMyTrack';
import UploadHub   from './pages/UploadHub';

// ─── Auth Guard ──────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  // Temporary bypass for dashboard development
  if (window.location.pathname === '/dashboard') return children;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── App Shell ───────────────────────────────────────────────
function AppShell() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen text-white">
        <Navbar />
        <main className="flex-1 w-full">
          <Routes>
            {/* Public */}
            <Route path="/"              element={<Home />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/mix-my-track"  element={<MixMyTrack />} />

            {/* Artist Protected */}
            <Route path="/order"       element={<ProtectedRoute><Order /></ProtectedRoute>} />
            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/account"     element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/upload-hub"  element={<ProtectedRoute><UploadHub /></ProtectedRoute>} />

            {/* Admin Protected */}
            <Route path="/admin" element={
              <AdminRoute><Admin /></AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
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

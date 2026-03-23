// src/pages/Register.jsx
// ─────────────────────────────────────────────────────────────
// REGISTRATION PAGE: Capture artist info and create Firebase User + Profile.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createOrUpdateUser } from '../lib/db';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    artistName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ─── Handle Email/Password Register ────────────────────────
  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create Firebase User
      const { user } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // 2. Set Display Name (Firebase Auth Profile)
      await updateProfile(user, { displayName: formData.artistName });

      // 3. Create Firestore User Doc (The Law)
      await createOrUpdateUser(user.uid, {
        email: user.email,
        artistName: formData.artistName,
        role: 'artist',
        createdAt: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Google Register ───────────────────────────────
  const handleGoogleRegister = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // For Google users, create/update Firestore profile too
      await createOrUpdateUser(user.uid, {
        email: user.email,
        artistName: user.displayName || 'Anonymous Artist',
        role: 'artist', 
        createdAt: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="pt-24 min-h-screen flex items-baseline md:items-center mt-32 md:mt-0 justify-center p-6 bg-transparent">
      <div className="max-w-md w-full bg-[#101625]/60 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[#f26422] mb-2">Create Artist Account</h2>
        <p className="text-white/60 text-sm font-bold mb-8">Start your next professional mix today.</p>

        {error && <div className="mb-6 p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold">{error}</div>}

        <form onSubmit={handleEmailRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Stage/Artist Name"
            required
            className="w-full bg-[#050505] border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold focus:border-[#f26422] text-white placeholder-white/30 outline-none transition-all shadow-inner tracking-widest"
            value={formData.artistName}
            onChange={(e) => setFormData({...formData, artistName: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full bg-[#050505] border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold focus:border-[#f26422] text-white placeholder-white/30 outline-none transition-all shadow-inner tracking-widest"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-[#050505] border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold focus:border-[#f26422] text-white placeholder-white/30 outline-none transition-all shadow-inner tracking-widest"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-6 border border-[#f26422]"
            style={{ background: '#f26422', color: '#ffffff' }}
          >
            {loading ? 'Creating Account...' : 'Continue to Dashboard'}
          </button>
        </form>

        <div className="relative my-8 text-center text-xs text-white/40 uppercase font-black tracking-widest">
          <span className="bg-[#101625] px-3 z-10 relative">Or continue with</span>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10"></div>
        </div>

        <button 
          onClick={handleGoogleRegister}
          className="w-full py-4 rounded-xl text-sm font-black tracking-widest uppercase border border-white/20 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" />
          Google
        </button>

        <p className="mt-8 text-center text-xs font-bold text-white/50">
          Already have an account? <Link to="/login" className="text-[#f26422] hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

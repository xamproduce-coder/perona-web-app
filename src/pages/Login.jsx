// src/pages/Login.jsx
// ─────────────────────────────────────────────────────────────
// LOGIN PAGE: Authentication for returning artists.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createOrUpdateUser } from '../lib/db';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ─── Handle Email/Password Login ──────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Google Login ─────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Ensure Google user has a Firestore document (The Law)
      await createOrUpdateUser(user.uid, {
        email: user.email,
        artistName: user.displayName || 'Anonymous Artist',
        role: 'artist', // Default to artist; can be changed to admin by manual update in Firebase Console
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="pt-24 min-h-screen flex items-baseline md:items-center mt-32 md:mt-0 justify-center p-6 bg-transparent">
      <div className="max-w-md w-full bg-[#101625]/60 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl border border-white/10">
        <h2 className="text-3xl font-black uppercase tracking-widest text-[#f26422] mb-2">Back in the Studio?</h2>
        <p className="text-white/60 text-sm font-bold mb-8">Sign in to track your mixes and masters.</p>

        {error && <div className="mb-6 p-3 text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold">{error}</div>}

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all mt-4 border border-[#f26422]"
            style={{ background: '#f26422', color: '#ffffff' }}
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-8 text-center text-xs text-white/40 uppercase font-black tracking-widest">
          <span className="bg-[#101625] px-3 z-10 relative">Or continue with</span>
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 rounded-xl text-sm font-black tracking-widest uppercase border border-white/20 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" />
          Google
        </button>

        <p className="mt-8 text-center text-xs font-bold text-white/50">
          New to MAXM? <Link to="/register" className="text-[#f26422] hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

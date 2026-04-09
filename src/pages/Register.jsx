import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAILS } from '../lib/firebase';
import { createOrUpdateUser } from '../lib/db';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Sparkles, ArrowRight, Disc3 } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', artistName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(user, { displayName: formData.artistName });
      const role = ADMIN_EMAILS.includes(formData.email) ? 'admin' : 'artist';
      await createOrUpdateUser(user.uid, {
        email: user.email,
        artistName: formData.artistName,
        role: role,
        hasPaidMixMaster: false,
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard?view=upload');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'artist';
      await createOrUpdateUser(user.uid, {
        email: user.email,
        artistName: user.displayName || 'Anonymous Artist',
        role: role,
        hasPaidMixMaster: false,
        createdAt: new Date().toISOString(),
      });
      navigate('/dashboard?view=upload');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0A0A0A] text-white selection:bg-[#EF4444]/30">
      
      {/* Tactical Ambient Shadows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#EF4444]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[460px] w-full relative z-10"
      >
        <div className="perona-card p-10 flex flex-col bg-[#111111] border-white/5 shadow-2xl">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-[#EF4444] mb-6 shadow-2xl rounded-sm group hover:bg-[#EF4444] hover:text-black transition-all cursor-pointer">
              <Disc3 size={32} />
            </div>
            <h1 className="text-3xl font-display uppercase tracking-tight text-white mb-2 text-center">INITIALIZE IDENTITY.</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 text-center">Protocol V3.0 User Creation</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-8 p-4 text-[9px] font-black uppercase tracking-widest bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-6">
            <div className="space-y-4">
               <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#EF4444] transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="ARTIST NAME"
                    required
                    className="w-full !pl-14 bg-[#0A0A0A] border-white/5 text-[11px] font-black uppercase tracking-widest placeholder:text-white/10"
                    value={formData.artistName}
                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                  />
               </div>

               <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#EF4444] transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="PROTOCOL EMAIL"
                    required
                    className="w-full !pl-14 bg-[#0A0A0A] border-white/5 text-[11px] font-black uppercase tracking-widest placeholder:text-white/10"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
               </div>
               
               <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#EF4444] transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="ACCESS KEY (6+ CHARS)"
                    required
                    minLength={6}
                    className="w-full !pl-14 bg-[#0A0A0A] border-white/5 text-[11px] font-black uppercase tracking-widest placeholder:text-white/10"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-4 py-4 bg-[#EF4444] text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-red-950/20 ${loading ? 'opacity-50 saturate-0' : ''}`}
            >
              {loading ? 'INITIALIZING...' : 'ESTABLISH IDENTITY'}
              {!loading && <Sparkles size={14} />}
            </button>
          </form>

          <div className="relative my-8 text-center flex items-center justify-center">
            <div className="absolute w-full h-px bg-white/5" />
            <span className="relative z-10 px-6 bg-[#111111] text-[9px] font-black uppercase tracking-[0.6em] text-white/10">BRIDGE</span>
          </div>

          <button 
            onClick={handleGoogleRegister}
            className="w-full py-4 bg-[#0A0A0A] border border-white/5 text-[10px] font-black tracking-[0.3em] uppercase text-white/40 hover:text-white hover:border-[#EF4444]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 rounded-sm group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" alt="Google" />
            IDENTITY SYNC (GOOGLE)
          </button>

          <p className="mt-10 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
            ALREADY ESTABLISHED? <Link to="/login" className="text-[#EF4444] hover:text-white transition-colors ml-1">SIGN IN</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Calendar } from 'lucide-react';

export default function Account() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="pt-44 pb-24 min-h-screen px-6 max-w-2xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-black">Your Account</h2>
        <p className="text-black/60 mt-2">Manage your profile and studio preferences</p>
      </div>

      <div className="glass p-10 rounded-3xl border border-black/10 space-y-8 text-black">
        <div className="flex items-center gap-6 pb-8 border-b border-black/5">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-white uppercase border border-white/20">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              (profile?.artistName || user.displayName || user.email || 'A').slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black">{profile?.artistName || user.displayName || 'Artist'}</h3>
            <p className="text-black/50 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] text-black/40 uppercase tracking-widest font-bold flex items-center gap-2">
              <User size={12} /> Artist Name
            </label>
            <div className="p-4 bg-black/5 border border-black/10 rounded-2xl text-black">
              {profile?.artistName || 'Not set'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-black/40 uppercase tracking-widest font-bold flex items-center gap-2">
              <Mail size={12} /> Email Address
            </label>
            <div className="p-4 bg-black/5 border border-black/10 rounded-2xl text-black">
              {user.email}
            </div>
          </div>
        </div>

        <div className="pt-8">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-bold hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <LogOut size={18} />
            Sign Out of MAXM STUDIO
          </button>
        </div>
      </div>
    </div>
  );
}

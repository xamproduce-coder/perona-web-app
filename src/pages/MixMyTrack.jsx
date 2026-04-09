import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createOrUpdateUser } from '../lib/db';
import { CheckCircle, Music, Headphones, Download, ArrowRight, Lock, Sparkles } from 'lucide-react';

const PACKAGE = {
  name: 'Mix & Master',
  price: '£120',
  originalPrice: '£150',
  priceNote: 'Per Track · One-time (20% Off)',
  tagline: 'Collaborative mixing from stems to streaming.',
  features: [
    'Full professional mix (all stems)',
    'Mastered WAV + MP3 delivered',
    'Up to 2 revision rounds',
    'Consultation debrief call',
    'Delivered within 7 working days',
    'Private upload hub access',
  ],
  notIncluded: [
    'Recording session (book separately)',
    'Song arrangement or composition',
  ],
};

export default function MixMyTrack() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const alreadyPurchased = profile?.hasPaidMixMaster === true;

  // Initiate Project Flow (No upfront payment)
  const handleStartProject = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Unlock dashboard for this user (Portfolio Builder offer)
    try {
      await createOrUpdateUser(user.uid, { 
        hasPaidMixMaster: true,
        memberSince: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to unlock dashboard:', err);
      // Fallback: try to navigate anyway
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen text-[#0066FF] pt-28 pb-20 px-4 sm:px-8 relative">

      {/* Background glow */}
      <div className="fixed inset-0 -z-10 bg-white">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[50vw] h-[30vh] bg-[#1D4ED8]/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto">

        {/* Eyebrow */}
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0066FF]/30 mb-4">
          Service Package
        </p>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.85] mb-6">
          <span className="text-[#0066FF]">Mix &amp; </span>
          <span className="text-[#1D4ED8]">Master.</span>
        </h1>
        <p className="text-base text-[#0066FF]/50 font-medium max-w-lg mb-16 leading-relaxed">
          {PACKAGE.tagline} Start your project today, upload your stems for free, and only pay when your master is ready for delivery.
        </p>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left: What's included */}
          <div className="space-y-6">

            <div className="p-8 rounded-2xl border border-[#0066FF]/8 bg-white/[0.02] backdrop-blur-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0066FF]/30 mb-6">What's included</p>
              <ul className="space-y-4">
                {PACKAGE.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#1D4ED8] mt-0.5 shrink-0" />
                    <span className="text-sm font-bold text-[#0066FF]/80">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-[#0066FF]/5 bg-white/[0.01]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0066FF]/20 mb-4">Not included</p>
              <ul className="space-y-3">
                {PACKAGE.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="text-[#0066FF]/20 text-sm mt-0.5">–</span>
                    <span className="text-sm text-[#0066FF]/30">{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#0066FF]/30 mt-4 font-medium leading-relaxed">
                Need a recording session?{' '}
                <button
                  onClick={() => navigate('/services')}
                  className="text-[#1D4ED8] hover:underline font-bold"
                >
                  Book it separately →
                </button>
              </p>
            </div>

            {/* Visual flow */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Music size={20} />, label: 'Upload Stems', note: 'Private hub access' },
                { icon: <Headphones size={20} />, label: 'We Mix & Master', note: 'Within 7 days' },
                { icon: <Download size={20} />, label: 'Download Master', note: 'WAV + MP3' },
              ].map(({ icon, label, note }) => (
                <div key={label} className="p-5 rounded-xl border border-[#0066FF]/8 bg-white/[0.02] text-center flex flex-col items-center gap-2">
                  <div className="text-[#1D4ED8] opacity-70">{icon}</div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#0066FF]/70">{label}</p>
                  <p className="text-[10px] text-[#0066FF]/30 font-medium">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Purchase card (sticky) */}
          <div className="sticky top-28">
            <div className="p-8 rounded-2xl border border-[#0066FF]/10 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.5)]">

              <div className="relative mb-6">
                 <div className="absolute -top-3 -right-3 rotate-12 bg-[#7DD3FC] text-black text-[8px] font-black uppercase px-2 py-1 rounded shadow-xl animate-pulse z-10">
                    Free for portfolio
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1D4ED8] mb-2">Portfolio Builder Offer</p>
                 <div className="flex items-end gap-3 mb-1 opacity-40">
                   <p className="text-5xl font-black tracking-tighter text-[#0066FF] line-through">{PACKAGE.price}</p>
                   <p className="text-xl font-bold tracking-tighter text-[#0066FF]/30 line-through mb-1.5">{PACKAGE.originalPrice}</p>
                 </div>
                 <p className="text-2xl font-black tracking-[0.1em] text-[#1D4ED8] uppercase mt-1">Free / Voluntary</p>
              </div>
              <p className="text-xs text-[#0066FF]/40 font-bold mb-8 italic">No upfront costs for new clients.</p>

              {alreadyPurchased ? (
                <>
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircle size={14} className="text-green-400" />
                    <span className="text-xs font-black text-green-400 uppercase tracking-widest">Purchase Active</span>
                  </div>
                  <button
                    onClick={() => navigate('/upload-hub')}
                    className="w-full py-4 rounded-xl bg-[#1D4ED8] text-[#0066FF] font-black text-sm uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(29, 78, 216,0.3)]"
                  >
                    Go to Upload Hub <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  {!user && (
                    <p className="text-xs text-[#0066FF]/40 font-bold mb-4 flex items-center gap-2">
                      <Lock size={12} /> You'll be asked to sign in or create an account.
                    </p>
                  )}
                  <button
                    onClick={handleStartProject}
                    className="w-full py-4 rounded-xl bg-[#1D4ED8] text-[#0066FF] font-black text-sm uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(29, 78, 216,0.3)] mb-3"
                  >
                    Start Project <ArrowRight size={16} />
                  </button>
                  <p className="text-[10px] text-center text-[#0066FF]/25 font-bold tracking-widest">
                    Free Upload · Pay for Master
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

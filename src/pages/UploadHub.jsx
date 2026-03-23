import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StemUploader from '../components/upload/StemUploader';
import { Lock } from 'lucide-react';

export default function UploadHub() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Guard: must be logged in AND have paid
  if (!user) {
    return (
      <GateScreen
        icon={<Lock size={32} className="text-white/40" />}
        heading="Sign in to continue"
        sub="You need an account to access your upload hub."
        cta="Sign In"
        onCta={() => navigate('/login')}
      />
    );
  }

  if (!profile?.hasPaidMixMaster) {
    return (
      <GateScreen
        icon={<Lock size={32} className="text-[#f26422]/60" />}
        heading="Upload Hub is locked"
        sub="Purchase the Mix & Master package to unlock your private upload hub."
        cta="View Package — £150"
        onCta={() => navigate('/mix-my-track')}
        secondaryCta="Go to Dashboard"
        onSecondaryCta={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen text-white pt-28 pb-20 px-4 sm:px-8">
      <div className="fixed inset-0 -z-10 bg-[#050505]">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40vw] h-[25vh] bg-[#f26422]/8 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f26422] mb-3">Upload Hub</p>
        <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Your Stems.</h1>
        <p className="text-sm text-white/40 font-medium mb-10">
          Drop your project files below. We'll take it from here.
        </p>

        <StemUploader projectId={user.uid + '_project'} />

        <p className="mt-8 text-xs text-white/25 font-bold text-center uppercase tracking-widest">
          Accepted: WAV · AIFF · MP3 · FLAC · ZIP · Any DAW stems
        </p>
      </div>
    </div>
  );
}

function GateScreen({ icon, heading, sub, cta, onCta, secondaryCta, onSecondaryCta }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="fixed inset-0 -z-10 bg-[#050505]" />
      <div className="mb-6">{icon}</div>
      <h2 className="text-2xl font-black tracking-tight text-white mb-3">{heading}</h2>
      <p className="text-sm text-white/40 max-w-xs font-medium leading-relaxed mb-8">{sub}</p>
      <button
        onClick={onCta}
        className="px-8 py-3 rounded-full bg-[#f26422] text-white font-black text-sm uppercase tracking-[0.15em] hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(242,100,34,0.3)] mb-3"
      >
        {cta}
      </button>
      {secondaryCta && (
        <button
          onClick={onSecondaryCta}
          className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors"
        >
          {secondaryCta}
        </button>
      )}
    </div>
  );
}

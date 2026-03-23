import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dispatch = (mode) => {
    if (window.location.pathname !== '/') navigate('/');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: mode }));
    }, 50);
  };

  const scrollToAbout = () => {
    if (window.location.pathname !== '/') navigate('/');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: 'home' }));
      setTimeout(() => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 50);
  };

  const scrollToTop = () => {
    if (window.location.pathname !== '/') navigate('/');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: 'home' }));
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }, 50);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] flex justify-center pt-6 pointer-events-none">
      <nav className="pointer-events-auto relative flex items-center gap-3 pr-3 pl-12 py-2 rounded-full bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.8)] transition-all duration-500 hover:bg-[#111111]/90">

        {/* Logo replacing the diamond */}
        <button
          onClick={scrollToAbout}
          className="absolute -left-7 top-1/2 -translate-y-1/2 group transition-transform duration-500 hover:scale-[1.10] active:scale-95"
          aria-label="About"
          title="About Me"
        >
          <img src={logoImg} alt="MAXM Logo" className="w-[84px] h-[84px] object-contain brightness-[1.02] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
        </button>

        {/* Home icon */}
        <button
          onClick={scrollToTop}
          className="p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
          aria-label="Home"
          title="Scroll to Top"
        >
          <Home size={18} />
        </button>

        {/* Dashboard — the orange circle "●" with animating EQ */}
        <button
          onClick={() => dispatch('dashboard')}
          className="
            relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#f26422] to-[#ff8f59]
            flex items-center justify-center overflow-hidden group
            hover:scale-[1.12] active:scale-95 transition-all duration-300
            shadow-[0_0_20px_rgba(242,100,34,0.5)] hover:shadow-[0_0_30px_rgba(242,100,34,0.7)]
          "
          aria-label="Dashboard"
          title="My Dashboard"
        >
          {/* Inner dark circle to make EQ bars pop */}
          <div className="absolute inset-0 bg-black/10 rounded-full group-hover:bg-transparent transition-colors duration-300" />
          
          {/* the animating EQ bars */}
          <div className="relative flex justify-center items-end gap-[3px] h-[14px]">
            <div className="w-[3px] bg-white rounded-full animate-[eq_1.2s_ease-in-out_infinite_alternate] origin-bottom" style={{ height: '70%', animationDelay: '0s' }} />
            <div className="w-[3px] bg-white rounded-full animate-[eq_0.9s_ease-in-out_infinite_alternate] origin-bottom" style={{ height: '100%', animationDelay: '0.3s' }} />
            <div className="w-[3px] bg-white rounded-full animate-[eq_1.5s_ease-in-out_infinite_alternate] origin-bottom" style={{ height: '50%', animationDelay: '0.1s' }} />
          </div>
        </button>

        {/* Thin divider */}
        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* MIX MY TRACK — solid orange pill */}
        <button
          onClick={() => navigate('/mix-my-track')}
          className="
            px-6 py-2.5 rounded-full bg-gradient-to-r from-[#f26422] to-[#ff8f59] text-white
            text-xs font-black uppercase tracking-[0.15em]
            hover:scale-[1.05] hover:shadow-[0_10px_30px_rgba(242,100,34,0.5)]
            active:scale-95 transition-all duration-300
          "
        >
          Mix My Track
        </button>

        {/* RECORD WITH ME — outlined pill */}
        <button
          onClick={() => dispatch('booking')}
          className="
            px-6 py-2.5 rounded-full border border-[#D4AF37]/70 text-[#D4AF37]
            text-xs font-black uppercase tracking-[0.15em] relative overflow-hidden group
            hover:border-[#D4AF37] active:scale-95 transition-all duration-300
          "
        >
          <span className="relative z-10 group-hover:text-black transition-colors duration-300">Record With Me</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
        </button>

      </nav>

      {/* Inject custom keyframes for the EQ animation */}
      <style>{`
        @keyframes eq {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </header>
  );
}

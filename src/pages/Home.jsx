import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play, CheckCircle2, Disc3, Layers, Sliders, AudioLines, Flame, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Home() {
  const navigate = useNavigate();
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const navItems = [
    { label: 'Services', path: '/services', id: 'services' },
    { label: 'Dashboard', path: '/dashboard', id: 'dashboard' },
    { label: 'Account', path: '/account', id: 'account' }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0A0A0A] text-white font-body selection:bg-[#EF4444]/30 selection:text-white overflow-x-hidden">
      
      {/* ──────────────────────────────────────────────
          1. TRIFECTA BRUTALIST HERO (IMAGE VERSION)
          ────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        
        {/* Full Screen Studio Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/studio-hero.png" 
            alt="Studio Protocol" 
            className="w-full h-full object-cover grayscale brightness-[0.3] contrast-125"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.backgroundColor = '#0A0A0A';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/60" />
          <div className="absolute inset-0 bg-[#EF4444]/5 mix-blend-overlay" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Scaled Brutalist Typography */}
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
             className="max-w-fit mx-auto mb-20"
          >
            <h1 className="font-display font-black text-white leading-none text-[180px] md:text-[320px] tracking-tighter text-shadow-2xl">
              MAXM
            </h1>
          </motion.div>

          {/* Floating Glassmorphism Switch Nav */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 p-1 bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative"
          >
            {navItems.map((item) => (
              <Link 
                key={item.id}
                to={item.path} 
                onMouseEnter={() => setHoveredBtn(item.id)}
                onMouseLeave={() => setHoveredBtn(null)}
                className="relative px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center min-w-[180px] group overflow-hidden"
              >
                <span className={`relative z-10 transition-colors duration-300 ${hoveredBtn === item.id ? 'text-white' : 'text-white/30'}`}>
                  {item.label}
                </span>
                
                {hoveredBtn === item.id && (
                  <motion.div 
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 bg-white/10 border border-white/5 backdrop-blur-md rounded-full shadow-inner"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </motion.div>
        </div>

      </section>



      {/* ──────────────────────────────────────────────
          3. LOGO DATABASE
          ────────────────────────────────────────────── */}
      <section className="w-full py-12 border-y border-white/5 bg-[#0D0D0D] flex justify-center overflow-hidden mb-[140px]">
          <div className="flex items-center gap-20 md:gap-40 text-white/10 font-black uppercase tracking-[0.4em] text-[10px] whitespace-nowrap">
             <span>Apple Music</span>
             <span>Spotify Global</span>
             <span>Boiler Room</span>
             <span>BBC Radio 1</span>
             <span className="hidden md:inline">NTS Database</span>
             <span className="hidden lg:inline">SoundCloud Pro</span>
          </div>
      </section>

      {/* ──────────────────────────────────────────────
          4. ENGINEER PROFILE
          ────────────────────────────────────────────── */}
      <section className="w-full max-w-[1300px] mx-auto px-10 grid grid-cols-1 md:grid-cols-2 gap-[100px] items-center mb-[180px]">
         <div className="flex flex-col text-left">
            <div className="perona-icon-box mb-10"><Sparkles size={20} className="text-[#EF4444]" /></div>
            <h2 className="mb-10 max-w-lg text-[#EF4444]">ABOUT ME.</h2>
            <p className="text-white/40 text-sm mb-8 font-medium leading-relaxed uppercase tracking-wider">
              Specializing in high-fidelity vocal processing and tactical mastering. A decade of obsession with cultural soundscapes and distinct audio identities.
            </p>
            <div className="space-y-6 mb-12">
              {[
                "UK RAP / DRILL / TRAP EXPERT",
                "AFROBEATS & R&B SONICS",
                "ANALOGUE SIGNAL PATH INTEGRATION",
                "LOUDNESS COMPLIANCE MASTERING"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-white/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="font-black text-[10px] uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-[#EF4444] text-xs font-black uppercase tracking-[0.2em] italic border-l-2 border-[#EF4444] pl-6 py-1">
              "Tactical sound is not a choice, it is a protocol."
            </p>
         </div>
         <div className="aspect-[4/5] bg-[#111111] border border-white/5 rounded-2xl p-2 group transition-all duration-500 overflow-hidden relative shadow-2xl">
            <div className="w-full h-full border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden bg-[#0A0A0A]">
                <div className="absolute inset-0 bg-[#EF4444]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Disc3 size={100} className="text-white/[0.02] group-hover:text-[#EF4444]/10 transition-all duration-700" />
                <div className="absolute bottom-8 left-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Serial: #PRN-001X</span>
                </div>
            </div>
         </div>
      </section>

      {/* ──────────────────────────────────────────────
          5. SERVICE PRICE LEDGER
          ────────────────────────────────────────────── */}
      <section className="w-full bg-[#0D0D0D] py-[160px] px-10 border-t border-white/5 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#EF4444]/[0.02] blur-[120px] pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-[100px]">
             <h2 className="mb-6">PURE FIDELITY DATABASE.</h2>
             <p className="text-white/20 font-black text-[10px] uppercase tracking-[0.3em]">Transparent Studio Allocation. No hidden barriers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {[
              { 
                icon: <AudioLines />, 
                title: "MASTERING", 
                price: "£40", 
                desc: "Final architectural polish. Precision EQ, peak control, and competitive loudness mapping." 
              },
              { 
                icon: <Sliders />, 
                title: "MIX & MASTER", 
                price: "£140", 
                desc: "Full protocol execution. Vocal surgical reconstruction, dynamic mapping, and creative spatial FX." 
              },
              { 
                icon: <Layers />, 
                title: "STUDIO SESSION", 
                price: "£225 / 4H", 
                desc: "In-session performance capturing at our Brighton HQ. Real-time engineering feedback." 
              }
            ].map((s, i) => (
              <div key={i} className="perona-card text-left flex flex-col group cursor-pointer hover:border-[#EF4444]/40 bg-[#111111] p-10 min-h-[380px]">
                 <div className="perona-icon-box mb-12 group-hover:bg-[#EF4444] transition-all rounded-md">
                    {React.cloneElement(s.icon, { size: 18, className: "group-hover:text-black transition-colors" })}
                 </div>
                 <div className="flex justify-between items-baseline mb-8">
                    <h3 className="text-2xl font-display m-0 group-hover:text-[#EF4444] transition-colors">{s.title}</h3>
                 </div>
                 <p className="text-white/20 font-black uppercase text-[10px] tracking-widest leading-loose flex-1">{s.desc}</p>
                 <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-display font-black text-white/80">{s.price}</span>
                    <button className="text-[10px] font-black uppercase tracking-widest text-[#EF4444] opacity-0 group-hover:opacity-100 transition-opacity">Select →</button>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex justify-center">
             <button 
               onClick={() => navigate('/services')} 
               className="px-16 py-5 border border-white/10 rounded-md text-white/40 hover:text-white hover:border-[#EF4444]/40 font-black uppercase text-[10px] tracking-[0.4em] transition-all bg-white/[0.02]"
             >
               VIEW FULL PROTOCOL LIST
             </button>
          </div>
        </div>
      </section>

    </div>
  );
}

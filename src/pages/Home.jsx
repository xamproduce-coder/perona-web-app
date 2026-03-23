import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './Dashboard';
import BookingView from '../components/booking/BookingView';
import studioBg from '../assets/dim_studio_background.png';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('home');

  useEffect(() => {
    const handler = (e) => { if (e.detail) setActiveView(e.detail); };
    window.addEventListener('changeDashboardMode', handler);
    return () => window.removeEventListener('changeDashboardMode', handler);
  }, []);

  const dispatch = (mode) =>
    window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: mode }));

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">

      {/* ── DISCOUNT BANNER ───────────────────────── */}
      <div className="w-full bg-[#f26422] text-black py-2 z-50 relative flex items-center justify-center text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
          Welcome Offer — Take 20% Off All Mixing & Mastering
        </p>
      </div>

      {/* ── FIXED CINEMATIC BACKGROUND ───────────────────────── */}
      <AnimatePresence>
        {activeView === 'home' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 -z-20"
          >
            <img
              src={studioBg}
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-center"
              style={{ animation: 'slowZoom 25s ease-in-out infinite alternate' }}
            />
            {/* Vignette: heavier at top & bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]" />
            {/* Subtle orange glow at bottom matching studio warmth */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-[#f26422]/8 blur-[80px] rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed inset-0 -z-30 bg-[#050505]" />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — only visible on 'home' mode                      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeView === 'home' && (
        <>
          <main
            className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
          >
            {/* Eyebrow */}
            <p
              className="text-[10px] font-black uppercase tracking-[0.4em] text-white/35 mb-6"
              style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both' }}
            >
              London & Brighton · UK
            </p>

            {/* H1 */}
            <h1
              className="text-[15vw] sm:text-[11vw] lg:text-[9vw] font-black tracking-tighter leading-[0.82] mb-8"
              style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.22s both' }}
            >
              <span className="text-white/90 block">Sonically</span>
              <span className="text-white/90 block">Perfected.</span>
            </h1>

            {/* Trust line */}
            <p
              className="text-sm sm:text-base text-white/60 max-w-sm font-medium leading-relaxed mb-12"
              style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.36s both' }}
            >
              A collaborative mixing & mastering journey — we work together to bring your artistic vision to life.
            </p>

            {/* ─── PRIMARY CTA (auth-aware) ──────────────────── */}
            <div
              className="flex flex-col items-center gap-4"
              style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both' }}
            >
              {/* PRIMARY */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch('booking')}
                className="btn-premium btn-glow !px-12 !py-5 !text-xs !tracking-[0.25em]"
              >
                REQUEST PROJECT DATE
              </motion.button>

              {/* SECONDARY — context-aware */}
              {user ? (
                <button
                  onClick={() => dispatch('dashboard')}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f26422] hover:text-white transition-all underline underline-offset-8 decoration-orange-500/30"
                >
                  Go to My Dashboard →
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-[#f26422] transition-all underline underline-offset-8 decoration-white/10"
                >
                  CLIENT LOGIN ↓
                </button>
              )}
            </div>
          </main>

          {/* ─── PLATFORM FEATURES ──────────────────────────── */}
          <section className="relative px-6 sm:px-12 lg:px-16 pb-32 max-w-6xl mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            <div className="text-center mb-16" style={{ animation: 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.6s both' }}>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f26422] mb-4">Integrated Experience</p>
               <h2 className="text-2xl sm:text-3xl font-black text-white/90 tracking-tight">Your private mixing ecosystem.</h2>
               <p className="text-sm text-white/50 font-medium max-w-lg mx-auto mt-4 leading-relaxed">
                 We bypass messy email threads and expiring download links. MAXM operates as a full-scale client platform to keep your art secure and organized.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {[
                {
                  id: 'upload',
                  title: 'Private Upload Hub',
                  body: 'Bypass messy transfer links. Drop your uncompressed 48kHz WAV stems directly into your secure, high-speed vault.',
                },
                {
                  id: 'messaging',
                  title: 'Unified Comms',
                  body: "Discuss mix notes, vibe, and reference tracks effortlessly. You receive email alerts whenever a new message drops in your dashboard.",
                },
                {
                  id: 'audio',
                  title: 'Pro Revision Player',
                  body: 'Listen to every single mix iteration through our custom browser audio engine. Compare A/B states instantly with zero friction.',
                },
                {
                  id: 'delivery',
                  title: 'Master Delivery',
                  body: 'Your finalized, streaming-ready masters are stored securely forever. Download your WAVs & MP3s instantly when release day arrives.',
                },
              ].map(({ id, title, body }) => (
                <div
                  key={id}
                  className="flex flex-col p-8 rounded-[2rem] border border-white/10 bg-[#0a0a0a]/60 hover:bg-[#111111]/80 hover:border-white/20 transition-all duration-300 backdrop-blur-md group"
                >
                  <h3 className="text-xs font-black text-white/90 tracking-[0.1em] uppercase mb-4">{title}</h3>
                  <p className="text-xs text-white/50 font-bold leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── ABOUT SECTION ──────────────────────────── */}
          <div className="relative w-full bg-[#020202] py-32 border-t border-white/10 z-10">
            <section id="about" className="px-6 sm:px-16 max-w-4xl mx-auto text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8">
                Behind the Console
              </p>
              
              <h2 className="text-3xl sm:text-4xl font-black text-white/90 tracking-tighter mb-8 leading-tight">
                A collaborative journey to elevate your sound.
              </h2>
              
              <p className="text-sm text-white/60 font-medium leading-relaxed max-w-2xl mx-auto mb-12">
                Based between London and Brighton, I am an independent engineer focused on helping artists find their unique sonic footing. I'm actively building my portfolio, which means I treat every project as a deep collaboration rather than a transactional service. We don't just run your stems through presets—we communicate, we revise, and we work together step-by-step until the record feels exactly right to you.
              </p>
              
              {/* Minimal signature / sign-off */}
              <div className="flex flex-col items-center gap-2">
                 <span className="font-black text-lg tracking-tighter text-white/80 select-none">MAXM</span>
                 <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">Head Engineer</span>
              </div>
            </section>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DASHBOARD / BOOKING — swap in below the fold            */}
      {activeView === 'booking' && <BookingView />}
      
      {activeView === 'dashboard' && <Dashboard forceMode={activeView} />}

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slowZoom {
          from { transform: scale(1.04); }
          to   { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

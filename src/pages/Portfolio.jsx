import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Download, Disc3, Layers, Sliders, ExternalLink, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';

const MASTERS = [
  {
    id: 1,
    title: "LUNAR ECLIPSE",
    artist: "K-PHONIK",
    genre: "UK Drill / Melodic",
    bpm: 142,
    service: "Full Mix & Master",
    audio: "/audio/demo-master-1.mp3",
    color: "#7DD3FC"
  },
  {
    id: 2,
    title: "MIDNIGHT DRIVE",
    artist: "SAINT G",
    genre: "R&B / Soul",
    bpm: 94,
    service: "Analog Mastering",
    audio: "/audio/demo-master-2.mp3",
    color: "#3B82F6"
  },
  {
    id: 3,
    title: "TECTONIC",
    artist: "RAZE",
    genre: "Grime",
    bpm: 140,
    service: "Full Mix & Master",
    audio: "/audio/demo-master-3.mp3",
    color: "#10B981"
  }
];

export default function Portfolio() {
  const [playingId, setPlayingId] = useState(null);

  const togglePlay = (id) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-[120px] px-6 pb-32 bg-black">
      
      {/* Header */}
      <section className="max-w-4xl mx-auto w-full text-center mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mindwave-badge mb-8 mx-auto"
        >
          <Sparkles size={12} className="text-[#3B82F6]" />
          <span>The Pure Fidelity Standard</span>
        </motion.div>
        
        <motion.h1 
          className="text-6xl font-display uppercase tracking-tight text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          RECENT <span className="italic text-[#3B82F6]">MASTERS</span>
        </motion.h1>
        <motion.p 
          className="text-white/40 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          A selection of tracks sonically perfected at Perona Studio. Explore the range of clarity, punch, and commercial loudness.
        </motion.p>
      </section>

      {/* Portfolio Grid */}
      <section className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
        {MASTERS.map((m, i) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="mindwave-glass group relative overflow-hidden flex flex-col aspect-[4/5] p-8 border border-white/5 hover:border-[#3B82F6]/30 transition-all duration-500"
          >
            {/* Background Ambient Glow */}
            <div 
              className="absolute -top-20 -right-20 w-48 h-48 blur-[80px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700"
              style={{ backgroundColor: m.color }}
            />

            <div className="flex justify-between items-start mb-12 relative z-10">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Artist</span>
                  <span className="text-xl font-bold text-white/90">{m.artist}</span>
               </div>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-white/[0.02] group-hover:border-[${m.color}]/30 transition-all shadow-xl`}>
                  <Disc3 size={20} className={`text-white/20 group-hover:text-white/60 group-hover:animate-spin-slow`} />
               </div>
            </div>

            <div className="flex-1 flex flex-col justify-end relative z-10">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3B82F6] mb-4">{m.genre}</span>
               <h3 className="text-3xl font-display font-medium text-white mb-8 group-hover:italic transition-all uppercase tracking-tighter">
                 {m.title}
               </h3>
               
               <div className="flex flex-col gap-6">
                  {/* Waveform Visualization stub */}
                  <div className="h-12 w-full flex items-center gap-1">
                    {Array.from({ length: 40 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`flex-1 rounded-full transition-all duration-500 ${playingId === m.id ? 'bg-[#3B82F6]' : 'bg-white/10'}`}
                        style={{ height: `${20 + Math.random() * 80}%`, opacity: playingId === m.id ? 1 : 0.3 }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Workflow</span>
                        <span className="text-[10px] font-bold text-white/50 uppercase">{m.service}</span>
                     </div>
                     <button 
                        onClick={() => togglePlay(m.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white text-black hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]`}
                     >
                        {playingId === m.id ? <Pause size={18} fill="black" /> : <Play size={18} className="translate-x-0.5" fill="black" />}
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto w-full text-center">
         <div className="mindwave-glass py-20 px-10 border border-[#3B82F6]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />
            <h2 className="mb-6">Ready to elevate your sound?</h2>
            <p className="text-white/40 mb-10 max-w-lg mx-auto">
              Choose the service that fits your project and gain access to the bespoke client portal for real-time revisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button onClick={() => window.location.href = '/services'} className="px-10">VIEW PRICING</Button>
               <Button onClick={() => window.location.href = '/contact'} className="!bg-transparent !border-white/10 !text-white hover:!bg-white/5 px-10">CONTACT STUDIO</Button>
            </div>
         </div>
      </section>

    </div>
  );
}

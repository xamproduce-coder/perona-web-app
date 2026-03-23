import { motion } from 'framer-motion';
import { Camera, Image as ImageIcon, Layout, ArrowRight } from 'lucide-react';

export default function Photography() {
  const shots = [
    { title: "The Gear", desc: "Close-up of the analog chain and custom console.", icon: Layout },
    { title: "Studio Vibe", desc: "Wide shots of the mixing room and client lounge.", icon: ImageIcon },
    { title: "Artist Action", desc: "Candid moments of tracking and creative flow.", icon: Camera }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-[#f26422] mb-4"
        >
          Photography Planning
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-4xl sm:text-6xl font-black text-white/90 tracking-tighter mb-6"
        >
          Visual Identity <span className="text-white/40">Blueprint.</span>
        </motion.h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {shots.map((shot, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative bg-[#0a0a0a]/60 backdrop-blur-md border border-white/10 p-8 rounded-[2.5rem] hover:bg-[#111111]/80 transition-all duration-500"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#f26422]/10 flex items-center justify-center text-[#f26422] mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(242,100,34,0.1)]">
              <shot.icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{shot.title}</h3>
            <p className="text-sm text-white/50 leading-relaxed font-medium">{shot.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-tr from-[#f26422]/10 to-orange-500/5 border border-[#f26422]/20 p-10 rounded-[3rem] text-center"
      >
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">The "Digital Museum" Vision</h2>
        <p className="text-white/60 max-w-xl mx-auto mb-8 font-medium italic">
          "The website needs to speak before the music even plays. High-quality imagery of the room, the hands on the faders, and the vibe of the studio is what builds the initial trust."
        </p>
        <button className="btn-premium btn-glow !px-12">
          Download Shot List PDF <ArrowRight size={14} className="ml-2 inline" />
        </button>
      </motion.div>
    </div>
  );
}

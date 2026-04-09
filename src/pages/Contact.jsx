import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Instagram, MapPin, Send, Sparkles, Disc3 } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Contact() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-[120px] px-6 pb-32 bg-[#F0F9FF] overflow-hidden relative">
      
      {/* Background Ambient Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1E3A8A]/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#7DD3FC]/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        
        {/* Left Side: Info */}
        <div className="flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mindwave-badge mb-10 max-w-fit"
          >
            <Sparkles size={12} className="text-[#7DD3FC]" />
            <span>Open for Consultations</span>
          </motion.div>
          
          <motion.h1 
            className="text-7xl font-display uppercase tracking-tighter text-[#0F172A] mb-8 leading-none"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            LET'S BUILD <br />
            <span className="italic text-[#7DD3FC]">YOUR SOUND.</span>
          </motion.h1>
          
          <motion.p 
            className="text-[#0F172A]/40 text-xl max-w-md mb-16 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Whether you need a single track master or a full EP partnership, I'm here to ensure your vision is realized with sonic precision.
          </motion.p>

          <div className="space-y-10">
            <ContactLink 
              icon={<Mail className="text-[#7DD3FC]" size={20} />} 
              label="Email" 
              value="studio@perona.com" 
              link="mailto:studio@perona.com" 
            />
            <ContactLink 
              icon={<Instagram className="text-[#7DD3FC]" size={20} />} 
              label="Instagram" 
              value="@perona.studio" 
              link="https://instagram.com/perona.studio" 
            />
            <ContactLink 
              icon={<MapPin className="text-[#7DD3FC]" size={20} />} 
              label="Studio Location" 
              value="Brighton, United Kingdom" 
              link="#" 
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="mindwave-glass p-10 md:p-14 border border-white/10 rounded-[48px] shadow-2xl relative"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-white/5 flex items-center justify-center opacity-40 group hover:opacity-100 transition-opacity">
            <Disc3 size={48} className="text-[#0F172A]/20 animate-[spin_10s_linear_infinite]" />
          </div>

          <h3 className="text-2xl font-bold text-[#0F172A] mb-10 uppercase tracking-tight">Direct Inquiry</h3>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]/20 ml-1">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Artist / Producer"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[#0F172A] placeholder:text-[#0F172A]/10 focus:border-[#7DD3FC]/50 focus:outline-none transition-all font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]/20 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="contact@example.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[#0F172A] placeholder:text-[#0F172A]/10 focus:border-[#7DD3FC]/50 focus:outline-none transition-all font-medium" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]/20 ml-1">Project Details</label>
              <textarea 
                placeholder="Tell me about your track, genre, and what service you're looking for..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-[#0F172A] placeholder:text-[#0F172A]/10 h-40 resize-none focus:border-[#7DD3FC]/50 focus:outline-none transition-all font-medium"
              ></textarea>
            </div>

            <Button className="w-full py-5 flex items-center justify-center gap-3 group">
              <span>SEND MESSAGE</span>
              <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

function ContactLink({ icon, label, value, link }) {
  return (
    <a href={link} className="flex items-center gap-6 group">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-[#7DD3FC]/10 group-hover:border-[#7DD3FC]/30 transition-all shadow-xl">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A]/20 mb-1 group-hover:text-[#0F172A]/40 transition-colors">{label}</span>
        <span className="text-lg font-bold text-[#0F172A]/80 group-hover:text-[#0F172A] transition-colors">{value}</span>
      </div>
    </a>
  );
}

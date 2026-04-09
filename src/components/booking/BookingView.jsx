import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Music, Info, X, CheckCircle, ChevronDown, User, Mic, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BookingView({ onClose }) {
  const { user } = useAuth();
  const [activeBubble, setActiveBubble] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [demoLink, setDemoLink] = useState('');
  const [vision, setVision] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !demoLink) return;
    
    // In a real app, this would save to Firestore as an "application"
    
    setIsSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 4000);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: 'home' }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white text-[#0066FF] overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Header & Close Button */}
      <div className="absolute top-8 right-8 z-[110]">
        <button 
          onClick={handleClose}
          className="p-3 bg-white/10 hover:bg-[#1D4ED8] rounded-full transition-colors group border border-[#0066FF]/20 hover:border-[#1D4ED8]"
        >
          <X className="w-8 h-8 text-[#0066FF] group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 min-h-screen flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Info & Map */}
          <div className="space-y-12">
            <div>
              <h1 className="text-[5vw] lg:text-[80px] leading-[0.85] font-black tracking-tighter mb-6">
                <span className="text-[#0066FF]">BOOK </span>
                <span className="text-[#1D4ED8]">SESSION</span>
              </h1>
              <p className="text-lg text-[#0066FF]/70 font-bold uppercase tracking-widest max-w-sm">
                Reserve your priority mix and master queue slot today.
              </p>
            </div>

            {/* Categorized Info Bubbles */}
            <div className="space-y-4">
              
              {/* Bubble 1: About Me & Process */}
              <div 
                className={`border border-[#0066FF]/10 rounded-2xl overflow-hidden transition-all duration-300 ${activeBubble === 'process' ? 'bg-slate-50' : 'bg-transparent hover:bg-white/[0.02]'}`}
              >
                <button 
                  onClick={() => setActiveBubble(activeBubble === 'process' ? null : 'process')}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <User className={`w-5 h-5 ${activeBubble === 'process' ? 'text-[#1D4ED8]' : 'text-[#0066FF]/40'}`} />
                    <span className="font-black uppercase tracking-[0.2em] text-sm text-[#0066FF]/80">Application Process</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#0066FF]/40 transition-transform duration-300 ${activeBubble === 'process' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeBubble === 'process' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 pt-2 text-[#0066FF]/50 text-sm font-medium leading-relaxed">
                    I don't just take any session. I need to make sure I can genuinely elevate your record. Drop a demo link on the right. If it's a mutual fit, I will message you inside your MAXM Dashboard within 48 hours to coordinate dates.
                  </p>
                </div>
              </div>

              {/* Bubble 2: Remote & Mobile */}
              <div 
                className={`border border-[#0066FF]/10 rounded-2xl overflow-hidden transition-all duration-300 ${activeBubble === 'remote' ? 'bg-slate-50' : 'bg-transparent hover:bg-white/[0.02]'}`}
              >
                <button 
                  onClick={() => setActiveBubble(activeBubble === 'remote' ? null : 'remote')}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <Mic className={`w-5 h-5 ${activeBubble === 'remote' ? 'text-[#1D4ED8]' : 'text-[#0066FF]/40'}`} />
                    <span className="font-black uppercase tracking-[0.2em] text-sm text-[#0066FF]/80">Remote & Mobile Services</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#0066FF]/40 transition-transform duration-300 ${activeBubble === 'remote' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeBubble === 'remote' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 pt-2 text-[#0066FF]/50 text-sm font-medium leading-relaxed">
                    If you are outside of the London/Brighton circuit, we can operate fully remote. If you require me in person for tracking, book a professional studio near you, provide proof of booking, and I will travel to engineer the session with my equipment.
                  </p>
                </div>
              </div>

              {/* Bubble 3: Pricing & Deposit */}
              <div 
                className={`border border-[#0066FF]/10 rounded-2xl overflow-hidden transition-all duration-300 ${activeBubble === 'pricing' ? 'bg-slate-50' : 'bg-transparent hover:bg-white/[0.02]'}`}
              >
                <button 
                  onClick={() => setActiveBubble(activeBubble === 'pricing' ? null : 'pricing')}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <Shield className={`w-5 h-5 ${activeBubble === 'pricing' ? 'text-[#1D4ED8]' : 'text-[#0066FF]/40'}`} />
                    <span className="font-black uppercase tracking-[0.2em] text-sm text-[#0066FF]/80">Pricing & Deposits</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-[#0066FF]/40 transition-transform duration-300 ${activeBubble === 'pricing' ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeBubble === 'pricing' ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 pt-2 text-[#0066FF]/50 text-sm font-medium leading-relaxed">
                    Custom rates are negotiated depending on scope (e.g. bulk tracking, full EP packages). A £25 deposit is <strong>only</strong> required after we mutually agree your project is green-lit and dates are finalized.
                  </p>
                </div>
              </div>

            </div>
          </div>


          {/* Right Column: Application Form */}
          <div className="bg-slate-50/60 border border-[#0066FF]/10 p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden">
            
            {isSubmitted ? (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 z-10">
                <CheckCircle className="w-20 h-20 text-[#1D4ED8] mb-6 animate-pulse" />
                <h2 className="text-3xl font-black uppercase tracking-widest text-[#0066FF] mb-4">Application Sent</h2>
                <p className="text-[#0066FF]/60 font-medium leading-relaxed max-w-sm">
                  I'm stepping out of the console shortly to listen. You'll receive an email notification when I drop a message in your Dashboard.
                </p>
              </div>
            ) : null}

            <div className="mb-8 border-b border-[#0066FF]/10 pb-6">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#0066FF] mb-3">
                Submit Project
              </h2>
              <p className="text-sm font-bold text-[#0066FF]/50 leading-relaxed italic max-w-sm">
                "I don't just take any session. I need to know I can actually take your record to the next level. Send me a rough demo and let the music speak."
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-0">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]/40 mb-3 ml-2">Artist Name</label>
                  <div className="input-field-premium">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. The Midnight"
                      className="w-full bg-transparent border-none px-6 py-5 text-xs text-[#0066FF] placeholder-white/30 font-bold focus:shadow-none tracking-widest"
                      style={{ border: 'none', boxShadow: 'none', borderRadius: '1rem' }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]/40 mb-3 ml-2">Email Address</label>
                  <div className="input-field-premium">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="contact@artist.com"
                      className="w-full bg-transparent border-none px-6 py-5 text-xs text-[#0066FF] placeholder-white/30 font-bold focus:shadow-none tracking-widest"
                      style={{ border: 'none', boxShadow: 'none', borderRadius: '1rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]/40 mb-3 ml-2">Demo / Stems Link</label>
                <div className="input-field-premium flex items-center">
                  <div className="pl-6 text-[#0066FF]/20">
                    <Music size={16} />
                  </div>
                  <input 
                    type="url" 
                    value={demoLink}
                    onChange={(e) => setDemoLink(e.target.value)}
                    required
                    placeholder="Soundcloud, Drive, Dropbox"
                    className="w-full bg-transparent border-none px-6 py-5 text-xs text-[#0066FF] placeholder-white/30 font-bold focus:shadow-none tracking-widest"
                    style={{ border: 'none', boxShadow: 'none', borderRadius: '1rem' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#0066FF]/40 mb-3 ml-2">Project Vision (The Soul)</label>
                <div className="input-perspective-premium">
                  <textarea 
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    placeholder="What does this track mean to you? Where does it need to go?"
                    rows={4}
                    className="w-full bg-transparent border-none px-6 py-6 text-xs text-[#0066FF] placeholder-white/30 font-bold focus:shadow-none tracking-widest custom-scrollbar resize-none"
                    style={{ border: 'none', boxShadow: 'none', borderRadius: '1.5rem' }}
                  />
                </div>
              </div>

              {/* Confirm Button — Signature Rick Rubin Orange */}
              <motion.button 
                whileHover={name && email && demoLink ? { scale: 1.02, y: -2 } : {}}
                whileTap={name && email && demoLink ? { scale: 0.98 } : {}}
                type="submit"
                disabled={!name || !email || !demoLink}
                className={`w-full flex items-center justify-center gap-3 px-8 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] transition-all flex-col mt-4 relative overflow-hidden group
                  ${name && email && demoLink
                    ? 'bg-[#1D4ED8] text-[#0066FF] shadow-[0_20px_40px_rgba(29, 78, 216,0.2)] hover:shadow-[0_25px_50px_rgba(29, 78, 216,0.3)] cursor-pointer' 
                    : 'bg-white/5 text-[#0066FF]/20 border border-[#0066FF]/10 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <Send size={18} />
                  <span>TRANSMIT PROJECT VISION</span>
                </div>
              </motion.button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

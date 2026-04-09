import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Mail, ShieldCheck, 
  Download, Music2, Calendar, HardDrive,
  Settings, CheckCircle2, ChevronRight,
  ExternalLink, Disc3, FileAudio
} from 'lucide-react';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { createOrUpdateUser, getVaultFolders, createVaultFolder, saveAssetMetadata } from '../lib/db';
import { uploadVaultFile } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

export default function Account() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { orders, loading: loadingOrders } = useRealtimeOrders(user?.uid);

  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragActive, setDrag] = useState(false);
  const [uploadingStems, setUploadingStems] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);

  // Helper to show brief feedback
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <User size={48} className="text-white/20 mb-6" />
        <h1 className="text-4xl font-display uppercase tracking-tight mb-4">Portal Access Required</h1>
        <p className="text-white/50 mb-8 max-w-sm">You must create an account or sign in to access your dashboard and release vault.</p>
        <Button 
          onClick={() => navigate('/login')}
          className="w-full max-w-xs py-4"
        >
          Proceed to Login
        </Button>
      </div>
    );
  }

  // Filter for finished tracks with a download link
  // INJECTING DEMO TRACKS for detailed list visualization
  const mockDemos = [
    {
      id: 'demo-finished-track-001',
      projectName: 'NIGHTCAB_VIP',
      status: 'finalized',
      masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 2) },
      service: 'STEREO_MASTER',
      bpm: '142'
    },
    {
       id: 'demo-2',
       projectName: 'OBLIVION_BEAT',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 12) },
       service: 'MIX_AND_MASTER',
       bpm: '120'
    },
    {
       id: 'demo-3',
       projectName: 'LONDON_FOG_REMIX',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 30) },
       service: 'STEREO_MASTER',
       bpm: '138'
    },
    {
       id: 'demo-4',
       projectName: 'INTERSTELLAR_AMBIENCE',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 45) },
       service: 'STEM_MASTERING',
       bpm: '98'
    },
    {
       id: 'demo-5',
       projectName: 'CLUB_BANG_01',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 10) },
       service: 'MIX_AND_MASTER',
       bpm: '128'
    },
    {
       id: 'demo-6',
       projectName: 'SUMMER_VIBES_DUB',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 5) },
       service: 'STEREO_MASTER',
       bpm: '110'
    },
    {
       id: 'demo-7',
       projectName: 'SYNTHWAVE_OUTRO',
       status: 'finalized',
       masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
       deliveredAt: { seconds: Math.floor(Date.now() / 1000) - (86400 * 60) },
       service: 'STEREO_MASTER',
       bpm: '105'
    }
  ];

  const allFinishedOrders = [...orders.filter(o => (o.status === 'finalized' || o.masterUrl)), ...mockDemos];
  const finishedOrders = allFinishedOrders.sort((a,b) => {
      const timeA = a.deliveredAt?.seconds || 0;
      const timeB = b.deliveredAt?.seconds || 0;
      return sortAscending ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="h-full bg-[#0A0A0A] text-white pt-28 pb-8 px-4 sm:px-8 font-sans flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-6">
        
        {/* Toast Notification Overlay */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#EF4444] text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Profile Header ─── */}
        <header className="shrink-0 flex flex-col md:flex-row items-center justify-between gap-8 pb-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.06] flex items-center justify-center text-3xl font-display text-[#EF4444] shadow-2xl overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (profile?.artistName || user.displayName || user.email || 'A').slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-black" title="Studio Status: Online" />
            </div>
            
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EF4444]/60 mb-2">Artist Identification</p>
              <h1 className="text-4xl font-display tracking-tight text-white mb-1">
                {profile?.artistName || user.displayName || 'Unnamed Artist'}
              </h1>
              <div className="flex items-center gap-4 text-white/30">
                <span className="text-[10px] uppercase font-bold flex items-center gap-1.5"><Mail size={12} /> {user.email}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] uppercase font-bold flex items-center gap-1.5"><ShieldCheck size={12} /> {profile?.role === 'admin' ? 'Studio Admin' : 'Pro Member'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-white/[0.04] text-white/50 border border-white/[0.06] font-bold hover:bg-white/[0.08] hover:text-white transition-all text-[10px] uppercase tracking-widest"
            >
              {isAdmin ? 'Back to Admin' : 'Back to Dashboard'}
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/'); }}
              className="px-5 py-3.5 rounded-2xl bg-red-500/10 text-red-400/60 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-[0px] overflow-hidden">
          
          {/* ─── Left Column: Account Settings ─── */}
          <div className="lg:col-span-1 space-y-8 overflow-y-auto custom-scrollbar pr-4 pb-12">
            <section className="mindwave-glass p-8 border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-white/40">
                  <Settings size={16} />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest">Portal Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Artist Name Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Stage Name</label>
                  <div className="relative group">
                    <input 
                      type="text"
                      className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#EF4444]/40 focus:bg-white/[0.04] transition-all"
                      defaultValue={profile?.artistName || user.displayName || ''}
                      placeholder="e.g. PERONA"
                      onBlur={async (e) => {
                        const val = e.target.value.trim();
                        if (val && val !== profile?.artistName) {
                          setIsUpdating(true);
                          try {
                            await createOrUpdateUser(user.uid, { artistName: val });
                            showToast('Artist Identity Updated');
                          } catch (err) {
                            showToast('Update Failed');
                          } finally {
                            setIsUpdating(false);
                          }
                        }
                      }}
                    />
                    {isUpdating && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" /></div>}
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-1">Email Account</label>
                  <div className="w-full bg-white/[0.01] border border-white/[0.04] rounded-xl px-5 py-4 text-sm font-bold text-white/30 flex items-center justify-between">
                    {user.email}
                    <ShieldCheck size={14} className="text-white/10" />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    disabled 
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-black uppercase tracking-widest text-white/20 cursor-not-allowed group"
                  >
                    Change Password
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    disabled 
                    className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-black uppercase tracking-widest text-white/20 cursor-not-allowed group"
                  >
                    Billing History
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </section>

            {/* Studio Stats / Member Since */}
            <section className="p-8 border border-white/[0.04] rounded-[2rem] bg-gradient-to-br from-white/[0.02] to-transparent">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-white/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Calendar size={12} /> Joined</span>
                  <span className="text-[10px] font-black text-white/50">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</span>
                </div>
                <div className="flex items-center justify-between text-white/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><HardDrive size={12} /> Vault Space</span>
                  <span className="text-[10px] font-black text-white/50">Unlimited</span>
                </div>
                <div className="flex items-center justify-between text-white/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Music2 size={12} /> Submissions</span>
                  <span className="text-[10px] font-black text-white/50">{orders.length} Sessions</span>
                </div>
              </div>
            </section>
          </div>

          {/* ─── Right Column: Finalized Projects ─── */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-[0px] space-y-6 overflow-hidden pb-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <h2 className="text-2xl font-display tracking-tight hover:text-[#EF4444] transition-colors cursor-default">FINALIZED PROJECTS</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 mt-1">Final high-fidelity exports for download</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px w-12 bg-white/10 hidden sm:block" />
                <span className="text-[10px] font-black text-[#EF4444] tabular-nums bg-[#EF4444]/10 px-3 py-1 rounded-sm border border-[#EF4444]/20">{finishedOrders.length} Ready</span>
              </div>
            </div>

            <div className="flex-1 bg-transparent overflow-hidden flex flex-col min-h-[400px]">
              {loadingOrders ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/10 italic animate-pulse">
                  <Disc3 size={48} className="animate-spin duration-[4s]" />
                  <span className="text-[9px] uppercase font-black tracking-widest">Searching Stem Vault...</span>
                </div>
              ) : finishedOrders.length === 0 ? (
                <div 
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white/10 group m-6 transition-all duration-500 rounded-[2rem] relative bg-white/[0.01] border border-white/[0.04]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:scale-110 shadow-2xl transition-all duration-500">
                    <Music2 className="text-white/20" size={24} />
                  </div>
                  <h3 className="text-lg font-black text-white/40 mb-3 tracking-widest uppercase">No Releases Found</h3>
                  <p className="text-[10px] max-w-xs font-bold text-white/10 leading-relaxed uppercase tracking-[0.15em] mb-8">
                    Your finalized studio masters and high-fidelity exports will appear here for download.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} className="!py-3 !px-8 !text-[9px]">
                    Enter Studio Dashboard
                  </Button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  {/* Table Header */}
                  <div className="flex items-center justify-between mb-4 px-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 border-b border-white/5 pb-4">
                     <div className="w-12"></div>
                     <div className="flex-1 min-w-0">Release File</div>
                     <div className="w-32 hidden lg:block text-left">Protocol</div>
                     <div className="w-24 hidden md:block text-left">Tempo</div>
                     <div 
                       className="w-32 flex items-center justify-end gap-2 cursor-pointer hover:text-white transition-colors select-none group"
                       onClick={() => setSortAscending(!sortAscending)}
                     >
                       Delivery Date <span className="text-[#EF4444] font-black group-hover:scale-125 transition-transform">{sortAscending ? '↑' : '↓'}</span>
                     </div>
                     <div className="w-14"></div>
                  </div>

                  <div className="flex flex-col gap-2 pb-6">
                    {finishedOrders.map(order => (
                      <div 
                        key={order.id} 
                        className="group flex flex-row items-center px-6 py-4 rounded-sm border border-white/5 bg-black hover:bg-white/[0.02] hover:border-white/10 transition-all cursor-pointer relative shadow-sm"
                        onClick={() => window.open(order.masterUrl, '_blank')}
                        title="Download Asset"
                      >
                         <div className="w-10 h-10 shrink-0 rounded-sm bg-[#111111] border border-white/10 flex items-center justify-center text-white/40 group-hover:text-[#EF4444] transition-all duration-300 mr-5">
                           <FileAudio size={18} />
                         </div>
                         
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <h3 className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-[#EF4444] transition-colors truncate">
                               {order.projectName || 'UNTITLED_FILE'}
                             </h3>
                         </div>

                         <div className="w-32 hidden lg:flex items-center text-[9px] font-bold uppercase tracking-widest text-white/30">
                            {order.service === 'STEREO_MASTER' ? 'MASTER' : 'MIX_MASTER'}
                         </div>

                         <div className="w-24 hidden md:flex items-center text-[9px] font-black tracking-[0.2em] text-[#EF4444]/80">
                            {order.bpm ? `${order.bpm} BPM` : '—'}
                         </div>

                         <div className="w-32 flex items-center justify-end text-[9px] font-bold uppercase tracking-widest text-white/40">
                            {order.deliveredAt ? new Date(order.deliveredAt.seconds * 1000).toLocaleDateString() : '—'}
                         </div>

                         {/* Action / Download */}
                         <div className="w-14 flex justify-end shrink-0 pl-4">
                             <div className="w-8 h-8 rounded-sm bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center group-hover:bg-[#EF4444] group-hover:text-white transition-colors shadow-lg shadow-red-950/0 group-hover:shadow-red-950/40">
                                <Download size={14} />
                             </div>
                         </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center pt-8 pb-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10">
                      End of Drive Directory
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

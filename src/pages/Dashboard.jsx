import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getOrderRevisions, submitRevision, updateOrder } from '../lib/db';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Send, 
  Loader2, Music, User, Bell, Settings, Search, 
  ChevronRight, Disc3, Clock, MessageSquare, Plus, Info,
  ChevronDown, Edit2, Check, X
} from 'lucide-react';
import logoImg from '../assets/logo.png';

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

const STATUS_COLORS = {
  finalized: "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]",
  review: "bg-orange-500 shadow-[0_0_12px_rgba(242,100,34,0.6)]",
  pending: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]",
  queued: "bg-zinc-500 shadow-[0_0_12px_rgba(113,113,122,0.6)]",
  'in progress': "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
};

export default function Dashboard({ forceMode }) {
  const { user: authUser } = useAuth();
  const user = authUser || { uid: 'mock123', displayName: 'Manu' };
  const navigate = useNavigate();

  const { orders: realOrders, loading: ordersLoadingFirestore } = useRealtimeOrders(user?.uid);
  
  const mockOrders = [
    { id: 'm1', projectName: 'LUNAR ECLIPSE', status: 'finalized', masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', bpm: 124, key: 'Cm' },
    { id: 'm2', projectName: 'NEON NIGHTS', status: 'review', masterUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', bpm: 128, key: 'G#m' },
    { id: 'm3', projectName: 'SUBTERRANEAN', status: 'pending', bpm: 110, key: 'Am' },
  ];

  const orders = useMemo(() => {
    return realOrders.length > 0 ? realOrders : mockOrders;
  }, [realOrders]);

  const ordersLoading = ordersLoadingFirestore && realOrders.length === 0;

  const [activeOrder, setActiveOrder] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevs, setLoadingRevs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (orders.length > 0 && !activeOrder) {
      setActiveOrder(orders[0]);
    }
  }, [orders, activeOrder]);

  useEffect(() => {
    async function loadRevs() {
      if (!activeOrder?.id || activeOrder.id.startsWith('m')) {
        setRevisions([
          { id: 'rev1', timestamp: 12, note: "BRING THE VOCALS UP 2dB HERE", author: "Artist", status: 'pending' },
          { id: 'rev2', timestamp: 45, note: "PUNCHIER KICK ON THIS SECTION", author: "Artist", status: 'pending' },
        ]);
        return;
      }
      setLoadingRevs(true);
      try {
        const revs = await getOrderRevisions(activeOrder.id);
        setRevisions(revs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRevs(false);
      }
    }
    loadRevs();
  }, [activeOrder]);

  const handleNewRevisionLocally = (rev) => {
    setRevisions(prev => [...prev, rev]);
  };

  const groupedOrders = useMemo(() => {
    const filtered = orders.filter(o => 
      o.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const groups = {};
    filtered.forEach(o => {
      const name = o.projectName || 'UNSPECIFIED';
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });
    return Object.entries(groups).map(([name, items]) => ({ name, items }));
  }, [orders, searchQuery]);

  return (
    <div className="fixed inset-0 z-[500] bg-[#0a0a0b] text-white p-4 sm:p-6 font-sans overflow-hidden flex flex-col selection:bg-orange-500/30 animate-in fade-in duration-500">
      
      {/* ── TOP HEADER ── */}
      <header className="w-full h-16 flex items-center justify-between px-6 relative z-50 bg-[#0a0a0a]/60 backdrop-blur-md border border-white/10 rounded-[2rem] mb-4">
        
        {/* Animated Diamond Logo */}
        <button 
          onClick={() => forceMode ? window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: 'home' })) : navigate('/')}
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
        >
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="relative flex items-center justify-center h-8"
           >
             <img src={logoImg} alt="Maxm Studio Logo" className="h-full w-auto object-contain" />
           </motion.div>
           <span className="font-black tracking-widest text-xs uppercase hidden sm:block text-white/50">MAXM Studio</span>
        </button>

        {/* Top Right Utilities */}
        <div className="flex items-center gap-3">
           {[Bell, Settings].map((Icon, i) => (
             <button key={i} className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-white/40 hover:text-[#f26422] hover:bg-[#f26422]/10 transition-all">
               <Icon size={14} />
             </button>
           ))}
           <div className="h-6 w-px bg-white/10 mx-2" />
           <div 
             onClick={() => forceMode ? window.dispatchEvent(new CustomEvent('changeDashboardMode', { detail: 'home' })) : navigate('/')}
             className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full pl-1.5 pr-4 py-1 cursor-pointer hover:bg-white/[0.06] transition-all group"
           >
             <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f26422] to-orange-400 flex items-center justify-center text-white border border-white/20 shadow-lg">
               <User size={12} />
             </div>
             <div className="flex flex-col items-start leading-none hidden sm:flex">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{user.displayName || 'Artist'}</span>
                <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white/30">Pro Account</span>
             </div>
           </div>
        </div>
      </header>

      {/* ── MAIN CONTENT LAYER ── */}
      <div className="flex-1 flex gap-4 sm:gap-6 w-full h-full min-h-0 relative z-10 pb-2">
        
        {/* LEFT BOX: Track Browser Sidebar (Landing Page Design Pattern) */}
        <aside className="w-[300px] h-full rounded-[2rem] bg-[#0a0a0a]/60 border border-white/10 backdrop-blur-md p-6 flex flex-col relative overflow-hidden group/sidebar shrink-0 hidden lg:flex">
           <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#f26422]/5 to-transparent pointer-events-none" />
           
           <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-white/80 font-black text-[10px] tracking-[0.2em] uppercase">
                Session Library
              </h2>
              <div className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black tracking-widest text-white/40 uppercase border border-white/10">
                {orders.length} ITEMS
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : groupedOrders.length === 0 ? (
                 <div className="text-center text-white/20 text-[10px] font-bold uppercase mt-8">
                    No sessions found
                 </div>
              ) : groupedOrders.map(group => (
                <div key={group.name} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-3 mb-1">
                    <div className="w-1 h-1 bg-[#f26422] rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{group.name}</span>
                  </div>
                  {group.items.map(order => {
                    const isActive = activeOrder?.id === order.id;
                    const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.queued;

                    return (
                      <motion.button
                        layoutId={order.id}
                        key={order.id}
                        onClick={() => setActiveOrder(order)}
                        className={`w-full text-left p-3 rounded-2xl transition-all duration-300 group flex items-center justify-between border ${
                          isActive 
                          ? 'bg-white/[0.04] border-[#f26422]/30 shadow-md' 
                          : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-1.5 h-8 rounded-full shrink-0 ${statusColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
                          <div className="min-w-0">
                            <div className={`font-black text-xs tracking-tight truncate transition-colors ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                              {order.projectName || 'UNTITLED'}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <div className="text-[8px] uppercase tracking-widest font-bold text-white/30 whitespace-nowrap">
                                 {order.status || 'ACTIVE'}
                               </div>
                               {isActive && (
                                 <>
                                   <span className="text-white/15 text-[6px]">•</span>
                                   <span className="text-[#f26422] text-[8px] font-black uppercase tracking-widest animate-pulse">Running</span>
                                 </>
                               )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              ))}
           </div>
           
           {/* Global Search Bar (Moved to bottom of sidebar) */}
           <div className="relative group w-full mt-4 pt-4 border-t border-white/5 shrink-0 hidden md:block">
             <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 mt-2 text-white/30 group-focus-within:text-[#f26422] transition-colors" />
             <input 
               type="text" 
               placeholder="SEARCH SESSIONS..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black tracking-widest uppercase focus:outline-none focus:border-[#f26422]/50 transition-all focus:bg-white/[0.05]"
             />
           </div>
        </aside>

        {/* RIGHT BOX: Shared Canvas (Landing Page Pattern) */}
        <main className="flex-1 h-full rounded-[2rem] bg-[#0a0a0a]/60 border border-white/10 backdrop-blur-md flex flex-col relative overflow-hidden min-w-0">
           {activeOrder ? (
             <DashboardPlayerView 
               order={activeOrder} 
               revisions={revisions} 
               loadingRevs={loadingRevs}
               user={user}
               onRevisionAdded={handleNewRevisionLocally}
             />
           ) : (
             <div className="flex-1 flex items-center justify-center flex-col gap-6 text-white/5 relative z-10 w-full">
                <Disc3 size={80} className="animate-[spin_4s_linear_infinite]" />
                <div className="text-sm font-black uppercase tracking-[0.5em]">No Session Selected</div>
             </div>
           )}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INNER COMPONENT: COMPACT FULL-INTEGRATED PLAYER
// ─────────────────────────────────────────────────────────────
function DashboardPlayerView({ order, revisions, loadingRevs, user, onRevisionAdded }) {
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [hoveredMarker, setHoveredMarker] = useState(null);
  
  const playerRef = useRef(null);
  const requestRef = useRef();

  useEffect(() => {
    if (!order?.masterUrl) {
      if (playerRef.current) playerRef.current.unload();
      setPlaying(false);
      setDuration(0);
      setSeek(0);
      return;
    }

    if (playerRef.current) playerRef.current.unload();

    playerRef.current = new Howl({
      src: [order.masterUrl],
      html5: true,
      volume: volume,
      loop: isRepeat,
      onload: () => setDuration(playerRef.current.duration()),
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => { if (!isRepeat) setPlaying(false); }
    });

    return () => {
      if (playerRef.current) playerRef.current.unload();
      cancelAnimationFrame(requestRef.current);
    }
  }, [order?.masterUrl, isRepeat]);

  const updateProgress = () => {
    if (playerRef.current && playing) {
      setSeek(playerRef.current.seek());
    }
    requestRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (playing) requestRef.current = requestAnimationFrame(updateProgress);
    else cancelAnimationFrame(requestRef.current);
    return () => cancelAnimationFrame(requestRef.current);
  }, [playing]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    playing ? playerRef.current.pause() : playerRef.current.play();
  };

  const handleSeek = (time) => {
    if (!playerRef.current) return;
    const t = Math.max(0, Math.min(time, duration));
    playerRef.current.seek(t);
    setSeek(t);
  };

  const skipForward = () => handleSeek(seek + 10);
  const skipBack = () => handleSeek(seek - 10);

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    handleSeek(pct * duration);
  };

  const startNoteAction = () => {
    if (playerRef.current && playing) {
       playerRef.current.pause();
       setPlaying(false);
    }
    const newNoteId = 'temp-' + Date.now();
    const payload = {
       id: newNoteId,
       timestamp: seek,
       note: '',
       status: 'draft',
       author: user.displayName || 'Artist'
    };
    onRevisionAdded(payload);
    setEditingNoteId(newNoteId);
    setEditNoteText('');
  };

  const startEdit = (rev) => {
    setEditingNoteId(rev.id);
    setEditNoteText(rev.note || '');
  };

  const cancelEdit = (id) => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const saveNote = async (id, text) => {
    if (!text.trim()) {
       cancelEdit(id);
       return;
    }
    const existing = revisions.find(r => r.id === id);
    if (!existing) return;

    try {
      // Stub for real saving process
      existing.note = text.trim();
      existing.status = 'pending';
      setEditingNoteId(null);
    } catch(err) {
      console.error(err);
      setEditingNoteId(null);
    }
  };

  const sortedRevisions = [...revisions].sort((a,b) => a.timestamp - b.timestamp);

  return (
    <div className="flex flex-col h-full relative z-10 p-6">
       
       {/* ── TOP: COMPACT PLAYER HEADER ── */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5 shrink-0">
          
          <div className="flex items-center gap-4 min-w-0">
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={togglePlay} 
               className="w-14 h-14 rounded-full bg-[#f26422] text-white flex items-center justify-center transition-all shadow-[0_0_30px_rgba(242,100,34,0.4)] shrink-0"
             >
                {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
             </motion.button>
             <div className="min-w-0">
                <h1 className="text-xl font-black uppercase tracking-tighter text-white truncate">{order.projectName || 'UNTITLED'}</h1>
                <div className="flex items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-[#f26422] truncate">
                   <span className="flex items-center gap-1"><Disc3 size={10} /> {order.serviceType || 'Mixing'}</span>
                   <span className="text-white/20">•</span>
                   <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(duration)}</span>
                   <span className="text-white/20">•</span>
                   <span className="flex items-center gap-1"><Info size={10} /> {order.bpm || '120'} BPM</span>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 mr-2 bg-white/5 rounded-full p-1 border border-white/5 shadow-inner">
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={skipBack} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-full hover:bg-white/10"><SkipBack size={14} fill="currentColor" /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={skipForward} className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-full hover:bg-white/10"><SkipForward size={14} fill="currentColor" /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} onClick={() => setIsRepeat(!isRepeat)} className={`w-10 h-10 flex items-center justify-center transition-all rounded-full hover:bg-white/10 ${isRepeat ? 'text-[#f26422] bg-[#f26422]/10 shadow-[inset_0_0_10px_rgba(242,100,34,0.2)]' : 'text-white/40 hover:text-white'}`}><Repeat size={14} /></motion.button>
             </div>
             
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={startNoteAction} 
               className="btn-premium btn-glow"
             >
                <Plus size={14} strokeWidth={4} className="group-hover:rotate-90 transition-transform" /> Add Note
             </motion.button>
          </div>
       </div>

       {/* ── MIDDLE: TIMELINE WAVEFORM ── */}
       <div className="w-full relative h-16 flex items-center group cursor-pointer mt-4 mb-2 shrink-0" onClick={handleTimelineClick}>
          <div className="w-full h-12 bg-black/60 border border-white/10 rounded-xl relative shadow-inner overflow-hidden flex items-center">
             
             {/* Faux Waveform Background */}
             <div 
               className="absolute inset-0 opacity-20 pointer-events-none"
               style={{
                 backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)'
               }}
             />

             {/* Progress Fill */}
             <div 
               className="absolute left-0 top-0 bottom-0 bg-[#f26422]/90 border-r-2 border-white transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(242,100,34,0.5)] overflow-hidden"
               style={{ width: duration ? `${(seek/duration)*100}%` : '0%' }}
             >
                {/* Active Waveform Overlay */}
                <div 
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)' }}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-16 bg-white rounded-full shadow-lg scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-center translate-x-1/2" />
             </div>
             
             {/* Markers */}
             <div className="absolute inset-0 pointer-events-none">
                {sortedRevisions.map((rev, idx) => {
                   const pct = duration ? (rev.timestamp / duration) * 100 : 0;
                   const isHovered = hoveredMarker?.id === rev.id;
                   const isDraft = rev.id.startsWith('temp-');
                   if (isDraft && !rev.note && editingNoteId !== rev.id) return null;
                   
                   return (
                     <div 
                       key={rev.id || idx}
                       className="absolute top-1/2 -translate-y-1/2 pointer-events-auto"
                       style={{ left: `${pct}%`, marginLeft: '-8px' }}
                       onMouseEnter={() => setHoveredMarker(rev)}
                       onMouseLeave={() => setHoveredMarker(null)}
                       onClick={(e) => { e.stopPropagation(); handleSeek(rev.timestamp); }}
                     >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black transition-all shadow-md border ${
                          isHovered || isDraft ? 'bg-[#f26422] text-white scale-125 border-white z-20' : 'bg-black text-[#f26422] border-[#f26422]/50 hover:border-[#f26422]'
                        }`}>
                          !
                        </div>
                        
                        <AnimatePresence>
                           {isHovered && !isDraft && (
                             <motion.div
                               initial={{ opacity: 0, y: -2, scale: 0.9 }}
                               animate={{ opacity: 1, y: -30, scale: 1 }}
                               exit={{ opacity: 0, y: -2, scale: 0.9 }}
                               className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl z-50 pointer-events-none"
                             >
                                <span className="text-[#f26422] mr-2">{formatTime(rev.timestamp)}</span>
                                {rev.note}
                             </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                   )
                })}
             </div>
          </div>
          <div className="absolute -bottom-5 left-1 text-[8px] font-black tracking-widest text-[#f26422]">{formatTime(seek)}</div>
          <div className="absolute -bottom-5 right-1 text-[8px] font-black tracking-widest text-white/50">{formatTime(duration)}</div>
       </div>

       {/* ── BOTTOM: REVISION STREAM ── */}
       <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {sortedRevisions.length === 0 && !editingNoteId ? (
             <div className="flex flex-col items-center justify-center h-full opacity-30 gap-3 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/50">
                <MessageSquare size={24} /> No notes yet
             </div>
          ) : sortedRevisions.map((rev) => {
             const isEditing = editingNoteId === rev.id;
             const isDraft = rev.id.startsWith('temp-');
             
             if (isDraft && !rev.note && !isEditing) return null;

             if (isEditing) {
               return (
                 <div key={rev.id} className="bg-white/5 border border-[#f26422]/40 rounded-xl p-4 flex flex-col gap-3 shadow-md animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                       <div className="px-2 py-0.5 bg-[#f26422] text-white rounded-md text-[9px] font-black tracking-widest">{formatTime(rev.timestamp)}</div>
                       <span className="text-[9px] font-bold text-[#f26422] uppercase tracking-widest">Drafting Note...</span>
                    </div>
                    <textarea
                      autoFocus
                      value={editNoteText}
                      onChange={e => setEditNoteText(e.target.value)}
                      placeholder="Detail your feedback at this timestamp..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs font-medium text-white placeholder-white/30 focus:outline-none focus:border-[#f26422]/50 resize-none custom-scrollbar"
                      rows={2}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveNote(rev.id, editNoteText); } }}
                    />
                    <div className="flex justify-end gap-3">
                       <motion.button whileHover={{ y: -1 }} onClick={() => cancelEdit(rev.id)} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/30 transition-colors">Cancel</motion.button>
                       <motion.button 
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => saveNote(rev.id, editNoteText)} 
                         className="btn-premium btn-glow px-6 py-2.5"
                       >
                          <Check size={12} /> Commit Note
                       </motion.button>
                    </div>
                 </div>
               )
             }

             return (
               <div 
                 key={rev.id}
                 onClick={() => handleSeek(rev.timestamp)}
                 className="group flex gap-4 items-start cursor-pointer border border-white/5 bg-black/20 hover:bg-white/5 hover:border-[#f26422]/30 rounded-xl p-4 transition-all"
               >
                  <div className="bg-white/5 border border-white/10 text-white/60 px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest group-hover:bg-[#f26422] group-hover:text-white transition-all group-hover:border-transparent shrink-0 mt-0.5">
                     {formatTime(rev.timestamp)}
                  </div>
                  <div className="flex-1 flex justify-between items-start">
                     <div className="pr-4">
                        <p className="text-[11px] sm:text-xs font-semibold text-white/90 leading-relaxed">
                           {rev.note}
                        </p>
                        <div className="text-[8px] font-black text-white/30 mt-2 uppercase tracking-[0.15em] flex items-center gap-2">
                           <span>{rev.author}</span>
                           <span className="w-1 h-1 rounded-full bg-white/10" />
                           <span className={rev.status === 'resolved' ? 'text-green-500' : 'text-[#f26422]'}>{rev.status || 'PENDING'}</span>
                        </div>
                     </div>
                     
                     {(rev.author === user?.displayName || user?.displayName === 'Admin' || user?.displayName === 'Manu' || rev.author === 'Artist') && (
                       <button 
                         onClick={(e) => { e.stopPropagation(); startEdit(rev); }} 
                         className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-white transition-all hover:bg-white/10 rounded-md shrink-0"
                       >
                          <Edit2 size={12} />
                       </button>
                     )}
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
}

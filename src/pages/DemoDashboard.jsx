import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Disc3, Search, LayoutGrid, Clock, ChevronRight, 
  Settings, User, LogOut, Download, Play, Pause, 
  Sparkles, Plus, MoreHorizontal, History, 
  CheckCircle2, AlertCircle, FileAudio, Folder, ArrowLeft,
  ArrowUpRight, Share2, Trash2, X, FileText,
  Sliders, AudioLines, Flame, Shield, Mail, Lock,
  Upload, Check
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getVaultFolders, 
  getUserAssets, 
  getOrderRevisions,
  submitOrder,
  submitRevision,
  saveAssetMetadata,
  verifyPaymentAndUnlock
} from '../lib/db';
import { uploadVaultFile } from '../lib/storage';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';
import Navbar from '../components/layout/Navbar';

export default function DemoDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  // ─── Real-Time Engine ───────────────────────────────────────
  const { orders } = useRealtimeOrders(user?.uid);
  const [vaultFolders, setVaultFolders] = useState([]);
  const [vaultAssets, setVaultAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('masters');
  const [drilldownFolderId, setDrilldownFolderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // ─── Audio Engine ───────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [revisions, setRevisions] = useState([]);
  
  // ─── UI & Integration Engine ────────────────────────────────
  const [showEngineerTip, setShowEngineerTip] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [reviewTrack, setReviewTrack] = useState(null);
  
  // ─── Upload Engine ──────────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // ─── Modal Engine ───────────────────────────────────────────
  const [showMixRequestModal, setShowMixRequestModal] = useState(false);
  const [showEquitablePrompt, setShowEquitablePrompt] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [orderFormData, setOrderFormData] = useState({ referenceUrl: '', notes: '', selectedFiles: [] });

  // ─── Data Initialization ───────────────────────────────────
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    if (!user) return;
    getVaultFolders(user.uid).then(setVaultFolders);
    getUserAssets(user.uid).then(setVaultAssets);
  }, [user]);

  useEffect(() => {
    if (expandedOrderId) {
      getOrderRevisions(expandedOrderId).then(setRevisions);
    }
  }, [expandedOrderId]);

  // ─── Stripe Verification ───────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId && user?.uid) {
      verifyPaymentAndUnlock(user.uid, sessionId).then((success) => {
        if (success) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }
  }, [user]);

  // ─── Logic Handlers ─────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const { name, url, refPath } = await uploadVaultFile(
        user.uid, 
        drilldownFolderId || 'root',
        file, 
        (p) => setUploadProgress(p)
      );

      await saveAssetMetadata(user.uid, {
        name,
        fileUrl: url,
        storagePath: refPath,
        size: file.size,
        type: file.type,
        folderId: drilldownFolderId || 'root',
        isVaulted: true
      });

      const assets = await getUserAssets(user.uid);
      setVaultAssets(assets);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) return;
    try {
      await submitOrder(user.uid, {
        email: user.email,
        artistName: profile?.artistName || user.displayName || 'Unknown Artist',
        projectName: orderFormData.projectName || 'NEW_MIX_REQUEST',
        referenceUrl: orderFormData.referenceUrl,
        notes: orderFormData.notes,
        stems: orderFormData.selectedFiles.map(id => {
          const asset = vaultAssets.find(a => a.id === id);
          return { name: asset.name, url: asset.fileUrl };
        })
      });
      setShowMixRequestModal(false);
      setShowEquitablePrompt(true);
    } catch (err) {
      console.error('Order creation failed:', err);
    }
  };

  const handleAddRevision = async (orderId) => {
    const note = prompt('ENTERING_REVISION_DATA... (TIMELINE_REF + NOTES)');
    if (!note || !user) return;
    try {
      await submitRevision(orderId, user.uid, {
        note,
        status: 'pending'
      });
      const revs = await getOrderRevisions(orderId);
      setRevisions(revs);
    } catch (err) {
      console.error('Revision submission failed:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'finalized': return { color: '#10B981', icon: <CheckCircle2 size={12} />, bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/40' };
      case 'review': 
      case 'review required': return { color: '#EF4444', icon: <AlertCircle size={12} />, bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/40' };
      default: return { color: '#3B82F6', icon: <Clock size={12} />, bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/40' };
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-[#EF4444]/30">
      
      {/* 1. Tactical Sidebar */}
      <aside className="w-20 border-r border-white/5 flex flex-col shrink-0 bg-[#0A0A0A] z-20">
        <div className="h-28 flex items-center justify-center border-b border-white/5 mb-10">
           <Disc3 size={24} className="text-[#EF4444] animate-[spin_4s_linear_infinite]" />
        </div>
        
        <nav className="flex-1 px-4 space-y-4">
          {[
            { id: 'masters', label: 'MASTERS_LEDGER', icon: <History size={20} /> },
            { id: 'vault', label: 'UPLOAD_VAULT', icon: <Folder size={20} /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-12 h-12 flex items-center justify-center mx-auto rounded-sm transition-all group ${
                activeTab === item.id 
                ? 'bg-[#EF4444] text-white shadow-lg shadow-red-950/20' 
                : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-[#EF4444]/40'
              }`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
            </button>
          ))}
        </nav>

        <div ref={userMenuRef} className="p-4 border-t border-white/5 bg-[#0D0D0D] relative flex items-center justify-center w-full">
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[80px] left-8 min-w-[200px] bg-[#111111] border border-white/10 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-[300]"
              >
                <button 
                  onClick={() => navigate('/account')} 
                  className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-white/5 border-b border-white/5 transition-colors group"
                >
                  <User size={14} className="text-white/40 group-hover:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80 group-hover:text-white">Account Settings</span>
                </button>
                <button 
                  onClick={signOut} 
                  className="w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-[#EF4444] transition-colors group"
                >
                  <LogOut size={14} className="text-[#EF4444] group-hover:text-black" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#EF4444] group-hover:text-black">Terminate Session</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-12 h-12 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#EF4444]/40 transition-all group relative" title="User Settings">
             <User size={20} className="text-white/40 group-hover:text-[#EF4444] transition-colors" />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Stack */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <div className="h-28 shrink-0" />

        <main className="flex-1 overflow-y-auto custom-scrollbar relative p-10">
          <AnimatePresence mode="wait">
            
            {/* MASTERS LEDGER (RE-SOLDERED) */}
            {activeTab === 'masters' && (
              <motion.div key="masters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-[1200px] mx-auto w-full">
                <div className="flex items-center justify-between mb-12">
                   <h2 className="text-3xl font-display uppercase tracking-tight m-0 italic">PROJECT_ALBUM</h2>
                   <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-[#111111] border border-white/5 rounded-sm flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{orders.length} ACTIVE NODES</span>
                      </div>
                      <button 
                        onClick={() => setShowMixRequestModal(true)}
                        className="px-6 py-2 bg-[#EF4444] text-white rounded-sm font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-950/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        <Plus size={14} /> NEW_PROJECT
                      </button>
                   </div>
                </div>

                <div className="perona-card p-0 bg-[#0A0A0A] border-white/5 rounded-sm overflow-hidden shadow-2xl">
                   <div className="grid grid-cols-12 gap-4 px-10 py-6 bg-[#111111] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                      <div className="col-span-1">STATE</div>
                      <div className="col-span-4 pl-4">OBJECT_ID</div>
                      <div className="col-span-2">TIMESTAMP</div>
                      <div className="col-span-2 text-center">ARTIFACTS</div>
                      <div className="col-span-3 text-right">DIRECTIVE</div>
                   </div>

                   <div className="flex flex-col">
                      {orders.map((o) => {
                        const style = getStatusStyle(o.status);
                        return (
                          <React.Fragment key={o.id}>
                            <div 
                              onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                              className={`grid grid-cols-12 gap-4 px-10 py-8 items-center cursor-pointer border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group ${expandedOrderId === o.id ? 'bg-white/[0.03]' : ''}`}
                            >
                               <div className="col-span-1 flex justify-center">
                                  <div className={`w-5 h-5 rounded-sm flex items-center justify-center ${style.bg} border ${style.border} text-[${style.color}]`}>
                                     {style.icon}
                                  </div>
                               </div>
                               <div className="col-span-4 flex items-center gap-6 pl-4">
                                  <div className="w-12 h-12 bg-black border border-white/5 rounded-sm flex items-center justify-center">
                                     <Disc3 size={20} className="text-white/10 group-hover:text-[#EF4444] transition-colors" />
                                  </div>
                                  <div>
                                     <p className="text-[11px] font-black uppercase tracking-widest text-white group-hover:text-[#EF4444] transition-colors">{o.projectName}</p>
                                     <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-1.5">{o.artistName}</p>
                                  </div>
                               </div>
                               <div className="col-span-2 text-[10px] font-black text-white/20 tracking-widest uppercase">
                                  {o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleDateString() : 'REALTIME'}
                                </div>
                               <div className="col-span-2 text-center text-[10px] font-black tabular-nums text-white/40 tracking-widest uppercase">
                                  {o.status === 'Finalized' ? '1 MASTER' : 'PROCESSING'}
                               </div>
                               <div className="col-span-3 text-right flex justify-end gap-3">
                                  {o.status === 'Finalized' || o.masterUrl ? (
                                    <a href={o.masterUrl || '#'} download className="px-6 py-3 bg-[#10B981] text-white rounded-sm font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-950/20 hover:scale-[1.02] transition-transform">DOWNLOAD</a>
                                  ) : (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReviewTrack(o);
                                        setActiveTab('review');
                                      }}
                                      className="px-6 py-3 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-[#EF4444] hover:text-white transition-all shadow-lg"
                                    >
                                      REQUEST CHANGES
                                    </button>
                                  )}
                               </div>
                            </div>

                            {/* Revision Player Integrated */}
                            <AnimatePresence>
                               {expandedOrderId === o.id && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/60 border-b border-white/5">
                                     <div className="p-10">
                                        {o.status === 'Review Required' || o.masterUrl ? (
                                          <div className="w-full bg-[#111111] border border-white/5 p-8 rounded-sm">
                                             <div className="flex items-center gap-8 mb-10">
                                                <button onClick={() => setPlaying(!playing)} className="w-14 h-14 bg-[#EF4444] text-white flex items-center justify-center rounded-sm">
                                                   {playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                                </button>
                                                <div className="flex-1 h-[2px] bg-white/10 relative">
                                                   <div className="absolute top-0 left-0 h-full bg-[#EF4444]" style={{ width: '45%' }} />
                                                </div>
                                                <span className="text-xl font-display font-black tabular-nums">01:42</span>
                                             </div>
                                             <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/20">SIGNAL_PATH: {o.projectName}_MASTER.WAV</h3>
                                                <button 
                                                   onClick={() => handleAddRevision(o.id)}
                                                   className="text-[10px] font-black text-[#EF4444] uppercase tracking-widest hover:brightness-125 transition-all"
                                                 >
                                                   ADD PROTOCOL PIN +
                                                </button>
                                             </div>
                                          </div>
                                        ) : (
                                          <div className="text-center py-10">
                                             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.6em]">WAITING FOR ENGINEER DISPATCH...</p>
                                          </div>
                                        )}
                                     </div>
                                  </motion.div>
                               )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                   </div>
                </div>
              </motion.div>
            )}

            {/* VAULT NODE: FOLDER GRID VIEW */}
            {activeTab === 'vault' && !drilldownFolderId && (
              <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1200px] mx-auto w-full">
                 <div className="flex items-center justify-between mb-8">
                   <h2 className="text-3xl font-display uppercase tracking-tight m-0 italic">VAULT_STORAGE</h2>
                   <button onClick={() => setDrilldownFolderId('new_folder')} className="px-8 py-3 bg-[#EF4444] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-sm hover:brightness-110 transition-all shadow-xl shadow-red-950/20">
                      CREATE_NEW_FOLDER
                   </button>
                 </div>

                 {/* Upload Protocol Guidelines Block */}
                 <div className="mb-10 w-full bg-[#EF4444]/5 border border-[#EF4444]/20 p-8 rounded-sm shadow-xl">
                    <h3 className="text-xs font-black text-[#EF4444] uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                       <CheckCircle2 size={16} /> STANDARD UPLOAD PROTOCOL
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="flex flex-col gap-3 relative">
                          <div className="absolute top-0 right-0 text-7xl font-display font-black text-[#EF4444] opacity-[0.05] -z-10 -mt-4">01</div>
                          <h4 className="text-[11px] font-black uppercase text-white tracking-widest z-10">Containment</h4>
                          <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em] leading-relaxed z-10">Create a new dedicated vault folder. Name it exactly after your target project/song. Do not dump loose audio files into the main vault.</p>
                       </div>
                       <div className="flex flex-col gap-3 relative">
                          <div className="absolute top-0 right-0 text-7xl font-display font-black text-[#EF4444] opacity-[0.05] -z-10 -mt-4">02</div>
                          <h4 className="text-[11px] font-black uppercase text-white tracking-widest z-10">Nomenclature</h4>
                          <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em] leading-relaxed z-10">Rename all files concisely before dispatch. (e.g., <span className="text-[#EF4444] bg-[#EF4444]/10 px-1 py-0.5 rounded-sm">KICK_01.wav</span>, <span className="text-[#EF4444] bg-[#EF4444]/10 px-1 py-0.5 rounded-sm">LEAD_VOX_C.wav</span>). Avoid default DAW export names.</p>
                       </div>
                       <div className="flex flex-col gap-3 relative">
                          <div className="absolute top-0 right-0 text-7xl font-display font-black text-[#EF4444] opacity-[0.05] -z-10 -mt-4">03</div>
                          <h4 className="text-[11px] font-black uppercase text-white tracking-widest z-10">Synchronization</h4>
                          <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em] leading-relaxed z-10">Consolidate stems from the absolute beginning <span className="text-[#EF4444]">(0:00 timeline)</span> to ensure perfect phase alignment when the engineer imports them.</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Map existing folders or mock default folders */}
                    {vaultFolders.length > 0 ? vaultFolders.map((f) => (
                      <div key={f.id} onClick={() => setDrilldownFolderId(f.id)} className="bg-[#111111] p-8 border border-white/5 hover:border-[#EF4444]/60 cursor-pointer transition-all group rounded-sm shadow-xl">
                         <Folder size={32} className="text-white/20 group-hover:text-[#EF4444] mb-4 transition-colors" />
                         <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-[#EF4444] transition-colors">{f.name}</h3>
                         <p className="text-[10px] font-bold uppercase text-white/40 mt-2">{f.fileCount || 0} FILES</p>
                      </div>
                    )) : (
                      <>
                        <div onClick={() => setDrilldownFolderId('f1')} className="bg-[#111111] p-8 border border-white/5 hover:border-[#EF4444] cursor-pointer transition-all group rounded-sm">
                           <Folder size={32} className="text-[#EF4444] mb-4" />
                           <h3 className="text-sm font-black uppercase tracking-widest text-white">NEW_PROJECT_STEMS</h3>
                           <p className="text-[10px] font-bold uppercase text-white/40 mt-2">14 FILES</p>
                        </div>
                        <div onClick={() => setDrilldownFolderId('f2')} className="bg-[#111111] p-8 border border-white/5 hover:border-[#EF4444] cursor-pointer transition-all group rounded-sm">
                           <Folder size={32} className="text-white/20 group-hover:text-[#EF4444] mb-4" />
                           <h3 className="text-sm font-black uppercase tracking-widest text-white">LUNAR ECLIPSE (BEATS)</h3>
                           <p className="text-[10px] font-bold uppercase text-white/40 mt-2">2 FILES</p>
                        </div>
                      </>
                    )}
                 </div>
              </motion.div>
            )}

            {/* VAULT NODE: DRILLDOWN (FULL PAGE) */}
            {activeTab === 'vault' && drilldownFolderId && (
              <motion.div key="drilldown" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full w-full pb-8">
                 <div className="flex items-center justify-between mb-8 shrink-0 flex-wrap gap-4">
                    <button onClick={() => setDrilldownFolderId(null)} className="px-5 py-3 border border-white/5 rounded-sm hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all text-white/60 hover:text-white">
                       <ArrowLeft size={16}/> BACK_TO_VAULT
                    </button>
                    <button onClick={() => setShowMixRequestModal(true)} className="px-8 py-3 bg-[#EF4444] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-sm shadow-xl shadow-red-950/20 hover:brightness-110">
                       SEND MIX REQUEST
                    </button>
                 </div>
                 
                 <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
                    {/* Left Column (Upload & Stems) */}
                    <div className="flex-1 flex flex-col min-h-0 pr-0 lg:pr-2 overflow-y-auto custom-scrollbar">
                       
                       {/* Dismissible Engineer Tip */}
                       <AnimatePresence>
                         {showEngineerTip && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="shrink-0 w-full mb-6 relative z-20">
                             <div className="px-8 py-8 rounded-sm bg-[#EF4444]/10 border border-[#EF4444]/20 flex flex-col items-center justify-center text-center relative shadow-lg">
                               <button onClick={() => setShowEngineerTip(false)} className="absolute right-4 top-4 text-[#EF4444]/50 hover:text-[#EF4444] transition-colors p-2 bg-black/20 rounded-sm hover:bg-black/40">
                                 <X size={16} />
                               </button>
                               <h4 className="text-sm font-black uppercase tracking-tight text-[#EF4444] mb-3 flex items-center justify-center gap-2 w-full">
                                 <Sparkles size={16} /> Ready for Engineering?
                               </h4>
                               <p className="text-xs font-black text-white/90 uppercase tracking-[0.15em] leading-loose w-full">
                                 Once correctly organized and uploaded onto the grid below, click the <span className="text-[#EF4444] border-b border-[#EF4444]/30">'Send Mix Request'</span> button above to securely lock in your submission and alert the studio.
                               </p>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                       
                       {/* Upload Area */}
                       <div className="p-8 border border-dashed border-white/10 rounded-sm bg-[#111111] flex flex-col items-center justify-center text-center mb-6 shrink-0 relative overflow-hidden group transition-colors hover:bg-white/[0.02]">
                         <div className="absolute inset-0 bg-[#EF4444]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                         <Upload size={28} className="text-white/20 mb-3 group-hover:text-[#EF4444] transition-colors relative z-10" />
                         <h4 className="text-xs font-black uppercase tracking-widest text-white/80 mb-2 relative z-10">Select or Drop Stems Here</h4>
                         <p className="text-[10px] font-bold text-white/40 max-w-lg uppercase tracking-wider leading-relaxed relative z-10">
                           Ensure all stems are exported at the identical sample rate, start accurately from 0:00, and are completely dry.
                         </p>
                         <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileUpload} disabled={isUploading} />
                       </div>
                       
                       {isUploading && (
                         <div className="mb-6 w-full h-1 bg-[#111111] border border-white/5">
                            <div className="h-full bg-[#EF4444]" style={{ width: `${uploadProgress}%` }} />
                         </div>
                       )}

                       {/* Data Table */}
                       <div className="flex-1 min-h-0 flex flex-col">
                          <div className="w-full bg-[#0A0A0A] border border-white/5 flex flex-col font-mono text-[10px] uppercase tracking-widest shadow-xl overflow-hidden rounded-sm shrink-0">
                             <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-[#111111] text-white/40 font-black shrink-0">
                                <div className="col-span-8">Stem Name</div>
                                <div className="col-span-4 text-right">Size</div>
                             </div>
                             <div className="divide-y divide-white/5">
                                {vaultAssets.map(a => (
                                  <div key={a.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                                     <div className="col-span-8 flex items-center gap-4">
                                        <FileAudio size={14} className="text-white/20" />
                                        <span className="truncate">{a.name}</span>
                                     </div>
                                     <div className="col-span-4 text-right text-white/40">{(a.size / (1024*1024)).toFixed(2)} MB</div>
                                  </div>
                                ))}
                                {vaultAssets.length === 0 && (
                                   <div className="p-10 text-center text-white/20">NO ASSETS UPLOADED YET</div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Right Column (Project Notes Accordion) */}
                    <div className="w-full lg:w-[320px] xl:w-[400px] shrink-0 flex flex-col bg-[#0A0A0A] border border-white/5 rounded-sm overflow-hidden shadow-xl lg:h-full">
                       <button onClick={() => setShowNotes(!showNotes)} className="px-6 py-6 border-b border-white/5 bg-[#111111] hover:bg-white/[0.02] transition-colors w-full flex items-center justify-between group shrink-0">
                         <div className="text-[#EF4444] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
                           <FileText size={16} /> Project Notes
                         </div>
                         <ChevronRight size={16} className={`text-white/40 group-hover:text-white transition-transform duration-300 ${showNotes ? 'rotate-90 text-white' : ''}`} />
                       </button>
                       <AnimatePresence>
                         {showNotes && (
                           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0 bg-[#0E0E0E]">
                             <div className="p-6 flex flex-col gap-8">
                               <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">General Notes</label>
                                 <textarea className="w-full h-40 bg-black border border-white/5 rounded-sm p-5 resize-none text-[11px] font-bold text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#EF4444]/50 transition-colors custom-scrollbar leading-relaxed" placeholder="Add creative direction, BPM/Key info, and any specific mixing requests for the engineer here..."></textarea>
                               </div>
                               <div className="flex flex-col gap-3">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3B82F6] flex flex-col gap-1.5">
                                   Reference Links
                                   <span className="text-[8px] font-black tracking-widest text-[#3B82F6]/40">Drop Spotify, Apple Music, or YouTube links</span>
                                 </label>
                                 <textarea className="w-full h-32 bg-black border border-[#3B82F6]/20 rounded-sm p-5 resize-none text-[11px] font-bold text-[#3B82F6]/90 placeholder:text-[#3B82F6]/30 focus:outline-none focus:border-[#3B82F6] transition-colors custom-scrollbar leading-relaxed" placeholder="Paste URLs here..."></textarea>
                               </div>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>

                 </div>
              </motion.div>
            )}

            {/* REVIEW / REVISIONS PAGE (New Integration) */}
            {activeTab === 'review' && reviewTrack && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full w-full pb-8">
                 <div className="flex items-center gap-4 mb-10 shrink-0">
                     <button onClick={() => { setActiveTab('masters'); setReviewTrack(null); }} className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 text-white/40 hover:text-[#EF4444] hover:bg-white/10 flex items-center justify-center transition-all">
                       <ArrowLeft size={20} />
                     </button>
                     <div>
                       <h2 className="text-3xl font-display uppercase tracking-tight text-white mb-0 italic">{reviewTrack.projectName}</h2>
                       <p className="text-[10px] font-black text-[#EF4444] uppercase tracking-[0.4em] mt-1">Review Session Active</p>
                     </div>
                 </div>
                 
                 <div className="flex-1 flex gap-8 min-h-0">
                   {/* Left Column: Revision Input */}
                   <div className="flex-1 flex flex-col bg-[#0A0A0A] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
                     <div className="px-8 py-6 border-b border-white/5 bg-[#111111] flex items-center gap-3 shrink-0">
                       <Sparkles size={16} className="text-[#EF4444]" />
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#EF4444]">Submit Mix Notes</h3>
                     </div>
                     <div className="flex-1 p-10 flex flex-col items-center justify-center relative bg-[#0E0E0E]">
                       <div className="w-full max-w-2xl text-center mb-8">
                         <h4 className="text-[18px] font-black text-white tracking-tight mb-2 uppercase">Notice something to fix?</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Your note will automatically attach to the global timeline's current position.</p>
                       </div>
                       <textarea className="w-full max-w-2xl h-40 bg-black border border-white/10 rounded-sm p-6 resize-none text-[12px] font-bold text-white/90 placeholder:text-white/20 focus:outline-none focus:border-[#EF4444]/50 transition-colors custom-scrollbar leading-loose mx-auto shadow-inner" placeholder="Example: Turn the kick drum up 2dB and widen the stereo synth slightly..."></textarea>
                       <button className="mt-8 px-12 py-5 bg-[#EF4444] text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-sm hover:-translate-y-1 transition-transform shadow-[0_10px_40px_rgba(239,68,68,0.3)]">Pin Revision Note</button>
                     </div>
                   </div>
                   
                   {/* Right Column: Revision Ledger */}
                   <div className="w-[400px] shrink-0 flex flex-col bg-[#111111] border border-white/5 rounded-sm overflow-hidden shadow-xl">
                     <div className="px-6 py-6 border-b border-white/5 bg-[#0A0A0A] shrink-0">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Active Change Log</h3>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                       <div className="p-6 rounded-sm border border-white/5 bg-black">
                         <div className="flex items-center justify-between mb-4">
                           <span className="text-[10px] font-black tracking-widest text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-1.5 rounded-sm">0:45</span>
                           <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] bg-white/5 px-2 py-1 rounded-sm">PENDING</span>
                         </div>
                         <p className="text-[11px] font-bold text-white/80 leading-relaxed uppercase tracking-widest">The 808 is dropping out slightly here, can we boost the sub frequencies?</p>
                       </div>
                     </div>
                   </div>
                 </div>
              </motion.div>
            )}


          </AnimatePresence>
        </main>
      </div>

      {/* Modals (Fixed & Functional) */}
      <AnimatePresence>
        {showMixRequestModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="w-full max-w-xl bg-[#0A0A0A] border border-white/5 p-12 rounded-sm shadow-2xl relative">
                <button onClick={() => setShowMixRequestModal(false)} className="absolute top-10 right-10 text-white/20 hover:text-[#EF4444] transition-colors"><X size={24} /></button>
                <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-2 italic">INITIALIZE_NODE</h2>
                <p className="text-[10px] font-black text-[#EF4444] uppercase tracking-[0.4em] mb-12">DIRECT SIGNAL CONTACT REQUEST</p>
                <div className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">REFERENCE_URL</label>
                      <input 
                        type="url" 
                        value={orderFormData.referenceUrl}
                        onChange={(e) => setOrderFormData({...orderFormData, referenceUrl: e.target.value})}
                        placeholder="YT / SPOTIFY IDENTITY..." 
                        className="w-full bg-black border border-white/5 p-5 text-xs font-black uppercase text-white placeholder:text-white/5 rounded-sm outline-none focus:border-[#EF4444]/40" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">SIGNAL_DIRECTIVES</label>
                      <textarea 
                        rows={3} 
                        value={orderFormData.notes}
                        onChange={(e) => setOrderFormData({...orderFormData, notes: e.target.value})}
                        placeholder="SONIC_OBJECTIVES..." 
                        className="w-full bg-black border border-white/5 p-5 text-xs font-black uppercase text-white placeholder:text-white/5 rounded-sm outline-none focus:border-[#EF4444]/40 resize-none" 
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">ATTACH_VAULT_STEMS</label>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                         {vaultAssets.map(a => (
                            <button
                               key={a.id}
                               onClick={() => {
                                  const alreadySelected = orderFormData.selectedFiles.includes(a.id);
                                  setOrderFormData({
                                     ...orderFormData,
                                     selectedFiles: alreadySelected 
                                        ? orderFormData.selectedFiles.filter(id => id !== a.id)
                                        : [...orderFormData.selectedFiles, a.id]
                                  });
                               }}
                               className={`w-full flex items-center justify-between p-4 rounded-sm border transition-all ${
                                  orderFormData.selectedFiles.includes(a.id)
                                     ? 'bg-[#EF4444]/10 border-[#EF4444] text-white'
                                     : 'bg-black border-white/5 text-white/40 hover:border-white/10'
                               }`}
                            >
                               <span className="text-[10px] font-black uppercase truncate">{a.name}</span>
                               <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  orderFormData.selectedFiles.includes(a.id) ? 'bg-[#EF4444] border-transparent' : 'border-white/10'
                               }`}>
                                  {orderFormData.selectedFiles.includes(a.id) && <Check size={10} className="text-black" />}
                               </div>
                            </button>
                         ))}
                         {vaultAssets.length === 0 && (
                            <p className="text-[10px] font-black text-white/10 uppercase py-4">NO_ASSETS_FOUND</p>
                         )}
                      </div>
                   </div>
                   <button onClick={handleSubmitOrder} className="w-full py-5 bg-[#EF4444] text-white font-black uppercase tracking-[0.3em] text-[12px] rounded-sm shadow-2xl shadow-red-900/40 hover:brightness-110 active:scale-[0.98] transition-all">ESTABLISH CONNECTION</button>
                </div>
            </motion.div>
          </div>
        )}

        {showEquitablePrompt && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="w-full max-w-md bg-[#0A0A0A] border border-white/5 p-16 rounded-sm shadow-2xl text-center relative">
                <button onClick={() => setShowEquitablePrompt(false)} className="absolute top-10 right-10 text-white/20 hover:text-[#EF4444] transition-colors"><X size={24} /></button>
                <div className="w-24 h-24 bg-[#EF4444]/5 border border-[#EF4444]/20 flex items-center justify-center mx-auto mb-10 text-[#EF4444] rounded-sm"><FileText size={48} /></div>
                <h2 className="text-3xl font-display font-black uppercase tracking-tight mb-4 italic">PROTOCOL_DISPATCHED</h2>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-loose mb-12">CONTACT ESTABLISHED. REACH ENGINEER ON <span className="text-[#EF4444]">@PERONASTUDIO</span> FOR FINAL ALLOCATION.</p>
                <button onClick={() => setShowEquitablePrompt(false)} className="w-full py-6 border border-white/5 bg-white/[0.02] text-white/40 font-black uppercase tracking-[0.4em] text-[10px] hover:text-white hover:bg-white/5 transition-all rounded-sm">RETURN_TO_TERMINAL</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

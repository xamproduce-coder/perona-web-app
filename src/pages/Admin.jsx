// src/pages/Admin.jsx
// ─────────────────────────────────────────────────────────────
// ADMIN PORTAL: Managing orders, tracking stems, and reviewing revisions.
// Now with Native Master Delivery & Vault-to-Order Link support.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllOrders, getAllUsers, toggleUserVaultAccess, updateOrder } from '../lib/db';
import { db, COLLECTIONS } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { uploadFinalMaster } from '../lib/storage';
import { useRealtimeRevisions } from '../hooks/useRealtimeRevisions';
import { FileAudio, Download, Disc3, Upload, CheckCircle2, Loader2 } from 'lucide-react';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers]   = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Master Upload State
  const [masterFile, setMasterFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const masterInputRef = useRef(null);

  const { revisions, loading: revisionsLoading } = useRealtimeRevisions(selectedOrder?.id);

  // ─── Fetch All Data ──────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      if (!isAdmin) return;
      try {
        const [ordersData, usersData] = await Promise.all([
          getAllOrders(),
          getAllUsers()
        ]);
        setOrders(ordersData);
        setUsers(usersData);
        if (ordersData.length > 0) setSelectedOrder(ordersData[0]);
      } catch (err) {
        console.error("Admin Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAdmin]);

  // ─── Handle Status Update ───────────────────────────────────
  const updateStatus = async (newStatus) => {
    try {
      await updateOrder(selectedOrder.id, { status: newStatus });
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  // ─── Handle Revision Resolving ──────────────────────────────
  const resolveRevision = async (revId) => {
    try {
      const revRef = doc(db, COLLECTIONS.REVISIONS, revId);
      await updateDoc(revRef, { status: 'resolved' });
    } catch (err) {
      console.error("Resolve Error:", err);
    }
  };

  // ─── Native Master Delivery ────────────────────────────────
  const handleMasterUpload = async (file) => {
    if (!file || !selectedOrder) return;
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadFinalMaster(selectedOrder.id, file, (prog) => {
        setUploadProgress(prog);
      });

      const updateData = {
        masterUrl: result.url,
        masterName: result.name,
        masterRef: result.refPath,
        status: 'review',
        deliveredAt: serverTimestamp()
      };

      await updateOrder(selectedOrder.id, updateData);

      // Reflect locally
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, ...updateData } : o));
      setSelectedOrder({ ...selectedOrder, ...updateData });
      setMasterFile(null);
      alert("Master delivered successfully!");

    } catch (err) {
      console.error("Master Delivery Error:", err);
      alert("Delivery Failed: " + err.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-black italic">
      <div className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 animate-pulse">Scanning Master Vault...</div>
    </div>
  );

  return (
    <div className="pt-28 pb-20 min-h-screen grid grid-cols-1 lg:grid-cols-4 gap-10 px-6 sm:px-12 max-w-[1600px] mx-auto bg-black font-sans selection:bg-[#FDE047]/20">
      
      {/* ─── Projects List ────────────────────────────────────────── */}
      <div className="lg:col-span-1 space-y-10 border-r border-white/5 pr-8">
        <div>
          <h3 className="text-[10px] text-[#FDE047] uppercase tracking-[0.4em] font-black mb-8 border-b border-white/5 pb-4">Studio Queue</h3>
          <div className="space-y-3 custom-scrollbar max-h-[70vh] overflow-y-auto pr-2">
            {orders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${
                  selectedOrder?.id === order.id ? 'bg-[#FDE047]/10 border-[#FDE047]/30 text-white shadow-[0_10px_30px_rgba(253,224,71,0.05)]' : 'bg-white/[0.02] border-white/[0.05] text-white/40 hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <div className={`text-[9px] font-black uppercase tracking-[0.3em] mb-2 ${selectedOrder?.id === order.id ? 'text-[#FDE047]/60' : 'text-white/20'}`}>{order.artistName || 'Unnamed Artist'}</div>
                <div className="text-sm font-bold truncate tracking-tight transition-colors group-hover:text-white uppercase">{order.projectName || 'Untitled'}</div>
                <div className={`text-[8px] uppercase font-black px-2 py-1 rounded-md border mt-4 inline-block tracking-widest ${
                  order.status === 'review' ? 'border-[#FDE047] text-[#FDE047] bg-[#FDE047]/5' : (order.status === 'finalized' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-white/30')
                }`}>{order.status.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Client Management ─── */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <h3 className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black mb-6">Client Permissions</h3>
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="mindwave-glass p-5 flex flex-col gap-4 border border-white/[0.03]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white truncate">{u.displayName || 'Client'}</span>
                    <span className="text-[9px] font-bold text-white/20 truncate lowercase mt-0.5">{u.email}</span>
                  </div>
                  <button
                    onClick={async () => {
                      const status = !!u.hasPaidMixMaster;
                      await toggleUserVaultAccess(u.id, status);
                      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, hasPaidMixMaster: !status } : usr));
                    }}
                    className={`w-10 h-5 rounded-full relative transition-colors border ${
                      u.hasPaidMixMaster ? 'bg-[#FDE047] border-[#FDE047]' : 'bg-black border-white/10'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full absolute top-1/2 -translate-y-1/2 transition-transform ${
                      u.hasPaidMixMaster ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white/20'
                    }`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Management View ──────────────────────────────────────── */}
      <div className="lg:col-span-3">
        {selectedOrder ? (
          <div className="mindwave-glass p-8 lg:p-14 border border-white/[0.05] bg-white/[0.01] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-12 border-b border-white/5">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FDE047]/60 mb-4 ml-1">Live Project</p>
                <h2 className="text-6xl font-display uppercase tracking-tighter text-white leading-none mb-6 italic">{selectedOrder.projectName}</h2>
                <div className="flex flex-wrap items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Artist Identification</span>
                      <span className="text-sm font-bold text-white/80">{selectedOrder.artistName}</span>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Service Tier</span>
                      <span className="text-sm font-bold text-white/80 uppercase">{selectedOrder.service || selectedOrder.serviceType}</span>
                   </div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="p-8 bg-black/40 border border-white/10 rounded-3xl flex flex-col gap-6 min-w-[240px] shadow-inner">
                 <p className="text-[9px] uppercase tracking-[0.4em] font-black text-white/25 text-center">Set Production State</p>
                 <div className="flex flex-col gap-2.5">
                    {['pending', 'in_progress', 'review', 'finalized'].map(s => (
                       <button 
                         key={s} 
                         onClick={() => updateStatus(s)}
                         className={`px-4 py-3 text-[9px] uppercase font-black tracking-[0.2em] transition-all rounded-xl border ${
                            selectedOrder.status === s ? 'bg-[#FDE047] text-black border-[#FDE047] shadow-[0_0_20px_rgba(253,224,71,0.2)]' : 'bg-white/[0.02] text-white/40 border-white/10 hover:border-white/20 hover:text-white'
                         }`}
                       >{s.replace('_', ' ')}</button>
                    ))}
                 </div>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-12 border-b border-white/5">
               
               {/* Left: Metadata & Notes */}
               <div className="space-y-12">
                  <div className="space-y-6">
                     <h3 className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black flex items-center gap-4">
                        Brief & Intent <div className="h-px flex-1 bg-white/5" />
                     </h3>
                     <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] text-sm font-medium leading-relaxed text-white/60 italic">
                        "{selectedOrder.notes || 'No extra notes provided.'}"
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     {selectedOrder.bpm && (
                        <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                           <p className="text-[8px] uppercase font-black tracking-[0.4em] text-white/20 mb-2">BPM</p>
                           <p className="text-2xl font-black text-[#FDE047] tabular-nums tracking-tighter">{selectedOrder.bpm}</p>
                        </div>
                     )}
                     {selectedOrder.key && (
                        <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                           <p className="text-[8px] uppercase font-black tracking-[0.4em] text-white/20 mb-2">Project Key</p>
                           <p className="text-2xl font-black text-white/80">{selectedOrder.key}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right: Files & Vault Selection Link */}
               <div className="space-y-8">
                  <h3 className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black flex items-center gap-4">
                    Captured Stems <div className="h-px flex-1 bg-white/5" />
                  </h3>
                  
                  <div className="space-y-3">
                     {!selectedOrder.stems || selectedOrder.stems.length === 0 ? (
                       <div className="p-10 border border-dashed border-white/5 rounded-[2rem] text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/10">No vault stems attached</p>
                       </div>
                     ) : (
                       selectedOrder.stems.map((stem, i) => (
                          <div key={i} className="flex justify-between items-center p-5 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-[#FDE047]/30 transition-all">
                             <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-9 h-9 rounded-lg bg-black/40 flex items-center justify-center text-white/20 border border-white/5 group-hover:text-[#FDE047]/60 transition-colors shrink-0">
                                   <FileAudio size={16} />
                                </div>
                                <span className="text-xs font-bold text-white/70 truncate group-hover:text-white transition-colors">{stem.name}</span>
                             </div>
                             <a href={stem.url} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] uppercase font-black text-white/30 hover:text-[#FDE047] transition-all tracking-widest px-4 py-2 bg-white/5 rounded-lg flex items-center gap-2">
                                <Download size={12} />
                                <span>Get</span>
                             </a>
                          </div>
                       ))
                     )}
                     {selectedOrder.stemsLink && (
                        <a href={selectedOrder.stemsLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-[#FDE047] hover:text-black transition-all group mt-6">
                            <span className="text-[10px] font-black uppercase tracking-widest">External Transfer (Legacy)</span>
                            <Download size={16} className="group-hover:scale-110" />
                        </a>
                     )}
                  </div>
               </div>
            </div>

            {/* Native Master Delivery Pipeline */}
            <div className="py-12 border-b border-white/5">
                <div className="flex flex-col gap-2 mb-8">
                   <h3 className="text-[10px] text-[#FDE047] uppercase tracking-[0.4em] font-black">Professional Delivery Pipeline</h3>
                   <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed">
                      Files are delivered natively through the artist dashboard. Access is granted instantly.
                   </p>
                </div>

                <div className="mindwave-glass p-8 border border-white/5 bg-black/40 rounded-[2.5rem] relative overflow-hidden">
                    {/* Progress Overlay */}
                    {isUploading && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/[0.02] overflow-hidden">
                            <div className="h-full bg-[#FDE047] shadow-[0_0_15px_rgba(253,224,71,1)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-8">
                        {selectedOrder.masterUrl ? (
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Delivered Master</p>
                                    <p className="text-xl font-bold text-white truncate max-w-[200px]">{selectedOrder.masterName || 'Final Master'}</p>
                                    <a href={selectedOrder.masterUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest mt-2 underline">Preview Delivery</a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-white/10">
                                    <Loader2 className="animate-spin opacity-20" size={32} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Awaiting Delivery</p>
                                    <p className="text-xl font-bold text-white/5 italic">No File Uploaded Yet</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex justify-end">
                            <input
                                type="file"
                                ref={masterInputRef}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleMasterUpload(file);
                                }}
                            />
                            <button
                                onClick={() => masterInputRef.current?.click()}
                                disabled={isUploading}
                                className="btn-ssl !py-5 !px-12 flex items-center gap-3"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>SECURE UPLOADING {uploadProgress}%</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        <span>{selectedOrder.masterUrl ? 'RE-UPLOAD MASTER' : 'UPLOAD FINAL MASTER'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revision Thread (Simplified) */}
            <div className="pt-12">
               <h3 className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black mb-8 px-1">Revision History</h3>
               {revisionsLoading ? (
                  <div className="text-[10px] font-black text-white/10 animate-pulse">Syncing notes...</div>
               ) : (
                  <div className="space-y-3">
                     {revisions.map(rev => (
                        <div key={rev.id} className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-between group">
                           <div className="flex items-center gap-6">
                              <span className="text-[10px] font-black text-[#FDE047]/40 tabular-nums">{formatTime(rev.timestamp)}</span>
                              <p className="text-sm font-medium text-white/60">"{rev.note}"</p>
                           </div>
                           <button onClick={() => resolveRevision(rev.id)} className={`text-[8px] font-black uppercase px-2 py-1 rounded-md border transition-all ${
                               rev.status === 'resolved' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-white/20 hover:border-[#FDE047] hover:text-[#FDE047]'
                           }`}>
                               {rev.status}
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-white/5 uppercase tracking-[0.5em] text-2xl font-display font-bold border border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
             <Disc3 size={64} className="mb-8 opacity-20 animate-[spin_10s_linear_infinite]" />
             Select Project to manage
          </div>
        )}
      </div>
    </div>
  );
}

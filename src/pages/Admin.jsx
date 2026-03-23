// src/pages/Admin.jsx
// ─────────────────────────────────────────────────────────────
// ADMIN PORTAL: Managing orders, tracking stems, and reviewing revisions.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllOrders } from '../lib/db';
import { db, COLLECTIONS } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { listStems } from '../lib/storage';
import { useRealtimeRevisions } from '../hooks/useRealtimeRevisions';
import { FileAudio, Download } from 'lucide-react';

export default function Admin() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stems, setStems] = useState([]);
  const [masterLink, setMasterLink] = useState('');

  const { revisions, loading: revisionsLoading } = useRealtimeRevisions(selectedOrder?.id);

  // ─── Fetch All Orders ──────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      if (!isAdmin) return;
      try {
        const data = await getAllOrders();
        setOrders(data);
        if (data.length > 0) setSelectedOrder(data[0]);
      } catch (err) {
        console.error("Admin Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAdmin]);

  // ─── Fetch Stems when order selected ─────────────────────
  useEffect(() => {
    if (!selectedOrder) return;
    listStems(selectedOrder.userId, selectedOrder.id)
      .then(setStems)
      .catch(console.error);
  }, [selectedOrder]);

  // ─── Handle Status Update ───────────────────────────────────
  const updateStatus = async (newStatus) => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, selectedOrder.id);
      await updateDoc(docRef, { status: newStatus });
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

  // ─── Handle Master Delivery ────────────────────────────────
  const handleDeliverMaster = async (e) => {
    e.preventDefault();
    if (!masterLink.trim()) return;

    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, selectedOrder.id);
      await updateDoc(docRef, { 
        masterUrl: masterLink, 
        status: 'review',
        deliveredAt: serverTimestamp() 
      });

      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, masterUrl: masterLink, status: 'review' } : o));
      setSelectedOrder({ ...selectedOrder, masterUrl: masterLink, status: 'review' });
      setMasterLink('');
      alert("Master delivered!");
    } catch (err) {
      console.error("Master Delivery Error:", err);
    }
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return <div className="text-center pt-32 text-muted uppercase tracking-widest text-xs font-bold">Loading Projects...</div>;

  return (
    <div className="pt-24 pb-12 min-h-screen grid grid-cols-1 lg:grid-cols-4 gap-8 px-6 max-w-7xl mx-auto bg-white">
      
      {/* ─── Projects List ────────────────────────────────────────── */}
      <div className="lg:col-span-1 space-y-6">
        <h3 className="text-xs text-black uppercase tracking-widest font-black decoration-2 underline-offset-4 mb-4">Active Queue</h3>
        <div className="space-y-3">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`w-full text-left p-5 border-2 transition-all group ${
                selectedOrder?.id === order.id ? 'border-black bg-black text-white shadow-[4px_4px_0px_#000]' : 'border-black bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`text-[9px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-gray-300' : 'text-gray-500'}`}>{order.artistName}</div>
              <div className="text-sm font-black truncate capitalize mt-1 tracking-tight">{order.projectName}</div>
              <div className={`text-[9px] uppercase font-black px-2 py-0.5 border-2 mt-3 inline-block ${
                order.status === 'review' ? 'border-accent text-accent' : selectedOrder?.id === order.id ? 'border-white text-white' : 'border-black text-black'
              }`}>{order.status.replace('_', ' ')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Management View ──────────────────────────────────────── */}
      <div className="lg:col-span-3">
        {selectedOrder ? (
          <div className="space-y-8 p-8 lg:p-12 border-2 border-black bg-white shadow-[8px_8px_0px_#000]">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b-2 border-black">
              <div>
                <h2 className="text-5xl font-display capitalize tracking-tighter">{selectedOrder.projectName}</h2>
                <div className="text-black text-xs mt-4 flex flex-wrap items-center gap-4 uppercase tracking-[0.2em] font-black">
                  <span>Artist: {selectedOrder.artistName}</span>
                  <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  <span>{selectedOrder.serviceType}</span>
                </div>
              </div>

              {/* Status Controls */}
              <div className="p-4 bg-white border-2 border-black flex flex-col gap-3 min-w-[200px] shadow-[4px_4px_0px_#000]">
                 <p className="text-[10px] uppercase tracking-widest font-black text-black">Set State</p>
                 <div className="flex flex-col gap-2">
                    {['pending', 'in_progress', 'review', 'finalized'].map(s => (
                       <button 
                         key={s} 
                         onClick={() => updateStatus(s)}
                         className={`px-3 py-2 text-[10px] uppercase font-black tracking-widest transition-all border-2 ${
                            selectedOrder.status === s ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-gray-100'
                         }`}
                       >{s.replace('_', ' ')}</button>
                    ))}
                 </div>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               
               {/* Left: Metadata & Notes */}
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] text-black uppercase tracking-widest font-black">Production Notes</h3>
                     <div className="p-6 bg-white border-2 border-black text-sm font-medium leading-relaxed shadow-[4px_4px_0px_#000]">
                        {selectedOrder.notes || 'No extra notes provided.'}
                     </div>
                  </div>

                  {/* Metadata block */}
                  <div className="grid grid-cols-2 gap-4">
                     {selectedOrder.bpm && (
                        <div className="p-4 border-2 border-black">
                           <p className="text-[9px] uppercase font-black tracking-widest text-muted mb-1">BPM</p>
                           <p className="text-lg font-black">{selectedOrder.bpm}</p>
                        </div>
                     )}
                     {selectedOrder.keySigma && (
                        <div className="p-4 border-2 border-black">
                           <p className="text-[9px] uppercase font-black tracking-widest text-muted mb-1">Key</p>
                           <p className="text-lg font-black">{selectedOrder.keySigma}</p>
                        </div>
                     )}
                     {selectedOrder.targetLufs && (
                        <div className="p-4 border-2 border-black col-span-2">
                           <p className="text-[9px] uppercase font-black tracking-widest text-muted mb-1">Target LUFS</p>
                           <p className="text-lg font-black">{selectedOrder.targetLufs}</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right: Files & Vault */}
               <div className="space-y-6">
                  <h3 className="text-[10px] text-black uppercase tracking-widest font-black">Stems & Assets</h3>
                  
                  {/* External Stem Link */}
                  {selectedOrder.stemsLink && (
                     <a 
                       href={selectedOrder.stemsLink} 
                       target="_blank" 
                       rel="noreferrer"
                       className="p-5 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-all flex items-center justify-between group shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                     >
                       <span className="text-xs font-black uppercase tracking-widest">External Stems Link</span>
                       <Download className="w-5 h-5 text-current group-hover:scale-110 transition-transform" />
                     </a>
                  )}

                  {/* Vault Stems list */}
                  {stems.length > 0 && (
                     <div className="space-y-3 pt-4 border-t-2 border-black">
                        <h4 className="text-[10px] font-black uppercase tracking-widest mb-3">Internal Vault</h4>
                        {stems.map((stem, i) => (
                           <div key={i} className="flex justify-between items-center p-3 border-2 border-black bg-gray-50">
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <FileAudio className="w-4 h-4 shrink-0" />
                                 <span className="text-xs font-bold truncate">{stem.name}</span>
                              </div>
                              <a href={stem.url} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] uppercase font-black border-b-2 border-black hover:text-accent hover:border-accent ml-2">DL</a>
                           </div>
                        ))}
                     </div>
                  )}

               </div>
            </div>

            {/* Revision Thread Review */}
            {(selectedOrder.status === 'review' || selectedOrder.status === 'finalized') && (
               <div className="space-y-6 pt-10 border-t-2 border-black mt-10">
                  <h3 className="text-[10px] text-black uppercase tracking-widest font-black">Revision Thread</h3>
                  {revisionsLoading ? (
                     <div className="text-xs font-bold uppercase animate-pulse">Loading thread...</div>
                  ) : revisions.length === 0 ? (
                     <p className="text-xs font-medium text-gray-400">No revisions requested yet.</p>
                  ) : (
                     <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                        {revisions.map(rev => (
                           <div key={rev.id} className="p-6 border-2 border-black bg-white flex gap-6 items-start group">
                              <div className="shrink-0 text-[10px] font-black uppercase border-2 border-black px-2 py-1 bg-black text-white">
                                 {formatTime(rev.timestamp)}
                              </div>
                              <div className="flex-1 space-y-2">
                                 <p className="text-sm font-medium leading-relaxed">"{rev.note}"</p>
                                 <div className="flex items-center gap-4 pt-2">
                                    <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 border ${
                                       rev.status === 'resolved' ? 'border-green-500 text-green-500 bg-green-50' : 'border-orange-500 text-orange-500 bg-orange-50'
                                    }`}>
                                       {rev.status}
                                    </span>
                                    {rev.status !== 'resolved' && (
                                       <button 
                                          onClick={() => resolveRevision(rev.id)}
                                          className="text-[9px] uppercase font-black border-b-2 border-black hover:text-gray-500 hover:border-gray-500 transition-colors"
                                       >
                                          Mark Resolved
                                       </button>
                                    )}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            )}

            {/* Deliver Master */}
            <div className="space-y-6 pt-10 border-t-2 border-black mt-10">
               <h3 className="text-[10px] text-black uppercase tracking-widest font-black">Deliver Master</h3>
               <form onSubmit={handleDeliverMaster} className="flex gap-4">
                  <input
                    type="url"
                    required
                    placeholder="Enter link to the final master (Drive, Dropbox, etc.)"
                    className="flex-1 bg-white border-2 border-black p-4 text-sm focus:outline-none focus:bg-gray-50 transition-colors font-medium placeholder:text-gray-400"
                    value={masterLink}
                    onChange={(e) => setMasterLink(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 border-2 border-black bg-black text-white text-xs font-black transition-all uppercase tracking-widest hover:bg-white hover:text-black shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none"
                  >
                    Send to Review
                  </button>
               </form>
               <p className="text-[10px] text-muted font-bold ml-1 uppercase tracking-widest">Delivering a master will automatically set the project to "Review" status and notify the artist.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[50vh] text-black uppercase tracking-widest text-xl font-display font-bold border-2 border-dashed border-gray-300 p-12">Select an order to manage</div>
        )}
      </div>
    </div>
  );
}

/**
 * ProTrackSelector.jsx
 * -------------------
 * Advanced, hierarchical order browser for the Perona Dashboard.
 * 
 * This is the "logic-complete" version of the hyphen-folder's TrackSelector, 
 * now wired to real Firestore data from 'web v2'.
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Play, Pause, Disc3, ChevronRight, 
  Clock, Music2, Loader2
} from 'lucide-react';

/* ─────────────────────
   Status Mapping
   ───────────────────────*/
const STATUS_META = {
  queued: { label: 'Queued', color: '#666666', bg: '#f4f4f4' },
  in_progress:  { label: 'Mixing',  color: '#000000',  bg: '#eeeeee'  },
  review:      { label: 'Review',     color: '#0066FF',      bg: '#000000'      },
  revision_requested:      { label: 'Revision',     color: '#0066FF',      bg: '#000000'      },
  finalized:      { label: 'Final',     color: '#0066FF',      bg: '#000000'      },
};

/* ─────────────────────
   Sub-component: OrderRow (TrackRow equivalent)
   ───────────────────────*/
const OrderRow = ({ order, isSelected, onSelect, isPreviewPlaying, onPreviewToggle }) => {
  const [hovered, setHovered] = useState(false);
  const status = STATUS_META[order.status] || STATUS_META.queued;

  const formatLength = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(order)}
      className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-all border-b border-gray-50 last:border-0 ${
        isSelected ? 'bg-white text-[#0066FF]' : 'hover:bg-gray-50 text-black'
      }`}
      data-selected={isSelected}
      data-hovered={hovered}
    >
      {/* Play/Preview button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPreviewToggle(order.id); }}
        className={`w-6 h-6 flex items-center justify-center transition-opacity ${
          hovered || isPreviewPlaying || isSelected ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {isPreviewPlaying
          ? <Pause size={12} fill="currentColor" />
          : <Play  size={12} fill="currentColor" />}
      </button>

      {/* ID / Indicator */}
      <div className="w-6 text-[10px] font-black uppercase opacity-40">
        {isPreviewPlaying ? (
          <span className="flex gap-0.5 items-end h-3">
             <motion.span animate={{ height: ['4px', '12px', '4px'] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-current" />
             <motion.span animate={{ height: ['8px', '4px', '8px'] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-current" />
             <motion.span animate={{ height: ['3px', '10px', '3px'] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-current" />
          </span>
        ) : isSelected ? '▸' : order.id.slice(0, 2)}
      </div>

      {/* Title & Metadata */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-black uppercase truncate ${isSelected ? 'text-[#0066FF]' : 'text-black'}`}>
          {order.projectName || 'Untitled Order'}
        </div>
        <div className={`text-[10px] flex gap-2 opacity-50 font-bold uppercase ${isSelected ? 'text-[#0066FF]' : 'text-black'}`}>
          <span>{order.bpm || '--'} BPM</span>
          <span>·</span>
          <span>{order.keySigma || order.serviceType}</span>
        </div>
      </div>

      {/* Status */}
      <span
        className="text-[9px] font-black uppercase px-2 py-0.5"
        style={{ color: isSelected ? '#fff' : status.color, background: isSelected ? '#333' : status.bg, border: isSelected ? '1px solid #555' : 'none' }}
      >
        {status.label}
      </span>

      {/* Length/Duration */}
      <span className="text-[10px] font-bold opacity-40 w-12 text-right">
        {formatLength(order.duration)}
      </span>
    </motion.div>
  );
};

/* ─────────────────────
   Sub-component: ProjectSection (AlbumSection equivalent)
   ───────────────────────*/
const ProjectSection = ({ projectName, orders, selectedOrder, onSelect, previewId, onPreviewToggle, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-200">
           <Disc3 size={16} className="opacity-40" />
        </div>
        <div className="flex-1 text-left">
           <div className="text-xs font-black uppercase tracking-widest">{projectName || 'General Projects'}</div>
           <div className="text-[9px] text-gray-400 font-bold uppercase">{orders.length} ORDER{orders.length !== 1 ? 'S' : ''}</div>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }}>
           <ChevronRight size={14} className="opacity-40" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                isSelected={selectedOrder?.id === order.id}
                onSelect={onSelect}
                isPreviewPlaying={previewId === order.id}
                onPreviewToggle={onPreviewToggle}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════
   Main Component: ProTrackSelector
   ════════════════════════════════════════ */
export default function ProTrackSelector({ orders, loading, selectedOrder, onSelect }) {
  const [query, setQuery] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const previewTimer = useRef(null);

  /** Group orders by projectName */
  const groupedOrders = useMemo(() => {
    const filtered = query.trim()
      ? orders.filter(o => 
          o.projectName?.toLowerCase().includes(query.toLowerCase()) ||
          o.serviceType?.toLowerCase().includes(query.toLowerCase()) ||
          o.status?.toLowerCase().includes(query.toLowerCase())
        )
      : orders;

    const groups = {};
    filtered.forEach(o => {
      const name = o.projectName || 'General';
      if (!groups[name]) groups[name] = [];
      groups[name].push(o);
    });

    return Object.entries(groups).map(([name, items]) => ({
      projectName: name,
      orders: items
    }));
  }, [orders, query]);

  const handlePreviewToggle = (id) => {
    if (previewId === id) {
      setPreviewId(null);
    } else {
      setPreviewId(id);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-center border-2 border-black border-dashed">
         <Loader2 size={24} className="animate-spin opacity-40" />
         <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Syncing Library...</span>
      </div>
    );
  }

  return (
    <div className="border-2 border-black bg-white shadow-[8px_8px_0px_#000] overflow-hidden">
      {/* ── Header ── */}
      <header className="px-5 py-4 bg-white text-[#0066FF] flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-3">
          <Music2 size={16} />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Live Sessions</h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black uppercase opacity-50 px-2 py-1 border border-[#0066FF]/20">
             {orders.length} ORDERS
          </span>
          <div className="relative group">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
             <input 
               type="text" 
               placeholder="SEARCH..." 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               className="bg-white/10 hover:bg-white/20 focus:bg-white text-xs text-[#0066FF] focus:text-black px-10 py-2 border border-[#0066FF]/20 focus:border-[#0066FF] transition-all outline-none uppercase font-bold placeholder:text-[#0066FF]/40"
             />
             {query && (
               <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0066FF]/40 hover:text-[#0066FF]">✕</button>
             )}
          </div>
        </div>
      </header>

      {/* ── List ── */}
      <div className="max-h-[600px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-black scrollbar-track-gray-100">
        {groupedOrders.length === 0 ? (
          <div className="p-12 text-center space-y-4">
             <div className="text-xs font-black uppercase opacity-20 italic">No matches found for "{query}"</div>
          </div>
        ) : (
          groupedOrders.map((group, idx) => (
            <ProjectSection
              key={group.projectName}
              projectName={group.projectName}
              orders={group.orders}
              selectedOrder={selectedOrder}
              onSelect={onSelect}
              previewId={previewId}
              onPreviewToggle={handlePreviewToggle}
              defaultOpen={idx === 0}
            />
          ))
        )}
      </div>

      {/* ── Preview Indicator ── */}
      <AnimatePresence>
        {previewId && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-white text-[#0066FF] px-5 py-3 flex items-center justify-between border-t-2 border-black border-opacity-20"
          >
            <div className="flex items-center gap-4 overflow-hidden">
               <div className="flex gap-1 items-end h-3">
                 {[1,2,3,4].map(i => (
                    <motion.div 
                      key={i} 
                      animate={{ height: ['4px', '12px', '4px'] }} 
                      transition={{ repeat: Infinity, duration: 0.5 + i*0.1 }} 
                      className="w-1 bg-white" 
                    />
                 ))}
               </div>
               <span className="text-[10px] font-black uppercase truncate">
                 PREVIEWING: {orders.find(o => o.id === previewId)?.projectName}
               </span>
            </div>
            <button onClick={() => setPreviewId(null)} className="text-xs hover:scale-110 transition-transform">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

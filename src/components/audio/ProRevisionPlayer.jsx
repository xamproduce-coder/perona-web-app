import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Music, Send, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { submitRevision, updateOrder } from '../../lib/db';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  return `${m}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
};

export default function ProRevisionPlayer({ order, revisions = [], loadingRevisions }) {
  const { user } = useAuth();
  
  // ─── Playback State ─────────────────────────────────────────
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isRepeat, setIsRepeat] = useState(false);
  
  // ─── UI State ───────────────────────────────────────────────
  const [newNote, setNewNote] = useState('');
  const [myInfo, setMyInfo] = useState(order?.notes || ''); // Initialize with order notes if any
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTimestamp, setActiveTimestamp] = useState(null); // When user clicks NOTE or timeline
  
  const playerRef = useRef(null);
  const requestRef = useRef();
  const noteInputRef = useRef(null);

  // ─── Initialize Player ──────────────────────────────────────
  useEffect(() => {
    if (!order?.masterUrl) {
      if (playerRef.current) playerRef.current.unload();
      setPlaying(false);
      setSeek(0);
      setDuration(0);
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
      onend: () => {
        if (!isRepeat) setPlaying(false);
      },
    });

    return () => {
      if (playerRef.current) playerRef.current.unload();
      cancelAnimationFrame(requestRef.current);
    };
  }, [order?.masterUrl, isRepeat]);

  // Update volume
  useEffect(() => {
    if (playerRef.current) playerRef.current.volume(volume);
  }, [volume]);

  // ─── Animation Loop ─────────────────────────────────────────
  const updateProgress = () => {
    if (playerRef.current && playing) {
      setSeek(playerRef.current.seek());
    }
    requestRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (playing) {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [playing]);

  // ─── Actions ────────────────────────────────────────────────
  const togglePlay = () => {
    if (!playerRef.current) return;
    playing ? playerRef.current.pause() : playerRef.current.play();
  };

  const handleSeek = (time) => {
    if (!playerRef.current) return;
    const newTime = Math.max(0, Math.min(time, duration));
    playerRef.current.seek(newTime);
    setSeek(newTime);
  };

  const jumpToBeginning = () => {
    if (!playerRef.current) return;
    playerRef.current.seek(0);
    setSeek(0);
  };

  const skipForward = () => {
    if (!playerRef.current) return;
    const newTime = Math.min(seek + 10, duration);
    handleSeek(newTime);
  };

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const newTime = pct * duration;
    handleSeek(newTime);
    handleNoteAction(newTime);
  };

  const handleNoteAction = (time) => {
    playerRef.current?.pause(); // Pause to let them type
    setActiveTimestamp(time);
    if (noteInputRef.current) {
      noteInputRef.current.focus();
    }
  };

  const handleAddNote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const noteText = newNote.trim();
    if (!noteText || !user || !order) return;

    setSubmitting(true);
    try {
      const timeToSave = activeTimestamp !== null ? activeTimestamp : seek;
      await submitRevision(order.id, user.uid, {
        timestamp: timeToSave,
        note: noteText,
        status: 'pending',
        author: user.displayName || 'Artist',
      });
      setNewNote('');
      setActiveTimestamp(null);
      playerRef.current?.play(); // Resume playback after dropping note
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMyInfoBlur = async () => {
    if (!order || myInfo === order.notes) return;
    try {
      await updateOrder(order.id, { notes: myInfo });
    } catch (err) {
      console.error('Failed to save info:', err);
    }
  };

  if (!order) {
    return (
      <div className="p-24 text-center border-2 border-dashed border-black/20 text-black/40">
         Select a track to start playback
      </div>
    );
  }

  const sortedRevisions = [...revisions].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="bg-white rounded-3xl border-2 border-black overflow-hidden flex flex-col shadow-[8px_8px_0px_#000] text-black transition-all">
      
      {/* ── Top Section: Media Player ── */}
      <div className="p-8 bg-gray-50 border-b-2 border-black">
        
        {/* Timeline (High Contrast) */}
        <div className="relative mb-8 pt-4">
          <div 
            className="h-14 relative flex items-center cursor-crosshair group"
            onClick={handleTimelineClick}
          >
            {/* Base Line (Red as requested) */}
            <div className="absolute inset-x-0 h-1 bg-red-600/20 rounded-full">
               <div 
                 className="h-full bg-red-600 transition-all duration-100" 
                 style={{ width: `${(seek / duration) * 100}%` }}
               />
            </div>
            
            {/* Markers (Red exclamation marks as requested) */}
            <div className="absolute inset-0 pointer-events-none">
               {sortedRevisions.map((rev, idx) => {
                  const pct = duration ? (rev.timestamp / duration) * 100 : 0;
                  return (
                     <div 
                       key={rev.id || idx}
                       className="absolute top-1/2 -translate-y-1/2 text-red-600 pointer-events-auto cursor-pointer font-black text-2xl hover:scale-150 transition-all origin-bottom"
                       style={{ left: `${pct}%`, marginLeft: '-6px', marginTop: '-18px' }}
                       onMouseEnter={() => setHoveredMarker(rev)}
                       onMouseLeave={() => setHoveredMarker(null)}
                       onClick={(e) => { e.stopPropagation(); handleSeek(rev.timestamp); }}
                     >
                       !
                     </div>
                  );
               })}
            </div>

            {/* Playhead */}
            <div 
              className="absolute h-6 w-1 bg-white rounded-full -ml-0.5 z-10 pointer-events-none transition-all duration-100"
              style={{ left: `${(seek / duration) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-black/40 mt-2">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Marker Tooltip */}
          <AnimatePresence>
            {hoveredMarker && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 text-xs font-black bg-white text-[#0066FF] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 rounded-lg whitespace-nowrap z-50 pointer-events-none"
              >
                 <span className="text-red-500 mr-2">{formatTime(hoveredMarker.timestamp)}</span>
                 {hoveredMarker.note}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls (Matches User Sketch) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={jumpToBeginning} className="text-black hover:scale-110 active:scale-95 transition-all" title="Back to beginning">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button onClick={togglePlay} className="text-black hover:scale-110 active:scale-95 transition-all" title={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" />}
            </button>
            <button onClick={skipForward} className="text-black hover:scale-110 active:scale-95 transition-all" title="Skip Forward">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button 
              onClick={() => setIsRepeat(!isRepeat)} 
              className={`transition-colors ${isRepeat ? 'text-red-600' : 'text-black/40 hover:text-black'}`}
              title="Loop"
            >
              <Repeat size={24} />
            </button>
          </div>

          <div>
             <button 
               onClick={() => handleNoteAction(seek)}
               className="bg-white border-4 border-black text-black hover:bg-white hover:text-[#0066FF] font-black px-10 py-3 rounded-2xl uppercase tracking-[0.2em] text-sm transition-all shadow-[6px_6px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
             >
               NOTE
             </button>
          </div>
        </div>

      </div>

      {/* ── Bottom Section: Layout (Matches Sketch) ── */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white">
        
        {/* Left Box: MY INFO (Lined Paper Style) */}
        <div className="flex flex-col border-2 border-black rounded-3xl p-8 bg-gray-50 shadow-[6px_6px_0px_#000]">
          <h3 className="text-xl font-black uppercase text-black mb-6 tracking-widest border-b-2 border-black pb-2">
            MY INFO
          </h3>
          <textarea 
            value={myInfo}
            onChange={(e) => setMyInfo(e.target.value)}
            onBlur={handleMyInfoBlur}
            className="flex-1 w-full bg-transparent resize-none outline-none text-sm font-bold leading-[2.5rem] text-black/80 placeholder-black/20"
            style={{ 
              backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', 
              backgroundSize: '100% 2.5rem',
              marginTop: '-0.5rem'
            }}
            placeholder="Write information about the song here. This is fully editable and auto-saves to the project."
          />
        </div>

        {/* Right Box: Notes Area (Lined Paper Style) */}
        <div className="flex flex-col border-2 border-black rounded-3xl p-8 bg-gray-50 shadow-[6px_6px_0px_#000] overflow-hidden h-[450px]">
          
          {/* Active Note Input */}
          <div className="mb-8 flex gap-4">
             <div className="w-20 h-12 rounded-xl bg-white text-[#0066FF] font-black text-xs flex items-center justify-center border-2 border-black shrink-0 shadow-[4px_4px_0px_#000]">
               {formatTime(activeTimestamp !== null ? activeTimestamp : seek)}
             </div>
             <form onSubmit={handleAddNote} className="flex-1 relative">
                <input 
                  type="text"
                  ref={noteInputRef}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type note and hit enter..."
                  className="w-full h-12 border-b-4 border-black bg-transparent focus:border-red-600 outline-none text-sm font-black transition-colors pr-12 text-black uppercase tracking-widest"
                />
                <button 
                  type="submit"
                  disabled={!newNote.trim() || submitting}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:text-red-600 disabled:opacity-20 p-2"
                >
                   {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
             </form>
          </div>

          {/* List of Notes with Lines */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {loadingRevisions ? (
               <div className="text-xs font-black uppercase text-black/20 animate-pulse">Syncing notes...</div>
            ) : revisions.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center text-black/10 space-y-4">
                 <Music size={48} />
                 <p className="text-base font-black uppercase tracking-widest">No markers dropped</p>
               </div>
            ) : (
               sortedRevisions.map((rev, idx) => (
                  <div key={rev.id || idx} className="flex items-start gap-6 group border-b border-black/10 pb-4 last:border-0 hover:bg-white/5 p-2 rounded-xl transition-all">
                     <button 
                       onClick={() => handleSeek(rev.timestamp)}
                       className="text-xs font-black text-[#0066FF] bg-white border-2 border-black px-3 py-1 rounded-lg hover:bg-red-600 hover:border-red-600 transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.2)]"
                     >
                        {formatTime(rev.timestamp)}
                     </button>
                     <div className="flex-1">
                        <p className="text-sm font-bold text-black uppercase leading-relaxed">
                           {rev.note}
                        </p>
                     </div>
                  </div>
               ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

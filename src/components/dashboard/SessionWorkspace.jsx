// src/components/dashboard/SessionWorkspace.jsx
// Immediate revision persistence. No CustomEvent listeners — Transport driven via props.
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import { Disc3, X, CheckCircle, Download, Folder, Sparkles } from 'lucide-react';
import { submitRevision, updateRevision } from '../../lib/db';
import { formatTime } from './utils';
import EditableText from './EditableText';
import Button from '../ui/Button';

/* ─── Empty Vault ─── */
function EmptyVault({ onUploadClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
      <div className="relative">
        <Disc3 size={72} className="text-white/[0.04] animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white/[0.03] border border-white/[0.06]" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/15 block ml-[0.8em]">Vault Encrypted</span>
        <p className="text-[11px] text-white/10 font-medium max-w-xs">
          Select a project from the sidebar or upload new stems to begin a session.
        </p>
      </div>
      <Button onClick={onUploadClick} className="!py-3 !px-8 !text-[9px] mt-2">
        Upload First Track
      </Button>
    </div>
  );
}

/* ─── SessionWorkspace ─── */
export default function SessionWorkspace({
  activeOrder, revisions, loadingRevs, user,
  onRevisionAdded, onRevisionRemoved, onRevisionEdited, 
  onProjectRename, addToast,
  playing, setPlaying, seek, setSeek, duration, setDuration,
  onUploadClick,
  onOpenFinalize,
  onBackToHub,
  // Prop-based transport callbacks (replaces CustomEvents)
  onTogglePlay, onSkipForward, onSkipBack, onSeekTo,
}) {
  const [editNoteText, setEditNoteText] = useState('');
  const [syncing,      setSyncing]      = useState(false);
  const playerRef  = useRef(null);
  const frameRef   = useRef(null);
  
  const isFinalized = activeOrder?.status === 'finalized';

  // ─── Howler lifecycle ───
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.unload();
      playerRef.current = null;
    }
    setPlaying(false);
    if (!activeOrder) return;
    
    // Fallback logic for demo
    const url = activeOrder.masterUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    
    const howlInstance = new Howl({
      src: [url], 
      html5: true,
      onload:  () => { if (playerRef.current === howlInstance) setDuration(howlInstance.duration()); },
      onplay:  () => { if (playerRef.current === howlInstance) setPlaying(true); },
      onpause: () => { if (playerRef.current === howlInstance) setPlaying(false); },
      onend:   () => { if (playerRef.current === howlInstance) setPlaying(false); },
      onstop:  () => { if (playerRef.current === howlInstance) setPlaying(false); }
    });
    
    playerRef.current = howlInstance;
    
    return () => { 
      if (howlInstance) {
        howlInstance.stop();
        howlInstance.unload();
      }
      if (playerRef.current === howlInstance) {
        playerRef.current = null;
      }
    };
  }, [activeOrder?.id, activeOrder?.masterUrl, setDuration, setPlaying]);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editTimeString, setEditTimeString] = useState('');
  const [commentTime, setCommentTime] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editNoteText]);

  const displayTime = commentTime !== null ? commentTime : seek;

  // ─── Seek animation loop ───
  useEffect(() => {
    const tick = () => {
      if (playerRef.current && playing) setSeek(playerRef.current.seek());
      frameRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, setSeek]);

  // ─── Prop-based transport handlers ───
  useEffect(() => {
    if (onTogglePlay) onTogglePlay.current = () => {
      if (!playerRef.current) return;
      if (playerRef.current.playing()) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    };
  }, [onTogglePlay]);

  useEffect(() => {
    if (onSkipForward) onSkipForward.current = () => {
      if (playerRef.current) playerRef.current.seek(Math.min(playerRef.current.duration() || 0, playerRef.current.seek() + 10));
    };
    if (onSkipBack) onSkipBack.current = () => {
      if (playerRef.current) playerRef.current.seek(Math.max(0, playerRef.current.seek() - 10));
    };
    if (onSeekTo) onSeekTo.current = (time) => {
      if (playerRef.current) playerRef.current.seek(time);
    };
  }, [onSkipForward, onSkipBack, onSeekTo]);

  const pinRevision = async () => {
    const text = editNoteText.trim();
    if (!text) return;

    const ts = commentTime !== null ? commentTime : seek;
    const note = text;
    const localRev = { id: `local-${Date.now()}`, timestamp: ts, note, status: 'pending' };

    onRevisionAdded(localRev);
    setEditNoteText('');
    setCommentTime(null);

    if (activeOrder?.id && !activeOrder.id.startsWith('m')) {
      setSyncing(true);
      try {
        await submitRevision(activeOrder.id, user.uid, {
          timestamp: ts, note, status: 'pending',
          author: user.displayName || 'Artist',
        });
      } catch (e) {
        addToast('Note captured locally; sync failed', 'error');
      } finally {
        setSyncing(false);
      }
    } else {
      addToast('Note Captured');
    }
  };

  if (!activeOrder) return <EmptyVault onUploadClick={onUploadClick} />;

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-black">

      {/* Session Header */}
      <div className="px-10 pt-16 pb-12 text-center relative group">
        <button 
          onClick={onBackToHub}
          className="absolute left-10 top-16 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-all"
        >
          <Folder size={12} className="text-[#EF4444]" />
          <span>Exit Hub</span>
        </button>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="inline-flex flex-col items-center">
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[#EF4444] mb-4">Production Session</span>
          <EditableText
            initialValue={activeOrder.projectName || 'UNTITLED'}
            onSave={async (name) => {
               if (onProjectRename) await onProjectRename(activeOrder.id, name);
            }}
            disabled={activeOrder.status === 'finalized' || activeOrder.status === 'review'}
            className="text-5xl font-display font-black uppercase tracking-[-0.05em] text-white mb-3 block"
            inputClassName="text-5xl font-display font-black uppercase tracking-[-0.05em] text-white"
          />
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {activeOrder.bpm || '120'} BPM
            </span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {activeOrder.key || 'C MIN'}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-8 flex flex-col gap-12 pb-24">
        
        {/* WAVEFORM SECTION */}
        <div className="relative">
          <div 
            className="relative w-full h-16 flex items-center gap-[2px] opacity-60 cursor-pointer pt-3 mb-24"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = Math.max(0, Math.min(1, x / rect.width));
              const newTime = percentage * duration;
              playerRef.current?.seek(newTime);
              setSeek(newTime);
              if (editNoteText.length > 0) {
                setCommentTime(newTime);
              }
            }}
            onDoubleClick={() => playerRef.current?.pause()}
          >
            {/* Existing Pins Visualized */}
            {revisions.map((rev) => {
              const pos = (rev.timestamp / duration) * 100;
              return (
                <div 
                  key={rev.id} 
                  className="absolute top-[38px] z-30 flex flex-col items-center group cursor-pointer"
                  style={{ left: `${pos}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    playerRef.current?.seek(rev.timestamp);
                    setSeek(rev.timestamp);
                  }}
                >
                  <div className="w-[1.5px] h-6 bg-white/20 group-hover:bg-[#EF4444] transition-colors" />
                  <div className="absolute top-6 flex flex-col items-start bg-[#171717] border border-white/10 px-2.5 py-1.5 rounded shadow-2xl w-[140px] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 ease-out z-10 scale-95 group-hover:scale-100">
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[9px] font-black tabular-nums text-[#EF4444]">{formatTime(rev.timestamp)}</span>
                      <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">{rev.status || 'NOTE'}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/80 leading-tight line-clamp-2">{rev.note}</p>
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 z-50 pointer-events-none group"
              style={{ left: `${(seek / (duration || 1)) * 100}%` }}
            >
              <div className="w-[2px] h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white]" />
            </div>

            {/* Waveform Bars */}
            {Array.from({ length: 140 }).map((_, i) => {
              const progress = seek / (duration || 1);
              const playedIndex = Math.floor(progress * 140);
              const distanceToCenter = Math.abs(i - 70) / 70;
              const baseHeight = 20 + Math.pow(1 - distanceToCenter, 2) * 60;
              const height = Math.min(90, baseHeight + Math.random() * 20);
              
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all duration-300 ${i < playedIndex ? 'bg-[#EF4444]' : 'bg-white/10'}`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* INPUT SECTION */}
        {activeOrder.status !== 'finalized' && (
          <div className="flex flex-col bg-[#171717] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-[#EF4444]" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#EF4444]">Submit Sync Note</h3>
              </div>
              <div className="flex items-center gap-3">
                {syncing && <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />}
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Warp Drive Active</span>
              </div>
            </div>
            
            <div className="p-6 flex flex-col">
              <div className="relative flex items-start gap-2">
                {isEditingTime ? (
                  <input 
                    type="text" 
                    autoFocus
                    value={editTimeString}
                    onChange={(e) => setEditTimeString(e.target.value)}
                    onBlur={() => {
                      const parts = editTimeString.split(':');
                      if (parts.length === 2) {
                        const newTime = Math.max(0, Math.min(duration, parseInt(parts[0]) * 60 + parseInt(parts[1])));
                        setCommentTime(newTime);
                      }
                      setIsEditingTime(false);
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                    className="w-[45px] bg-[#EF4444] text-white text-[10px] font-black text-center px-1.5 py-1 rounded outline-none tabular-nums"
                  />
                ) : (
                  <button 
                    onDoubleClick={() => {
                      setIsEditingTime(true);
                      setEditTimeString(formatTime(displayTime));
                    }}
                    className="text-[10px] font-black bg-[#EF4444] text-white px-2 py-1 rounded cursor-text hover:scale-105 transition-transform shadow-lg shadow-red-950/20"
                    title="Double click to edit time"
                  >
                    {formatTime(displayTime)}
                  </button>
                )}
                
                <span className="text-[11px] font-black text-white/20 pt-1">-</span>
                
                <textarea 
                  ref={textareaRef}
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); pinRevision(); }
                  }}
                  className="flex-1 min-h-[28px] bg-transparent border-none p-0 pt-1 resize-none overflow-hidden text-[13px] font-bold text-white placeholder:text-white/10 focus:outline-none leading-relaxed"
                  placeholder="The snare tail is slightly too long here..."
                  rows={1}
                />
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <p className="text-[8px] font-bold uppercase tracking-widest text-white/10">
                  ↵ Enter to broadcast request to studio
                </p>
                <button 
                  onClick={pinRevision}
                  className="text-[10px] font-black uppercase tracking-widest text-[#EF4444] hover:text-white transition-colors"
                >
                  Confirm Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pinned Notes List (Ported and Modernized) */}
      {revisions.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-8 pb-32">
          <div className="flex items-center gap-6 mb-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Session Change Log</h4>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revisions.sort((a,b) => a.timestamp - b.timestamp).map(rev => (
              <div key={rev.id} className="flex flex-col gap-3 p-5 border border-white/5 bg-[#171717] hover:border-white/10 rounded-2xl transition-all group">
                <div className="flex items-center justify-between">
                  <button onClick={() => { playerRef.current?.seek(rev.timestamp); setSeek(rev.timestamp); }}
                    className="text-[10px] font-black text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/20 px-2 py-1 rounded hover:bg-[#EF4444] hover:text-white transition-all tabular-nums">
                    {formatTime(rev.timestamp)}
                  </button>
                  <button onClick={() => onRevisionRemoved(rev.id)}
                    className="text-white/10 hover:text-[#EF4444] transition-colors">
                    <X size={12} />
                  </button>
                </div>
                <EditableText
                  initialValue={rev.note}
                  disabled={activeOrder.status === 'finalized'}
                  onSave={async (newNote) => {
                    if (onRevisionEdited) onRevisionEdited(rev.id, newNote);
                    if (rev.id && !rev.id.toString().startsWith('local')) {
                      await updateRevision(rev.id, { note: newNote });
                    }
                  }}
                  className="text-[12px] font-bold text-white/80 leading-relaxed block"
                  inputClassName="text-[12px] font-bold"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

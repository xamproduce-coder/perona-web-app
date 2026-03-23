// src/components/audio/AudioPlayer.jsx
// ─────────────────────────────────────────────────────────────
// AUDIO PLAYER: Howler.js based engine for precision playback.
// Added revision marker overlay support for Studio Dashboard.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

export default function AudioPlayer({ src, onTimeUpdate, markers = [], onMarkerClick }) {
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const playerRef = useRef(null);
  const requestRef = useRef();

  // ─── Initialize Player ──────────────────────────────────────
  useEffect(() => {
    if (!src) return;

    playerRef.current = new Howl({
      src: [src],
      html5: true, // Use HTML5 audio for better streaming
      onload: () => setDuration(playerRef.current.duration()),
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => setPlaying(false),
      onend: () => setPlaying(false),
    });

    return () => {
      if (playerRef.current) playerRef.current.unload();
      cancelAnimationFrame(requestRef.current);
    };
  }, [src]);

  // ─── Animation Loop for Progress ───────────────────────────
  const updateProgress = () => {
    if (playerRef.current && playing) {
      const currentSeek = playerRef.current.seek();
      setSeek(currentSeek);
      if (onTimeUpdate) onTimeUpdate(currentSeek);
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

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setSeek(val);
    playerRef.current.seek(val);
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="glass p-6 rounded-2xl border-black glow-accent">
      <div className="flex items-center gap-6">
        <button 
          onClick={togglePlay}
          className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--color-accent)', color: '#ffffff' }}
        >
          {playing ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          ) : (
            <svg className="w-5 h-5 ml-1 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>

        <div className="flex-1 space-y-3 relative">
          
          {/* Marker Overlay */}
          <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 pointer-events-none z-10 w-full">
            {markers.map((marker, idx) => {
              const leftPercent = duration ? (marker.timestamp / duration) * 100 : 0;
              return (
                <div 
                  key={marker.id || idx}
                  className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full bg-black border-2 border-white pointer-events-auto cursor-pointer shadow-sm hover:scale-150 transition-transform origin-center"
                  style={{ left: `${leftPercent}%` }}
                  onClick={() => onMarkerClick && onMarkerClick(marker)}
                  onMouseEnter={() => setHoveredMarker(marker)}
                  onMouseLeave={() => setHoveredMarker(null)}
                >
                  {/* Tooltip */}
                  {hoveredMarker === marker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                      <span className="font-bold mr-1">{formatTime(marker.timestamp)}</span>
                      {marker.note.length > 30 ? marker.note.slice(0, 30) + '...' : marker.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <input 
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={seek}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-black relative z-0"
          />
          <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted font-bold">
            <span>{formatTime(seek)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

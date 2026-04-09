// src/components/dashboard/OnboardingModal.jsx
// ─────────────────────────────────────────────────────────────
// ONBOARDING GATE: Shown to new paid clients with zero orders.
// Non-dismissable. Submits via submitOrder() → Firestore order
// created → useRealtimeOrders fires → modal condition clears.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Disc3, Music2, Zap, FileText, Sparkles } from 'lucide-react';
import { submitOrder } from '../../lib/db';

// ─── Constants ───────────────────────────────────────────────
const NOTES    = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES    = ['Major', 'Minor'];
const SERVICES = ['Mix & Master', 'Master Only', 'Recording Session'];

const STEPS = [
  { id: 'project',    label: 'Project',    icon: Disc3 },
  { id: 'technical',  label: 'Technical',  icon: Music2 },
  { id: 'references', label: 'References', icon: Zap },
  { id: 'vibe',       label: 'Vibe',       icon: Sparkles },
];

export default function OnboardingModal({ user, serviceFromUrl, onComplete }) {
  const [step, setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    projectName:  '',
    service:      serviceFromUrl || 'Mix & Master',
    artistName:   user?.displayName || '',
    bpm:          '',
    key:          'C',
    mode:         'Minor',
    stemMap:      '',
    vibeNotes:    '',
    referenceUrls: [''],
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ─── Reference Track helpers ──────────────────────────────
  const addRef   = () => setForm(prev => ({ ...prev, referenceUrls: [...prev.referenceUrls, ''] }));
  const removeRef = (i) => setForm(prev => ({
    ...prev,
    referenceUrls: prev.referenceUrls.filter((_, idx) => idx !== i)
  }));
  const updateRef = (i, val) => setForm(prev => ({
    ...prev,
    referenceUrls: prev.referenceUrls.map((r, idx) => idx === i ? val : r)
  }));

  // ─── Step validation ──────────────────────────────────────
  const canAdvance = () => {
    if (step === 0) return form.projectName.trim().length >= 2 && form.artistName.trim().length >= 1;
    if (step === 1) return form.bpm === '' || (Number(form.bpm) >= 40 && Number(form.bpm) <= 300);
    return true; // refs & vibe are optional
  };

  // ─── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError('');
    try {
      const cleanRefs = form.referenceUrls.filter(r => r.trim() !== '');
      await submitOrder(user.uid, {
        projectName:   form.projectName.trim(),
        service:       form.service,
        artistName:    form.artistName.trim(),
        bpm:           form.bpm ? Number(form.bpm) : null,
        key:           `${form.key} ${form.mode}`,
        stemMap:       form.stemMap.trim(),
        notes:         form.vibeNotes.trim(),
        referenceUrls: cleanRefs,
        status:        'queued',
      });
      // onComplete called to let parent know — but the reactive
      // useRealtimeOrders will also auto-close via condition flip.
      onComplete?.();
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.92, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="w-full max-w-lg bg-[#080A0F] border border-white/[0.06] rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
        >
          {/* ── Header ── */}
          <div className="px-8 pt-8 pb-6 border-b border-white/[0.04]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#7DD3FC]/10 border border-[#7DD3FC]/20 flex items-center justify-center">
                <Disc3 size={16} className="text-[#7DD3FC] animate-[spin_6s_linear_infinite]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">New Session Brief</p>
                <h2 className="text-sm font-black text-white tracking-tight leading-none mt-0.5">
                  Tell us about your project
                </h2>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`h-1 w-8 rounded-full transition-all duration-500 ${
                    i <= step ? 'bg-[#7DD3FC]' : 'bg-white/[0.06]'
                  }`} />
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-3 transition-all duration-500 ${
                      i < step ? 'bg-[#7DD3FC]/40' : 'bg-white/[0.04]'
                    }`} />
                  )}
                </div>
              ))}
              <span className="ml-auto text-[9px] font-black text-white/20 uppercase tracking-widest self-center">
                {step + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          {/* ── Form Area ── */}
          <div className="px-8 py-7 min-h-[280px]">
            <AnimatePresence mode="wait">

              {/* STEP 0 — Project Identity */}
              {step === 0 && (
                <motion.div key="project" {...slideAnim} className="space-y-5">
                  <Label>Project Name</Label>
                  <Input
                    placeholder="e.g. MIDNIGHT RUN (DEMO MIX)"
                    value={form.projectName}
                    onChange={v => set('projectName', v)}
                    autoFocus
                  />
                  <Label>Artist / Stage Name</Label>
                  <Input
                    placeholder="e.g. PERONA"
                    value={form.artistName}
                    onChange={v => set('artistName', v)}
                  />
                  <Label>Service</Label>
                  <Select value={form.service} onChange={v => set('service', v)}>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </motion.div>
              )}

              {/* STEP 1 — Technical */}
              {step === 1 && (
                <motion.div key="technical" {...slideAnim} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>BPM <span className="text-white/20">(optional)</span></Label>
                      <input
                        type="number"
                        min={40} max={300}
                        placeholder="e.g. 140"
                        value={form.bpm}
                        onChange={e => set('bpm', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#7DD3FC]/30 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Key <span className="text-white/20">(optional)</span></Label>
                      <div className="flex gap-2">
                        <Select value={form.key} onChange={v => set('key', v)} className="flex-1">
                          {NOTES.map(n => <option key={n} value={n}>{n}</option>)}
                        </Select>
                        <Select value={form.mode} onChange={v => set('mode', v)} className="w-24">
                          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Stem Map <span className="text-white/20">(optional)</span></Label>
                    <p className="text-[10px] text-white/20 font-medium -mt-1">List what stems you'll be uploading — kick, snare, vox, 808, etc.</p>
                    <textarea
                      rows={4}
                      placeholder={"e.g.\n- Kick\n- Snare\n- Lead Vocal (dry)\n- 808 (wet, with reverb printed)"}
                      value={form.stemMap}
                      onChange={e => set('stemMap', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#7DD3FC]/30 transition-colors resize-none font-mono text-xs"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — References */}
              {step === 2 && (
                <motion.div key="references" {...slideAnim} className="space-y-4">
                  <div>
                    <Label>Reference Tracks <span className="text-white/20">(optional)</span></Label>
                    <p className="text-[10px] text-white/20 font-medium mt-1 mb-4">Paste Spotify, YouTube, or Drive links — tracks that nail the sound you're going for.</p>
                  </div>
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {form.referenceUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://open.spotify.com/track/..."
                          value={url}
                          onChange={e => updateRef(i, e.target.value)}
                          className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#7DD3FC]/30 transition-colors"
                        />
                        {form.referenceUrls.length > 1 && (
                          <button onClick={() => removeRef(i)}
                            className="p-3 rounded-xl border border-white/[0.06] text-white/20 hover:text-red-400 hover:border-red-400/20 transition-all">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.referenceUrls.length < 5 && (
                    <button onClick={addRef}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-[#7DD3FC] transition-colors">
                      <Plus size={12} /> Add Another
                    </button>
                  )}
                </motion.div>
              )}

              {/* STEP 3 — Vibe */}
              {step === 3 && (
                <motion.div key="vibe" {...slideAnim} className="space-y-4">
                  <div>
                    <Label>Vibe & Direction <span className="text-white/20">(optional but valuable)</span></Label>
                    <p className="text-[10px] text-white/20 font-medium mt-1 mb-4">
                      Genre, mood, sonics you want, things you hate, how loud, how wide. 
                      Don't overthink it — just talk.
                    </p>
                  </div>
                  <textarea
                    rows={7}
                    placeholder={"e.g. Dark UK drill, heavy sub, not too bright on the top end. Think central cee but with more reverb room. Want it loud but not squashed — mainsteam streaming ready. NO auto-tune artifacts on the vocal."}
                    value={form.vibeNotes}
                    onChange={e => set('vibeNotes', e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-[#7DD3FC]/30 transition-colors resize-none leading-relaxed"
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ── Footer ── */}
          <div className="px-8 pb-8 space-y-3">
            {error && (
              <p className="text-[10px] font-bold text-red-400 text-center">{error}</p>
            )}
            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl border border-white/[0.06] text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/10 transition-all disabled:opacity-30"
                >
                  Back
                </button>
              )}
              <button
                onClick={isLastStep ? handleSubmit : () => setStep(s => s + 1)}
                disabled={!canAdvance() || submitting}
                className="flex-1 py-3.5 rounded-xl bg-[#7DD3FC] text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.2)]"
              >
                {submitting
                  ? 'Sending Brief...'
                  : isLastStep
                    ? 'Submit Brief & Open Studio'
                    : 'Continue →'}
              </button>
            </div>
            {step === 0 && (
              <p className="text-[9px] text-center text-white/15 font-medium">
                This brief goes directly to your engineer. Takes 90 seconds.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Micro-components ─────────────────────────────────────────
function Label({ children }) {
  return <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/35">{children}</p>;
}

function Input({ placeholder, value, onChange, autoFocus }) {
  return (
    <input
      type="text"
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-[#7DD3FC]/30 transition-colors uppercase tracking-wide font-bold"
    />
  );
}

function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full bg-[#080A0F] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7DD3FC]/30 transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

const slideAnim = {
  initial:  { opacity: 0, x: 16 },
  animate:  { opacity: 1, x: 0  },
  exit:     { opacity: 0, x: -16 },
  transition: { duration: 0.18 },
};

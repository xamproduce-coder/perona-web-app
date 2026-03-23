// src/pages/Order.jsx
// ─────────────────────────────────────────────────────────────
// ORDER PAGE: The source of truth for every project.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../lib/db';

export default function Order() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    projectName: '',
    serviceType: 'Mixing & Mastering',
    stemsLink: '',
    referenceLink: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ─── Handle Form Submission ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitOrder(user.uid, {
        ...formData,
        artistName: profile?.artistName || user.displayName || 'Anonymous Artist',
        price: formData.serviceType === 'Mixing & Mastering' ? 450 : 250,
      });

      // Redirect to dashboard with success state
      navigate('/dashboard', { state: { success: true } });
    } catch (err) {
      console.error("Order Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-44 pb-24 min-h-screen px-6 max-w-2xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-display mt-2 gradient-text">Start Your Next Masterpiece</h2>
        <p className="text-muted text-sm mt-4">Provide the details below to begin the mixing and mastering process.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 glass p-10 rounded-3xl border-subtle">
        
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-xs text-muted uppercase tracking-widest font-semibold ml-1">Project Name</label>
          <input
            type="text"
            placeholder="e.g., 'Sonic Pulse'"
            required
            className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
            value={formData.projectName}
            onChange={(e) => setFormData({...formData, projectName: e.target.value})}
          />
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <label className="text-xs text-muted uppercase tracking-widest font-semibold ml-1">Select Service</label>
          <select
            className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner tracking-widest appearance-none cursor-pointer uppercase"
            value={formData.serviceType}
            onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
          >
            <option value="Mixing & Mastering">Full Mix & Master — £450</option>
            <option value="Mastering Only">Mastering Only — £250</option>
          </select>
        </div>

        {/* Stems Delivery (External Link while Storage is on hold) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-widest font-semibold ml-1">Stems Delivery Link</label>
            <input
              type="url"
              placeholder="WeTransfer, Dropbox, or Google Drive Link"
              required
              className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.stemsLink}
              onChange={(e) => setFormData({...formData, stemsLink: e.target.value})}
            />
          </div>
          <p className="text-[10px] text-muted italic px-2">Please ensure all stems are high-quality (WAV/AIFF) and the link is set to "Public" or "Anyone with link can view."</p>
        </div>

        {/* Inspiration / References */}
        <div className="space-y-2">
          <label className="text-xs text-muted uppercase tracking-widest font-semibold ml-1">Inspiration & References</label>
          <input
            type="url"
            placeholder="Link to a Reference Track (YouTube/Spotify/Soundcloud)"
            className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
            value={formData.referenceLink}
            onChange={(e) => setFormData({...formData, referenceLink: e.target.value})}
          />
        </div>

        {/* Metadata (Key, BPM, LUFS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-bold ml-1 font-display">Target LUFS</label>
            <input
              type="number"
              step="0.1"
              placeholder="-14.0"
              className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.targetLufs || ''}
              onChange={(e) => setFormData({...formData, targetLufs: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-bold ml-1 font-display">BPM</label>
            <input
              type="number"
              placeholder="120"
              className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.bpm || ''}
              onChange={(e) => setFormData({...formData, bpm: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-bold ml-1 font-display">Musical Key</label>
            <input
              type="text"
              placeholder="e.g. C minor"
              className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.keySigma || ''}
              onChange={(e) => setFormData({...formData, keySigma: e.target.value})}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs text-muted uppercase tracking-widest font-semibold ml-1">Production Notes</label>
          <textarea
            placeholder="Tell us about the vibe, specific elements to highlight, or any technical concerns."
            rows={5}
            className="w-full bg-black border border-white/10 p-5 rounded-[2.5rem] text-xs font-bold text-white placeholder-white/30 focus:border-[#f26422] focus:bg-[#0a0a0a] outline-none transition-all shadow-inner tracking-widest resize-none"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-sm font-bold transition-all glow-accent mt-6 uppercase tracking-widest"
          style={{ background: 'var(--color-accent)', color: '#ffffff' }}
        >
          {loading ? 'Submitting Project...' : 'Finalize & Submit Order'}
        </button>
      </form>
    </div>
  );
}

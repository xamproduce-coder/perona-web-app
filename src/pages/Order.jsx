// src/pages/Order.jsx
// ─────────────────────────────────────────────────────────────
// ORDER PAGE: The source of truth for every project.
// Now integrated with the UploadVault for native file selection.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitOrder, getUserAssets } from '../lib/db';
import { Disc3, CheckCircle2, Music2, AlertCircle } from 'lucide-react';

export default function Order() {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    projectName: '',
    serviceType: 'Mixing & Mastering',
    referenceLink: '',
    notes: '',
    targetLufs: '',
    bpm: '',
    key: '',
  });
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const navigate = useNavigate();

  // ─── Fetch User Assets from Vault ─────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function loadAssets() {
      try {
        const data = await getUserAssets(user.uid);
        // We only want files that are in the "vault" (independent stems)
        // rather than files already attached to other orders
        setAssets(data.filter(a => a.isVaulted));
      } catch (err) {
        console.error("Failed to load assets:", err);
      } finally {
        setAssetsLoading(false);
      }
    }
    loadAssets();
  }, [user]);

  const toggleAsset = (asset) => {
    if (selectedAssets.find(a => a.id === asset.id)) {
      setSelectedAssets(selectedAssets.filter(a => a.id !== asset.id));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  // ─── Handle Form Submission ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAssets.length === 0) {
      alert("Please select at least one stem from your vault.");
      return;
    }
    setLoading(true);

    try {
      await submitOrder(user.uid, {
        ...formData,
        stems: selectedAssets.map(a => ({ id: a.id, name: a.name, url: a.url, refPath: a.refPath })),
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
    <div className="pt-44 pb-24 min-h-screen px-6 max-w-3xl mx-auto">
      <div className="mb-12">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0066FF]/30 mb-2">Project Initiation</p>
        <h2 className="text-5xl font-display uppercase tracking-tighter text-black">Start Your Next Masterpiece</h2>
        <p className="text-muted text-sm mt-4 font-medium">Select your studio stems from the vault and provide the project metadata.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 group">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Project Name */}
            <div className="space-y-2">
                <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Project Identifier</label>
                <input
                    type="text"
                    placeholder="E.G. 'SONIC PULSE'"
                    required
                    className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] placeholder-white/30 focus:border-[#1D4ED8] outline-none transition-all shadow-inner uppercase tracking-widest"
                    value={formData.projectName}
                    onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
                <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Service Selection</label>
                <select
                    className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] focus:border-[#1D4ED8] outline-none transition-all shadow-inner tracking-widest appearance-none cursor-pointer uppercase"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                >
                    <option value="Mixing & Mastering">Full Mix & Master — £450</option>
                    <option value="Mastering Only">Mastering Only — £250</option>
                </select>
            </div>
        </div>

        {/* ─── Vault Asset Selection (CRITICAL) ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] text-[#0066FF] uppercase tracking-[0.3em] font-black">Choose Vault Stems</label>
            <span className="text-[9px] font-black px-2 py-1 bg-[#0066FF]/5 text-[#0066FF]/40 rounded-lg uppercase tracking-widest">
              {selectedAssets.length} Selected
            </span>
          </div>

          <div className="glass-white border border-[#0066FF]/5 rounded-[2rem] overflow-hidden bg-white/40 shadow-xl">
            {assetsLoading ? (
               <div className="p-12 text-center text-muted italic flex flex-col items-center gap-4">
                  <Disc3 size={32} className="animate-spin text-[#0066FF]/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scanning Your Vault...</span>
               </div>
            ) : assets.length === 0 ? (
               <div className="p-16 text-center space-y-4">
                  <AlertCircle size={32} className="mx-auto text-orange-400 opacity-20" />
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">Your Vault is Empty</p>
                  <button 
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="text-[10px] font-black text-[#0066FF] underline underline-offset-4 uppercase tracking-widest"
                  >
                    Go Upload Stems First
                  </button>
               </div>
            ) : (
               <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-[#0066FF]/5">
                  {assets.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => toggleAsset(asset)}
                      className={`flex items-center gap-4 p-5 cursor-pointer transition-colors ${
                        selectedAssets.find(a => a.id === asset.id) ? 'bg-[#0066FF]/[0.03]' : 'hover:bg-[#0066FF]/[0.01]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                         selectedAssets.find(a => a.id === asset.id) ? 'bg-[#0066FF] border-[#0066FF]' : 'border-[#0066FF]/10'
                      }`}>
                         {selectedAssets.find(a => a.id === asset.id) && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#0066FF]/5 flex items-center justify-center text-[#0066FF]/20">
                         <Music2 size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[13px] font-bold text-[#0066FF] truncate uppercase tracking-tight">{asset.name}</p>
                         <p className="text-[9px] font-black text-[#0066FF]/20 uppercase tracking-widest">{asset.size || 'Unknown Size'}</p>
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
          <p className="text-[9px] text-muted italic px-4 font-medium uppercase tracking-widest opacity-60">Select the specific stems you want mixed for this project title.</p>
        </div>

        {/* Technical Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">BPM</label>
            <input
              type="number"
              placeholder="120"
              className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] placeholder-white/30 focus:border-[#1D4ED8] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.bpm}
              onChange={(e) => setFormData({...formData, bpm: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Musical Key</label>
            <input
              type="text"
              placeholder="E.G. C MINOR"
              className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] placeholder-white/30 focus:border-[#1D4ED8] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.key}
              onChange={(e) => setFormData({...formData, key: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Target LUFS</label>
            <input
              type="number"
              step="0.1"
              placeholder="-14.0"
              className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] placeholder-white/30 focus:border-[#1D4ED8] outline-none transition-all shadow-inner uppercase tracking-widest"
              value={formData.targetLufs}
              onChange={(e) => setFormData({...formData, targetLufs: e.target.value})}
            />
          </div>
        </div>

        {/* References */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Reference Material (URL)</label>
          <input
            type="url"
            placeholder="SPOTIFY, SOUNDCLOUD, OR YOUTUBE LINK"
            className="w-full bg-white border border-[#0066FF]/10 p-5 rounded-2xl text-xs font-bold text-[#0066FF] placeholder-white/30 focus:border-[#1D4ED8] outline-none transition-all shadow-inner uppercase tracking-widest"
            value={formData.referenceLink}
            onChange={(e) => setFormData({...formData, referenceLink: e.target.value})}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted uppercase tracking-widest font-black ml-1">Production Brief</label>
          <textarea
            placeholder="TELL US ABOUT THE VIBE, SPECIFIC ELEMENTS TO HIGHLIGHT, OR TECHNICAL CONCERNS."
            rows={5}
            className="w-full bg-white border border-[#0066FF]/10 p-6 rounded-[2rem] text-xs font-bold text-[#0066FF] placeholder-[#0066FF]/10 focus:border-[#1D4ED8] outline-none transition-all shadow-inner tracking-widest resize-none uppercase"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading || selectedAssets.length === 0}
          className="w-full py-5 rounded-3xl text-xs font-bold transition-all shadow-2xl mt-6 uppercase tracking-[0.3em] bg-[#0066FF] text-white hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting to Studio...' : 'Finalize & Start Session'}
        </button>
      </form>
    </div>
  );
}

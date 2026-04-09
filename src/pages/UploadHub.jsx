import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StemUploader from '../components/upload/StemUploader';
import { Lock, FolderOpen, FileAudio, MoreVertical, Search } from 'lucide-react';
import { useRealtimeAssets } from '../hooks/useRealtimeAssets';
import { useState } from 'react';

export default function UploadHub() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { assets, loading } = useRealtimeAssets(user?.uid);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Guard: must be logged in AND have paid
  if (!user) {
    return (
      <GateScreen
        icon={<Lock size={32} className="text-[#0066FF]/40" />}
        heading="Sign in to continue"
        sub="You need an account to access you vault."
        cta="Sign In"
        onCta={() => navigate('/login')}
      />
    );
  }

  if (!profile?.hasPaidMixMaster && profile?.role !== 'admin') {
    return (
      <GateScreen
        icon={<Lock size={32} className="text-[#1D4ED8]/60" />}
        heading="Vault is locked"
        sub="Purchase a service package to unlock your private asset vault."
        cta="View Package"
        onCta={() => navigate('/services')}
        secondaryCta="Go to Dashboard"
        onSecondaryCta={() => navigate('/dashboard')}
      />
    );
  }

  const filteredAssets = assets.filter(a => a.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-28 pb-20 px-4 sm:px-8 font-sans selection:bg-[#FDE047]/20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">

      <div className="max-w-6xl mx-auto flex gap-8 flex-col lg:flex-row">
        
        {/* SIDEBAR FOR FOLDERS */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6">
           <h1 className="text-4xl font-display uppercase tracking-tight text-white mb-2">Vault.</h1>
           <button onClick={() => setIsUploading(!isUploading)} className="btn-ssl w-full !text-[11px] mb-4">
             <span>{isUploading ? 'View Library' : 'Upload Assets'}</span>
           </button>

           <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FDE047] mb-4 mt-4">Locations</h3>
              <button className="w-full text-left p-3 rounded-lg bg-white/5 flex items-center gap-3 text-white">
                 <FolderOpen size={16} /> <span className="text-xs font-bold uppercase tracking-widest">All Assets</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition flex items-center gap-3 text-white/40">
                 <FolderOpen size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Project Stems</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition flex items-center gap-3 text-white/40">
                 <FolderOpen size={16} /> <span className="text-xs font-bold uppercase tracking-widest">Final Masters</span>
              </button>
           </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 min-w-0 bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-8 lg:p-10 shadow-2xl relative overflow-hidden min-h-[600px] flex flex-col">
           {isUploading ? (
              <div className="animate-in fade-in zoom-in duration-300 w-full max-w-2xl mx-auto mt-4">
                <div className="mb-8 text-center">
                   <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Secure Upload</h2>
                   <p className="text-sm text-white/40 font-medium">Drop your uncompressed audio files. Accepted: WAV, AIFF, ZIP.</p>
                </div>
                <div className="bg-black/50 p-6 rounded-3xl border border-white/5 shadow-inner">
                   <StemUploader projectId="library" />
                </div>
              </div>
           ) : (
              <div className="animate-in fade-in duration-300 flex flex-col h-full w-full">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-4">
                    <h2 className="text-xl font-black uppercase tracking-widest text-white">Files</h2>
                    <div className="relative w-full sm:w-64 shrink-0">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                         placeholder="Search vault..."
                         className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[#FDE047]/50 transition-colors"
                       />
                    </div>
                 </div>

                 <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
                   {loading ? (
                      <div className="flex items-center justify-center h-40 text-white/20 uppercase tracking-widest text-xs font-black animate-pulse">Scanning Vault...</div>
                   ) : filteredAssets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center gap-4 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                         <FileAudio size={32} className="text-white/10" />
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-black uppercase tracking-widest text-white/40">Vault Empty</span>
                            <span className="text-xs font-medium text-white/20">Upload files to organize your tracks.</span>
                         </div>
                      </div>
                   ) : (
                      <div className="flex flex-col">
                         <div className="flex items-center px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
                            <span className="flex-[2]">Name</span>
                            <span className="flex-1 hidden md:block">Added</span>
                            <span className="flex-1 hidden sm:block">Size</span>
                            <span className="w-8"></span>
                         </div>
                         <div className="space-y-1">
                           {filteredAssets.map(asset => (
                              <div key={asset.id} className="flex items-center px-4 py-3 bg-white/[0.02] hover:bg-white/[0.06] transition-colors rounded-xl border border-transparent hover:border-white/10 group cursor-default">
                                 <div className="flex-[2] flex items-center gap-3 truncate pr-4">
                                    <div className="w-9 h-9 rounded-lg bg-white/5 text-[#FDE047]/80 flex items-center justify-center shrink-0 border border-white/5 shadow-sm">
                                       <FileAudio size={16} />
                                    </div>
                                    <span className="text-[13px] font-semibold truncate group-hover:text-white transition-colors">{asset.name || 'Unknown File'}</span>
                                 </div>
                                 <div className="flex-1 hidden md:block text-[11px] font-medium uppercase tracking-wider text-white/30">
                                    {asset.createdAt?.toDate ? asset.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                 </div>
                                 <div className="flex-1 hidden sm:block text-[11px] font-medium uppercase tracking-wider text-white/30">
                                    {asset.size || '-- MB'}
                                 </div>
                                 <div className="w-8 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                                 </div>
                              </div>
                           ))}
                         </div>
                      </div>
                   )}
                 </div>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}

function GateScreen({ icon, heading, sub, cta, onCta, secondaryCta, onSecondaryCta }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-zinc-950 text-white selection:bg-[#FDE047]/20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      <div className="mb-6 p-4 rounded-3xl mindwave-glass border border-white/10">{icon}</div>
      <h2 className="text-3xl font-display uppercase tracking-tight mb-4">{heading}</h2>
      <p className="text-base text-white/40 max-w-sm font-medium leading-relaxed mb-10">{sub}</p>
      <button
        onClick={onCta}
        className="btn-ssl mb-6"
      >
        <span>{cta}</span>
      </button>
      {secondaryCta && (
        <button
          onClick={onSecondaryCta}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-[#FDE047] transition-colors"
        >
          {secondaryCta}
        </button>
      )}
    </div>
  );
}

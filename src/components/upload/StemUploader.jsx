// src/components/upload/StemUploader.jsx
// ─────────────────────────────────────────────────────────────
// Upload widget for project stems. Handles progress, retries,
// orphan cleanup, and guaranteed Firestore handshake.
//
// KEY FIXES:
//   FIX-A: Orphan cleanup — if saveAssetMetadata() throws after a
//           successful Storage upload, deleteStorageFile() is called
//           before marking the file as 'error'.
//   FIX-B: uploadedUrls race condition eliminated — handleCheckout
//           now collects URLs directly from the localFiles state
//           snapshot at the moment of submission, not from a
//           separately-maintained state variable.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { listStems, uploadProjectStem, deleteStorageFile } from '../../lib/storage';
import { submitOrder, saveAssetMetadata } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileAudio, X, Disc3 } from 'lucide-react';
import { deleteObject, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function StemUploader({ projectId }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Each entry: { id, name, size, progress, status, refPath?, url?, fileObj? }
  // status: 'uploading' | 'completed' | 'error'
  const [localFiles, setLocalFiles] = useState([]);
  const [isReadyToBuy, setIsReadyToBuy]   = useState(false);
  const [projectName, setProjectName]     = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const fileInputRef = useRef(null);
  const ALLOWED_EXT  = /\.(wav|aif|aiff|mp3)$/i;

  const validateFile = (file) => {
    if (!ALLOWED_EXT.test(file.name)) return 'Format Rejected. Only WAV, AIFF, or MP3 allowed.';
    return null;
  };

  // ─── Pre-fill already-uploaded stems on mount ────────────────
  useEffect(() => {
    if (!user || !projectId) return;
    listStems(projectId)
      .then((fetchedFiles) => {
        const mapped = fetchedFiles.map((f, i) => ({
          id:       `fetched-${i}`,
          name:     f.name,
          size:     'N/A',
          progress: 100,
          status:   'completed',
          refPath:  f.ref,
          url:      f.url,
        }));
        setLocalFiles(mapped);
        checkReady(mapped);
      })
      .catch(console.error);
  }, [user, projectId]);

  const checkReady = (filesArray) => {
    const completed = filesArray.filter(f => f.status === 'completed');
    setIsReadyToBuy(completed.length >= 2);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length || !user || !projectId) return;

    const newEntries = selectedFiles.map((file) => {
      const error = validateFile(file);
      return {
        id:      Math.random().toString(36).substring(7),
        fileObj: file,
        name:    file.name,
        size:    formatBytes(file.size),
        progress: 0,
        status:  error ? 'error' : 'uploading',
        error,
      };
    });

    setLocalFiles(prev => [...prev, ...newEntries]);

    for (const entry of newEntries) {
      if (entry.status === 'uploading') startUpload(entry);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Core upload + Firestore handshake ─────────────────────────
  const startUpload = async (entry) => {
    let uploadedRefPath = null;

    try {
      // Step 1: Upload to Firebase Storage
      const result = await uploadProjectStem(projectId, entry.fileObj, (prog) => {
        setLocalFiles(curr => curr.map(f => f.id === entry.id ? { ...f, progress: prog } : f));
      });

      // Cache the refPath so we can clean up if Step 2 fails
      uploadedRefPath = result.refPath;

      // Step 2: Write metadata to Firestore — the "Handshake"
      // FIX-A: If this throws, we catch below and delete the orphaned Storage file.
      await saveAssetMetadata(user.uid, {
        name:      entry.name,
        size:      entry.size,
        url:       result.url,
        refPath:   result.refPath,
        category:  'stems',
        orderId:   projectId,
        isVaulted: false,
      });

      // Both steps succeeded — mark as complete and store URL + refPath
      setLocalFiles(curr => {
        const updated = curr.map(f =>
          f.id === entry.id
            ? { ...f, status: 'completed', progress: 100, refPath: result.refPath, url: result.url }
            : f
        );
        checkReady(updated);
        return updated;
      });

    } catch (err) {
      console.error(`[StemUploader] Failed for "${entry.name}":`, err);

      // FIX-A: ORPHAN CLEANUP — if the Storage upload succeeded but
      // the Firestore write failed, delete the orphaned file.
      if (uploadedRefPath) {
        await deleteStorageFile(uploadedRefPath);
      }

      setLocalFiles(curr =>
        curr.map(f => f.id === entry.id ? { ...f, status: 'error', error: 'Upload Failed — Retrying is safe.' } : f)
      );
    }
  };

  const handleRetry = (fileId) => {
    const fileToRetry = localFiles.find(f => f.id === fileId);
    if (!fileToRetry?.fileObj) return;
    setLocalFiles(curr =>
      curr.map(f => f.id === fileId ? { ...f, status: 'uploading', progress: 0, error: null } : f)
    );
    startUpload(fileToRetry);
  };

  const handleRemoveFile = async (fileId, refPath) => {
    setLocalFiles(curr => {
      const updated = curr.filter(f => f.id !== fileId);
      checkReady(updated);
      return updated;
    });
    if (refPath) await deleteStorageFile(refPath);
  };

  // ─── Submit Project ──────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name.');
      return;
    }

    // FIX-B: Read URLs directly from localFiles at submission time.
    // This eliminates the race condition where uploadedUrls state
    // might be stale or missing the last few files.
    const completedFiles = localFiles.filter(f => f.status === 'completed');
    const stemUrls       = completedFiles.map(f => f.url).filter(Boolean);

    setIsSubmitting(true);
    try {
      await submitOrder(user.uid, {
        projectName:  projectName.trim(),
        serviceType:  'Mixing & Mastering',
        artistName:   user.displayName || 'Artist',
        status:       'queued',
        stems:        stemUrls,
        stemCount:    stemUrls.length,
      });
      alert('Project submitted successfully! We\'ll be in touch.');
      navigate('/dashboard');
    } catch (err) {
      console.error('[StemUploader] Order submission failed:', err);
      alert('Failed to submit project. Your files are safe — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = localFiles.filter(f => f.status === 'completed').length;

  return (
    <div className="mindwave-glass p-8 md:p-10 w-full mx-auto space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/5 bg-black/40">

      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Capture Assets</h3>
        <span className={`text-[9px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-full border transition-all ${completedCount >= 2 ? 'bg-[#FDE047]/10 border-[#FDE047]/30 text-[#FDE047]' : 'bg-white/5 border-white/10 text-white/20'}`}>
          {completedCount}/2 Min Stems
        </span>
      </div>

      {/* Project Name */}
      <div className="space-y-3">
        <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block ml-1">Project Identifier</label>
        <div className="relative group">
          <Disc3 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FDE047] transition-colors" />
          <input
            type="text"
            placeholder="ENTER PROJECT TITLE..."
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-4 rounded-2xl text-xs font-bold text-white placeholder:text-white/10 focus:border-[#FDE047]/40 outline-none transition-all uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className="flex flex-col items-center justify-center p-14 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group relative overflow-hidden"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 bg-[#FDE047]/0 group-hover:bg-[#FDE047]/[0.02] transition-colors" />
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple />

        <div className="bg-black/40 border border-white/10 p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:border-[#FDE047]/30">
          <Upload size={24} className="text-white/20 group-hover:text-[#FDE047] transition-colors" />
        </div>

        <p className="font-bold text-white/60 text-center text-[12px] mb-2 tracking-wide uppercase">
          Drop studio <span className="text-white">stems</span> or click to select
        </p>
        <p className="text-[9px] text-white/20 font-black tracking-[0.3em] uppercase">
          WAV (Preferred) • AIFF • MP3
        </p>
      </div>

      {/* File List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {localFiles.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">

            <div className="flex items-center gap-4 flex-1 pr-4">
              <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-white/20 border border-white/5 group-hover:text-[#FDE047]/60 group-hover:border-[#FDE047]/10 transition-all">
                <FileAudio size={18} />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2 max-w-full overflow-hidden">
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-white/80 truncate group-hover:text-white transition-colors">{file.name}</span>
                  <span className="text-[9px] font-black tracking-[0.2em] text-white/20 uppercase mt-0.5">{file.size}</span>
                </div>

                {file.status === 'uploading' && (
                  <div className="flex items-center gap-4 w-full md:w-40 shrink-0">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FDE047] transition-all duration-300 shadow-[0_0_8px_rgba(253,224,71,0.5)]" style={{ width: `${file.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-black text-[#FDE047] w-8 text-right tabular-nums">{file.progress}%</span>
                  </div>
                )}

                {file.status === 'completed' && (
                  <div className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
                    SECURED
                  </div>
                )}

                {file.status === 'error' && (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-black text-red-500 tracking-[0.2em] uppercase">{file.error || 'Failed'}</span>
                    {file.fileObj && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetry(file.id); }}
                        className="text-[8px] font-black bg-white/10 px-2 py-1 rounded-lg hover:bg-[#FDE047] hover:text-black transition-colors uppercase tracking-widest"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleRemoveFile(file.id, file.refPath)}
              className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/10 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Submit */}
      {localFiles.length > 0 && (
        <div className="pt-8 border-t border-white/5 space-y-4">
          <button
            onClick={handleCheckout}
            disabled={!isReadyToBuy || isSubmitting || !projectName.trim()}
            className="btn-ssl w-full !py-5 disabled:opacity-40 disabled:saturate-0 disabled:cursor-not-allowed"
          >
            <span>
              {isSubmitting
                ? 'LOCKING IN...'
                : !projectName.trim()
                  ? 'ENTER PROJECT NAME ↑'
                  : !isReadyToBuy
                    ? `NEED ${2 - completedCount} MORE STEM${2 - completedCount !== 1 ? 'S' : ''}`
                    : 'SUBMIT TO STUDIO'}
            </span>
          </button>
          <p className="text-[9px] text-center font-black uppercase tracking-[0.4em] text-white/10">
            {completedCount} stem{completedCount !== 1 ? 's' : ''} secured · Analogue Channel Ready
          </p>
        </div>
      )}
    </div>
  );
}

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k  = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i  = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

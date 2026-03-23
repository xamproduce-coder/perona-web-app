import { useState, useRef, useEffect } from 'react';
import { uploadStem, listStems } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileAudio, File, X, Loader2 } from 'lucide-react';
import { deleteObject, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function StemUploader({ projectId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  // `localFiles` stores files currently being uploaded or already uploaded
  // { id, name, size, progress, status: 'uploading' | 'completed' | 'error', refPath?: string }
  const [localFiles, setLocalFiles] = useState([]);
  const [isReadyToBuy, setIsReadyToBuy] = useState(false);
  
  const fileInputRef = useRef(null);

  // Initial fetch of already uploaded files
  useEffect(() => {
    if (!user || !projectId) return;
    listStems(user.uid, projectId).then(fetchedFiles => {
      const mapped = fetchedFiles.map((f, i) => ({
        id: `fetched-${i}`,
        name: f.name,
        size: 'N/A', // Firebase list doesn't immediately give size without metadata call
        progress: 100,
        status: 'completed',
        refPath: f.ref
      }));
      setLocalFiles(mapped);
      checkReady(mapped);
    }).catch(console.error);
  }, [user, projectId]);

  const checkReady = (filesArray) => {
    const completed = filesArray.filter(f => f.status === 'completed');
    setIsReadyToBuy(completed.length >= 2);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length || !user || !projectId) return;

    // Filter out directories if any, or just process pure files
    const newFiles = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      fileObj: file,
      name: file.name,
      size: formatBytes(file.size),
      progress: 0,
      status: 'uploading'
    }));

    setLocalFiles(prev => [...prev, ...newFiles]);

    // Upload them in parallel or sequentially
    for (const nf of newFiles) {
      try {
        const result = await uploadStem(user.uid, projectId, nf.fileObj, (prog) => {
          setLocalFiles(current => current.map(f => 
            f.id === nf.id ? { ...f, progress: prog } : f
          ));
        });
        
        setLocalFiles(current => {
          const updated = current.map(f => 
             f.id === nf.id ? { ...f, status: 'completed', progress: 100, refPath: result.ref } : f
          );
          checkReady(updated);
          return updated;
        });

      } catch (err) {
        console.error('Upload failed for', nf.name, err);
        setLocalFiles(current => current.map(f => 
          f.id === nf.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = async (fileId, refPath) => {
    // Optimistically remove from UI
    setLocalFiles(current => {
      const updated = current.filter(f => f.id !== fileId);
      checkReady(updated);
      return updated;
    });

    if (refPath && storage) {
      try {
        const fileRef = ref(storage, refPath);
        await deleteObject(fileRef);
      } catch (err) {
        console.error('Failed to delete file from storage', err);
      }
    }
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout with " + localFiles.length + " files. Minimum 2 tracks met!");
    // navigate('/checkout'); // Route can be added later
  };

  return (
    <div className="border border-white/10 p-6 md:p-8 rounded-3xl w-full mx-auto space-y-6 bg-[#0a0a0a]/60 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.4)] text-white">
      
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-white/90 tracking-tight">Upload File</h3>
        <span className={`text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-full border ${localFiles.filter(f=>f.status==='completed').length >= 2 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
          Minimum 2 Tracks
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div 
        className="flex flex-col items-center justify-center p-12 border border-dashed border-white/15 rounded-2xl bg-[#050505] hover:bg-white/[0.04] transition-all cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />

        <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 group-hover:scale-110 transition-transform shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/80">
             <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        
        <p className="font-bold text-white/80 text-center text-sm mb-2 tracking-wide">
          Click <span className="text-white">select</span> to upload or drag & drop your files
        </p>
        <p className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase">
          wav, default stems, or mp3 types are supported
        </p>
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {localFiles.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 rounded-xl bg-[#050505] border border-white/10 group">
             
             <div className="flex items-center gap-4 flex-1">
                <File className="w-5 h-5 text-white/30 group-hover:text-white/80 transition-colors" />
                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2 pr-4">
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-white/80 truncate max-w-[150px] md:max-w-[200px]">{file.name}</span>
                     <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">• {file.size}</span>
                   </div>
                   
                   {/* Progress Indicator */}
                   {file.status === 'uploading' && (
                     <div className="flex items-center gap-3 w-full md:w-48">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-white transition-all duration-300 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${file.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-white/80 w-8 text-right">{file.progress}%</span>
                     </div>
                   )}
                   {file.status === 'completed' && (
                     <div className="text-[10px] font-black text-white/60 tracking-[0.2em] uppercase">100%</div>
                   )}
                   {file.status === 'error' && (
                     <div className="text-[10px] font-black text-red-500 tracking-[0.2em] uppercase">Failed</div>
                   )}
                </div>
             </div>

             <button 
               onClick={() => handleRemoveFile(file.id, file.refPath)}
               className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/30 hover:text-white"
             >
               <X className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>

      {localFiles.length > 0 && (
        <div className="pt-6 mt-6 border-t border-white/10">
          <button 
            onClick={handleCheckout}
            disabled={!isReadyToBuy}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${
              isReadyToBuy 
                ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95' 
                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isReadyToBuy ? 'Proceed to Checkout' : 'Requires 2+ Tracks'}
          </button>
        </div>
      )}

    </div>
  );
}

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// src/components/dashboard/EditableText.jsx
// Reusable in-place editing component. Double-click to activate.
// Conforms strictly to MindWave x SSL design tokens.
import React, { useState, useRef, useEffect } from 'react';

export default function EditableText({ initialValue, onSave, onDelete, disabled = false, className = '', inputClassName = '' }) {
  const [editing, setEditing]   = useState(false);
  const [value,   setValue]     = useState(initialValue);
  const [syncing, setSyncing]   = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (!editing) setValue(initialValue); }, [initialValue, editing]);

  const activate = () => { if (disabled) return; setEditing(true); setValue(initialValue); };
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = async () => {
    const trimmed = value.trim();
    setEditing(false);
    
    // Case: Empty text committed. If onDelete is provided, trigger deletion.
    if (!trimmed && onDelete) {
      setSyncing(true);
      try { await onDelete(); }
      catch (e) { console.error('EditableText delete failed:', e); setValue(initialValue); }
      finally { setSyncing(false); }
      return;
    }
    
    if (!trimmed || trimmed === initialValue) { setValue(initialValue); return; }
    setSyncing(true);
    try { await onSave(trimmed); }
    catch (e) { console.error('EditableText save failed:', e); setValue(initialValue); }
    finally { setSyncing(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setValue(initialValue); setEditing(false); }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-b border-[#7DD3FC]/40 focus:border-[#7DD3FC] outline-none text-[#0F172A] caret-[#7DD3FC] transition-colors ${inputClassName}`}
        style={{ width: '100%' }}
      />
    );
  }

  return (
    <span
      onDoubleClick={activate}
      title={disabled ? undefined : 'Double-click to rename'}
      className={`select-none relative ${disabled ? 'cursor-default' : 'cursor-text'} ${className}`}
    >
      {value}
      {syncing && (
        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse align-middle" />
      )}
    </span>
  );
}

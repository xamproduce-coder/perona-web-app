import React, { useRef, useState } from 'react';

const Button = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const buttonRef = useRef(null);
  
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed saturate-0 pointer-events-none' : '';

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-sm bg-[#EF4444] border border-white/5 px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all duration-300 shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 focus:outline-none active:scale-[0.98] active:brightness-90 ${disabledClass} ${className}`.trim()}
      {...props}
    >
      {/* Glitch Overlay on Hover (Subtle) */}
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-10 transition-opacity" />
      
      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2 tracking-[0.3em]">{children}</span>
    </button>
  );
};

export default Button;

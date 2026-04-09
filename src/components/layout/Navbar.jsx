import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/account' || location.pathname === '/admin';

  return (
    <motion.div 
      initial={false}
      animate={{ 
        paddingLeft: isDashboard ? 0 : 40,
        paddingRight: isDashboard ? 40 : 0
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] pt-6 pb-2 pointer-events-none"
    >
      <Link to="/" className="block pointer-events-auto">
        <motion.nav 
          initial={false}
          animate={{ 
            borderTopLeftRadius: isDashboard ? 0 : 32,
            borderBottomLeftRadius: isDashboard ? 0 : 32,
            borderTopRightRadius: isDashboard ? 32 : 0,
            borderBottomRightRadius: isDashboard ? 32 : 0,
            marginLeft: isDashboard ? -10 : 0, // More aggressive negative margin to ensure 'off-screen' look
            marginRight: isDashboard ? 0 : -10,
            backgroundColor: isDashboard ? 'rgba(17, 17, 17, 1)' : 'rgba(17, 17, 17, 0.9)'
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-16 px-10 bg-[#111111] border-y border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-start hover:bg-[#151515] hover:border-white/20 active:scale-[0.99] cursor-pointer"
          style={{ 
            borderLeftWidth: isDashboard ? 0 : 1,
            borderRightWidth: isDashboard ? 1 : 0
          }}
        >
          {/* Brutalist Brand Logo - Left Aligned */}
          <div className="flex flex-col items-start justify-center">
              <span className="font-display font-black text-3xl tracking-[-0.05em] text-white leading-none">
                MAXM
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#EF4444] mt-1 shrink-0">
                STUDIO_PROTOCOL
              </span>
          </div>
        </motion.nav>
      </Link>
    </motion.div>
  );
}

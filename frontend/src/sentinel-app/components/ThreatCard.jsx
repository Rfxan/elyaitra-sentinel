import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Clock, Unlock, Shield } from 'lucide-react';
import axios from 'axios';

const API_BASE = "/sentinel-api";

const ThreatCard = ({ ipData, isNew, onUnblock }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUnblock = async () => {
    setIsRemoving(true);
    try {
      await axios.delete(`${API_BASE}/block-ip/${ipData.ip}`);
      onUnblock(ipData.ip);
    } catch (e) {
      console.error("Failed to unblock", e);
      setIsRemoving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.9 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsConfirming(false); }}
      className={`relative bg-white dark:bg-[#1A1F2B] border rounded-md p-5 overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-sm border-red-500/50' : 'border-slate-200 dark:border-[#30363d]'
      }`}
    >
      {/* Neon glow animation for new threats */}
      {isNew && (
        <motion.div
          animate={{ opacity: [0.05, 0.2, 0.05] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-red-500 pointer-events-none mix-blend-screen"
        />
      )}

      {isNew && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-bold tracking-widest rounded-bl-lg">
          NEW THREAT
        </div>
      )}

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-400" />
            <h3 className="font-mono text-lg font-semibold text-[#da3633]">{ipData.ip}</h3>
          </div>
          <div className="flex items-center gap-1 bg-[#da3633]/15 text-[#da3633] px-2 py-0.5 rounded border border-[#da3633]/40 text-[10px] font-semibold">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
             LIVE BLOCK
          </div>
        </div>

        <div className="flex flex-col gap-1">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Strike Reason</span>
           <span className="text-slate-700 dark:text-[#c9d1d9] font-medium text-sm">
             {ipData.reason || 'Pattern Match'}
           </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 flex flex-col gap-0.5 border border-slate-100 dark:border-[#30363d]">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Intercepted</span>
            <span className="text-slate-900 dark:text-[#c9d1d9] font-semibold text-base">{ipData.total_packets_intercepted} pkts</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 flex flex-col gap-0.5 border border-slate-100 dark:border-[#30363d]">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Isolation</span>
            <span className="text-[#da3633] font-semibold text-base">STRICT</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-[#30363d]">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock size={10} /> {ipData.blocked_at || 'Recently'}
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              {!isConfirming ? (
                <motion.button
                  key="unblock-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setIsConfirming(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider transition-colors border border-slate-200 dark:border-[#30363d]"
                >
                  <Unlock size={12} /> Unblock
                </motion.button>
              ) : (
                <motion.button
                  key="confirm-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleUnblock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-red-500/20"
                >
                  Confirm
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatCard;

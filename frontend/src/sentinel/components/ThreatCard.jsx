import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Clock, Unlock } from 'lucide-react';
import axios from 'axios';

const ThreatCard = ({ ipData, isNew, sentinelBaseUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleUnblock = async () => {
    setIsRemoving(true);
    try {
      await axios.delete(`${sentinelBaseUrl}/block-ip/${ipData.ip}`);
    } catch (e) {
      console.error("Failed to unblock", e);
      setIsRemoving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: isRemoving ? 0 : 1, scale: isRemoving ? 0.9 : 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsConfirming(false); }}
      className={`relative bg-[#1A1F2B] border rounded-2xl p-5 overflow-hidden transition-all duration-300 ${
        isHovered ? 'shadow-[0_0_20px_rgba(239,68,68,0.15)] border-red-500/50' : 'border-white/10'
      }`}
    >
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-400" />
            <h3 className="font-mono text-lg font-black text-red-500">{ipData.ip}</h3>
          </div>
        </div>

        <div className="flex flex-col gap-1">
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Strike Reason</span>
           <span className="text-slate-200 font-medium text-sm">
             {ipData.reason || 'Pattern Match'}
           </span>
        </div>

        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
            <Clock size={10} /> {ipData.blocked_at || 'Recently'}
          </div>
          
          <div className="relative">
            <AnimatePresence mode="wait">
              {!isConfirming ? (
                <motion.button
                  key="unblock-btn"
                  onClick={() => setIsConfirming(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider transition-colors border border-white/5"
                >
                  <Unlock size={12} /> Unblock
                </motion.button>
              ) : (
                <motion.button
                  key="confirm-btn"
                  onClick={handleUnblock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-wider transition-colors shadow-lg shadow-red-500/20"
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

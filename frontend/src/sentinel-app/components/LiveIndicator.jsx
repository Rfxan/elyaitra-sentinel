import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';

const LiveIndicator = ({ isLive }) => {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-black/5 dark:bg-[#0d1117] border border-black/10 dark:border-[#30363d] shadow-inner">
      <AnimatePresence mode="wait">
        {isLive ? (
          <motion.div
            key="live"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex h-3 w-3">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600 border border-rose-800"></span>
            </div>
            <span className="text-sm font-semibold text-[#da3633] dark:text-[#da3633] tracking-widest uppercase">Live</span>
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400 dark:bg-zinc-600 border border-slate-500"></span>
            </div>
            <span className="text-sm font-semibold text-slate-500 dark:text-zinc-500 tracking-widest uppercase flex items-center gap-1.5">
              <Radio size={14} />
              Offline
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveIndicator;

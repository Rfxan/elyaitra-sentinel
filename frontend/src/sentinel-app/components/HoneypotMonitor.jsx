import React, { useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HoneypotMonitor = ({ honeypotLog }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [honeypotLog]);

  return (
    <div className="glass-card flex flex-col h-[500px] overflow-hidden border border-slate-200 dark:border-[#30363d] rounded-lg shadow-sm relative group">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] overflow-hidden rounded-md">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#000_1px,#000_2px)] bg-[length:100%_3px] animate-scanline" />
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
          <TerminalIcon size={16} className="text-[#3fb950]" />
          Honeypot Monitor (Live)
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[10px] font-semibold text-[#3fb950] uppercase tracking-wider">Active</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-[#161b22] p-4 font-mono text-[11px] overflow-y-auto scrollbar-thin flex flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {honeypotLog.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 dark:text-[#8b949e] italic">
              [SYSTEM_IDLE] Waiting for threat containment...
            </div>
          ) : (
            honeypotLog.map((log, i) => (
              <motion.div
                key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-md flex flex-col gap-1 relative overflow-hidden group/log"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#3fb950] font-semibold flex items-center gap-1">
                      <ShieldCheck size={12} />
                      🪤 HONEYPOT TRIGGERED
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-[#8b949e] font-semibold">[{log.timestamp.split(' ')[1]}]</span>
                </div>
                
                <div className="grid grid-cols-[80px_1fr] gap-x-2 text-slate-700 dark:text-[#c9d1d9] mt-1">
                  <span className="text-slate-500 dark:text-[#8b949e]">Target IP:</span>
                  <span className="font-semibold">{log.ip}</span>
                  
                  <span className="text-slate-500 dark:text-[#8b949e]">Lure Deployed:</span>
                  <span className="italic">{log.lure_type}</span>
                  
                  <span className="text-slate-500 dark:text-[#8b949e]">Decoy Payload:</span>
                  <span className="text-slate-600 dark:text-[#8b949e] truncate">{log.decoy_data}</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-[#30363d] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase font-semibold tracking-wider flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                    Status: Attacker received fake data ✓
                  </span>
                </div>

                {/* Glitch Effect on Hover */}
                <div className="absolute inset-0 bg-[#3fb950]/5 mix-blend-overlay opacity-0 group-hover/log:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HoneypotMonitor;

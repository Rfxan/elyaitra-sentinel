import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, Server, Shield, Activity, Fingerprint, ExternalLink } from 'lucide-react';
import SHAPPanel from './SHAPPanel';

const TrafficDrawer = ({ row, isOpen, onClose }) => {
  const [showSHAP, setShowSHAP] = useState(false);
  const generateSynthetic = (ip) => {
    const hash = ip?.split('.').reduce((a, b) => a + parseInt(b), 0) || 50;
    const protocols = ['TCP', 'UDP', 'ICMP', 'HTTP'];
    const destIps = ['10.0.0.5', '10.0.0.12', '192.168.1.1', '172.16.0.45'];
    
    return {
      destIp: destIps[hash % destIps.length],
      protocol: protocols[hash % protocols.length],
      packetSize: (hash * 123) % 4096 + 64,
      port: (hash * 99) % 65535,
    };
  };

  const synthetic = row ? generateSynthetic(row.ip || row.source_ip) : null;

  return (
    <AnimatePresence>
      {isOpen && row && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.1 } }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-[#0d1117] backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-50 dark:bg-[#0c0c0c] border-l border-slate-200 dark:border-[#30363d] shadow-md z-[110] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between bg-white dark:bg-[#111]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Network size={20} className="text-[#58a6ff]" />
                Packet Inspection
              </h3>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-100 dark:bg-[#161b22]/50 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-[#8b949e] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className={`p-4 rounded-md border flex items-center justify-between ${
                row.type?.toLowerCase() === 'attack' ? 'bg-[#da3633]/15/50 dark:bg-[#da3633]/15 border-[#da3633]/40 dark:border-rose-900/50 text-rose-700 dark:text-[#da3633]' :
                row.type?.toLowerCase() === 'evasion' ? 'bg-[#d29922]/15/50 dark:bg-[#d29922]/15 border-[#d29922]/40 dark:border-amber-900/50 text-amber-700 dark:text-[#d29922]' :
                row.type?.toLowerCase() === 'poisoning' ? 'bg-[#8957e5]/15/50 dark:bg-[#8957e5]/15 border-[#8957e5]/40 dark:border-purple-900/50 text-purple-700 dark:text-[#a371f7]' :
                'bg-[#238636]/15 dark:bg-[#238636]/15 border-[#238636]/40 dark:border-emerald-900/50 text-emerald-700 dark:text-[#3fb950]'
              }`}>
                <div className="flex items-center gap-3">
                  <Shield size={24} />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">Classification</div>
                    <div className="text-lg font-semibold uppercase tracking-wider">{row.type || 'Normal'}</div>
                  </div>
                </div>
                <div className={`text-xs font-semibold px-3 py-1 rounded-md uppercase border ${
                  row.status === 'blocked' || row.status === 'rejected' 
                  ? 'bg-rose-500 text-white border-rose-600' 
                  : row.status === 'flagged'
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-emerald-500 text-white border-emerald-600'
                }`}>
                  {row.status}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Model Confidence</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{(row.confidence * 100).toFixed(2)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-[#161b22] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${row.confidence * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      row.confidence > 0.8 ? 'bg-rose-500' :
                      row.confidence > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-[#8b949e] mb-1">
                    <Server size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Source IP</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {row.ip || row.source_ip}
                  </div>
                </div>
                <div className="p-4 rounded-md bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] shadow-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-[#8b949e] mb-1">
                    <Network size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Dest IP</span>
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {synthetic?.destIp}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Activity size={14} /> Meta
                </h4>
                <div className="bg-white dark:bg-[#161b22] rounded-md border border-slate-100 dark:border-[#30363d] divide-y divide-slate-100 dark:divide-zinc-800 shadow-sm">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-[#c9d1d9]">Timestamp</span>
                    <span className="text-sm font-mono text-slate-900 dark:text-white">{new Date(row.timestamp || row.time * 1000).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-[#c9d1d9]">Protocol</span>
                    <span className="text-sm font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-[#161b22] px-2 py-0.5 rounded">{synthetic?.protocol}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-[#c9d1d9]">Target Port</span>
                    <span className="text-sm font-mono text-slate-900 dark:text-white">{synthetic?.port}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-[#c9d1d9]">Payload Size</span>
                    <span className="text-sm font-mono text-slate-900 dark:text-white">{synthetic?.packetSize} bytes</span>
                  </div>
                </div>
              </div>

              {/* MITRE and Category Badges */}
              <div className="flex flex-wrap gap-2">
                {row.label_name && (
                  <div className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-semibold uppercase tracking-widest rounded-lg border border-white/5">
                    Category: {row.label_name}
                  </div>
                )}
                {row.mitre_id && row.mitre_id !== 'N/A' && (
                  <div className="px-3 py-1 bg-[#d29922]/15 text-[#d29922] text-[10px] font-semibold uppercase tracking-widest rounded-lg border border-[#d29922]/40">
                    MITRE {row.mitre_id}: {row.mitre_name}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 mt-auto">
                <button 
                  onClick={() => setShowSHAP(true)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <ExternalLink size={14} /> VIEW SHAP EXPLANATION
                </button>
              </div>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {showSHAP && <SHAPPanel event={row} onClose={() => setShowSHAP(false)} />}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrafficDrawer;

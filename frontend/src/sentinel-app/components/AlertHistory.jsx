import React, { useState, useMemo } from 'react';
import { ShieldAlert, BellOff, Search, Filter } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import AlertCard from './AlertCard';
import { motion } from 'framer-motion';

const AlertHistory = () => {
  const { alerts } = useAlerts();
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Type matching
      if (filter !== 'ALL' && alert.type?.toLowerCase() !== filter.toLowerCase()) {
        return false;
      }
      // IP matching
      if (searchQuery) {
        const ip = alert.ip || alert.source_ip || '';
        if (!ip.includes(searchQuery)) return false;
      }
      return true;
    });
  }, [alerts, filter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex-1 flex flex-col overflow-hidden rounded-md border-white/[0.05] shadow-md relative"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/[0.05] dark:border-white/[0.05] bg-gradient-to-r from-slate-100/80 to-slate-50/50 dark:from-black/40 dark:to-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 transition-colors duration-300">
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white flex items-center gap-3">
              <ShieldAlert size={24} className="text-[#da3633]" />
              Security Alerts History
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review the latest detected threats and anomalous model behavior.</p>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Filter & Search Toolbar */}
             <div className="flex items-center bg-white/50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-lg p-1 shadow-sm">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'ALL' ? 'bg-slate-800 text-white dark:bg-white dark:text-black shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setFilter('ATTACK')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'ATTACK' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  ATTACKS
                </button>
                <button 
                  onClick={() => setFilter('EVASION')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === 'EVASION' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                  EVASIONS
                </button>
             </div>

             <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search IP..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-8 pr-4 py-1.5 text-sm rounded-lg bg-white/50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] w-32 focus:w-48 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 dark:text-[#c9d1d9]"
               />
             </div>

             <div className="bg-slate-200 dark:bg-[#161b22] px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-[#c9d1d9] shadow-inner">
               {filteredAlerts.length} Records
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-white/30 dark:bg-[#080808]/50 transition-colors duration-300 scroll-smooth">
          {filteredAlerts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {filteredAlerts.map((alert, idx) => (
                <AlertCard key={`${alert.time}-${alert.ip}-${idx}`} alert={alert} index={idx} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center opacity-70"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] flex items-center justify-center mb-5 shadow-inner">
                <BellOff size={32} className="text-slate-400 dark:text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No Alerts Found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-500 max-w-sm mt-2 leading-relaxed">
                {searchQuery || filter !== 'ALL' 
                  ? "No alerts match your current filter and search criteria."
                  : "Your environment is currently secure. Anomalous behavior and threat mitigations will appear here in real-time."
                }
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AlertHistory;

import React, { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useWebSocketFeed from '../hooks/useWebSocketFeed';
import LiveIndicator from './LiveIndicator';
import TrafficRow from './TrafficRow';
import TrafficDrawer from './TrafficDrawer';
import { Activity, Pause, Play, Search, Filter, RefreshCw } from 'lucide-react';

const TrafficFeed = () => {
  const [trafficFeed, setTrafficFeed] = useState([]);
  
  // Real-time updates via WebSocket
  const { isConnected } = useWebSocketFeed((newLog) => {
    setTrafficFeed((prev) => {
      // Deduplicate by ID
      if (prev.some(item => item.id === newLog.id)) return prev;
      return [newLog, ...prev].slice(0, 500); // Keep last 500
    });
  });

  // Initial fetch
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const resp = await fetch('/sentinel-api/traffic-feed');
        if (resp.ok) {
          const data = await resp.json();
          setTrafficFeed(data);
        }
      } catch (err) {
        console.error('Failed to fetch initial traffic:', err);
      }
    };
    fetchInitial();
  }, []);
  
  const isLive = isConnected;
  
  const [isPaused, setIsPaused] = useState(false);
  const [frozenFeed, setFrozenFeed] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const currentFeed = isPaused ? frozenFeed : trafficFeed;

  const handlePauseToggle = () => {
    if (!isPaused) {
      setFrozenFeed([...trafficFeed]);
    }
    setIsPaused(!isPaused);
  };

  const displayFeed = useMemo(() => {
    if (!currentFeed) return [];
    let processed = [...currentFeed].reverse();
    if (filter !== 'ALL') {
      processed = processed.filter(item => (item.type?.toLowerCase() || 'normal') === filter.toLowerCase());
    }
    if (searchQuery) {
      processed = processed.filter(item => {
        const ip = item.ip || item.source_ip || '';
        return ip.includes(searchQuery);
      });
    }
    return processed.slice(0, 100);
  }, [currentFeed, filter, searchQuery]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full relative">
      <TrafficDrawer row={selectedRow} isOpen={!!selectedRow} onClose={() => setSelectedRow(null)} />
      <div className="glass-card flex-1 flex flex-col overflow-hidden rounded-md border-white/[0.05] shadow-md relative">
        <div className="px-6 py-5 border-b border-black/[0.05] dark:border-white/[0.05] bg-slate-100/80 dark:bg-[#0d1117] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-md bg-[#388bfd]/15 text-[#58a6ff] dark:text-[#58a6ff]">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">Live Traffic Feed</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time system log ingestion.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <LiveIndicator isLive={isLive && !isPaused} />
             <button 
               onClick={async () => {
                 if (confirm('Are you sure you want to reset all demo intelligence data?')) {
                   await fetch('/api/v1/demo/reset');
                   window.location.reload();
                 }
               }}
               className="p-2 rounded-lg border border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
             >
               <RefreshCw size={12} />
               Reset Intelligence
             </button>
             <button 
               onClick={handlePauseToggle}
               className={`p-2 rounded-lg border shadow-sm transition-all flex items-center gap-2 text-sm font-bold ${
                 isPaused ? 'bg-rose-500 text-white border-rose-600' : 'bg-white dark:bg-[#161b22] text-slate-600 dark:text-[#c9d1d9] border-slate-200 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-zinc-700'
               }`}
             >
               {isPaused ? <Play size={16} /> : <Pause size={16} />}
               {isPaused ? 'RESUME' : 'PAUSE'}
             </button>
          </div>
        </div>
        <div className="px-6 py-3 border-b border-black/[0.05] dark:border-white/[0.05] bg-white/50 dark:bg-[#0c0c0c]/80 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 dark:text-zinc-500" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm font-semibold bg-transparent border-none text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer outline-none">
              <option value="ALL">All Traffic</option>
              <option value="NORMAL">Normal</option>
              <option value="ATTACK">Attacks</option>
              <option value="EVASION">Evasions</option>
              <option value="POISONING">Poisoning</option>
            </select>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search IP Address..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 pr-4 py-1.5 text-sm rounded-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] w-48 focus:w-64 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-700 dark:text-[#c9d1d9] shadow-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-white/30 dark:bg-[#080808]/50 transition-colors duration-300">
          <table className="w-full text-left border-collapse">
             <thead className="sticky top-0 bg-slate-100/90 dark:bg-[#0d1117] backdrop-blur-md z-10 border-b border-black/10 dark:border-[#30363d] shadow-sm">
               <tr>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Timestamp</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Source IP</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Traffic Type</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">MITRE</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Reputation</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Confidence</th>
                 <th className="p-4 text-xs font-bold text-slate-500 dark:text-[#8b949e] uppercase tracking-wider">Status</th>
               </tr>
             </thead>
             <tbody>
                <AnimatePresence>
                  {displayFeed.map((row) => (
                    <TrafficRow key={row.id || `${row.timestamp}-${row.ip}-${Math.random()}`} row={row} onClick={setSelectedRow} />
                  ))}
                </AnimatePresence>
             </tbody>
          </table>
          {displayFeed.length === 0 && <div className="p-10 text-center text-slate-500 dark:text-zinc-500 text-sm font-medium">No matching traffic logs found.</div>}
        </div>
      </div>
    </div>
  );
};

export default TrafficFeed;

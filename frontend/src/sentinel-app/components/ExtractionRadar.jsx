import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Shield, Activity, Zap, AlertTriangle, Info } from 'lucide-react';

const API_BASE = "/sentinel-api";

const ThreatRow = ({ threat }) => {
  const getRiskColor = (risk) => {
    if (risk < 30) return 'bg-emerald-500';
    if (risk < 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getRiskTextColor = (risk) => {
    if (risk < 30) return 'text-[#3fb950]';
    if (risk < 60) return 'text-[#d29922]';
    return 'text-[#da3633]';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.05] rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-all">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-800 dark:text-[#c9d1d9] font-bold">{threat.ip}</span>
          {threat.is_honeypot && (
            <span className="px-2 py-0.5 bg-rose-50 dark:bg-[#da3633]/15 text-[#da3633] border border-[#da3633]/40 dark:border-[#da3633]/40 rounded text-[10px] font-semibold tracking-widest uppercase">
              Honeypot Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Queries: <span className="text-slate-700 dark:text-[#c9d1d9] font-medium">{threat.query_count}</span></span>
          <span>Risk Score: <span className={`font-bold ${getRiskTextColor(threat.risk)}`}>{threat.risk}%</span></span>
        </div>
      </div>
      <div className="w-32 h-1.5 bg-slate-200 dark:bg-[#161b22] rounded-full overflow-hidden">
        <div 
          className={`h-full ${getRiskColor(threat.risk)} transition-all duration-500`} 
          style={{ width: `${threat.risk}%` }}
        />
      </div>
    </div>
  );
};

const ExtractionRadar = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/extraction-status`);
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch extraction status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = async (mode, count) => {
    try {
      await axios.post(`${API_BASE}/simulate`, { mode, count });
    } catch (err) {
      console.error(`Failed to run ${mode} simulation:`, err);
    }
  };

  if (!status && loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Initializing Radar...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#388bfd]/15 text-[#58a6ff] rounded-md border border-[#388bfd]/40 shadow-sm">
            <Eye size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Extraction Radar</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors duration-300">Real-time model theft monitoring & honeypot defense.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => runSimulation('extraction_blitz', 30)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all shadow-lg active:scale-95"
          >
            <Zap size={14} /> EXTRACTION BLITZ
          </button>
          <button 
            onClick={() => runSimulation('extraction', 15)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#161b22] hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md transition-all border border-slate-200 dark:border-[#30363d] active:scale-95 shadow-sm dark:shadow-none"
          >
            <Activity size={14} /> COVERAGE ATTACK
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Radar View */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.05] rounded-lg p-6 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05] pb-4 mb-2">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center gap-2">
                <AlertTriangle size={16} className="text-[#d29922]" /> Active Threats
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">AUTOSCAN: ENABLED</span>
            </div>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {status?.active_threats.length > 0 ? (
                status.active_threats.map(threat => (
                  <ThreatRow key={threat.ip} threat={threat} />
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-700">
                    <Shield size={24} />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No active extraction probes detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.05] rounded-lg p-6 shadow-sm dark:shadow-none transition-colors duration-300">
              <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase mb-1">Attempts Blocked</p>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-white transition-colors duration-300">{status?.total_extraction_attempts || 0}</h2>
            </div>
            <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.05] rounded-lg p-6 border-l-4 border-l-rose-500 shadow-sm dark:shadow-none transition-colors duration-300">
              <p className="text-slate-500 text-xs font-semibold tracking-widest uppercase mb-1">Honeypot Activations</p>
              <h2 className="text-3xl font-semibold text-[#da3633]">{status?.honeypot_activations || 0}</h2>
            </div>
          </div>
        </div>

        {/* Sidebar: Log & How it Works */}
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-white/[0.05] shadow-sm dark:shadow-none rounded-lg p-6 flex-1 flex flex-col gap-4 transition-colors duration-300">
             <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-widest uppercase">Radar Events</h3>
             <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
               {status?.recent_events.map((event, i) => (
                 <div key={i} className="flex gap-4 items-start text-xs border-b border-slate-100 dark:border-white/[0.03] pb-3 last:border-0">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${event.type === 'honeypot_activated' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                    <div className="flex flex-col gap-1">
                      <p className="text-slate-800 dark:text-slate-300 font-bold">
                        {event.type === 'honeypot_activated' ? 'Honeypot Triggered' : 'Extraction Probe'}
                      </p>
                      <p className="text-slate-500 font-mono">{event.ip} • {event.ts}</p>
                    </div>
                 </div>
               ))}
               {status?.recent_events.length === 0 && <p className="text-slate-400 dark:text-slate-600 text-xs italic">Awaiting events...</p>}
             </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/5 border border-[#388bfd]/40 dark:border-[#388bfd]/40 rounded-lg p-6 flex flex-col gap-4 shadow-sm dark:shadow-[inset_0_0_30px_rgba(99,102,241,0.05)] transition-colors duration-300">
            <h3 className="text-sm font-semibold text-[#58a6ff] dark:text-[#58a6ff] flex items-center gap-2">
              <Info size={16} /> How it Works
            </h3>
            <p className="text-xs text-indigo-900/70 dark:text-indigo-200/60 leading-relaxed">
              When an IP's risk score exceeds <span className="text-[#58a6ff] dark:text-indigo-300 font-bold">60</span>, the system stops blocking. Instead, it secretly flips all predictions and serves fake confidence scores.
            </p>
            <p className="text-xs text-indigo-900/70 dark:text-indigo-200/60 leading-relaxed">
              The attacker's surrogate model trains on poisoned data — learning everything backwards while believing the attack is working.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractionRadar;

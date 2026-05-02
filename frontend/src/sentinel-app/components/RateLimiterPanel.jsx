import React, { useState, useEffect } from 'react';
import { Activity, ShieldOff, Waves, Clock } from 'lucide-react';

const API_BASE = "/sentinel-api";

const RateLimiterPanel = () => {
  const [rateStatus, setRateStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/train-rate-status`);
      if (res.ok) {
        const data = await res.json();
        setRateStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch rate limits', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const ips = Object.keys(rateStatus);
  const totalTracked = ips.length;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-lg p-6 border border-slate-200 dark:border-[#30363d] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#58a6ff]/10 rounded-md border border-[#58a6ff]/20">
            <Waves size={20} className="text-[#58a6ff]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#c9d1d9]">Training Rate Limits</h3>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">Anti-Poisoning Throttle</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-[#0d1117] rounded-md text-xs font-semibold text-slate-600 dark:text-[#8b949e] border border-slate-200 dark:border-[#30363d]">
          Tracking: {totalTracked} IPs
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin max-h-[300px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">Loading rates...</div>
        ) : totalTracked === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 py-8 gap-2">
            <ShieldOff size={24} className="opacity-50" />
            <p className="text-sm font-bold opacity-75">No Training Activity</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ips.map(ip => {
              const data = rateStatus[ip];
              const pct = Math.min((data.count / data.max_calls) * 100, 100);
              const isDanger = pct >= 80;
              
              return (
                <div key={ip} className="p-4 rounded-md bg-slate-50 dark:bg-[#161b22]/50 border border-slate-100 dark:border-[#30363d]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{ip}</span>
                    <span className={`text-xs font-semibold ${isDanger ? 'text-[#da3633]' : 'text-slate-500 dark:text-[#8b949e]'}`}>
                      {data.count} / {data.max_calls} calls
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-rose-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    <Clock size={12} />
                    <span>{data.window_seconds}s Window</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RateLimiterPanel;

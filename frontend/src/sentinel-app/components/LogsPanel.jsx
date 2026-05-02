import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';

const LogsPanel = ({ logs }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'attack':
        return 'text-red-500';
      case 'evasion':
        return 'text-yellow-500';
      case 'normal':
        return 'text-green-500';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <GlassCard className="flex flex-col h-[400px] lg:h-[500px] border-white/5">
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Live Telemetry</h3>
        </div>
        <div className="flex gap-1.5 focus-within:ring-2">
          <div className="w-2 h-2 rounded-full bg-white/10"></div>
          <div className="w-2 h-2 rounded-full bg-white/10"></div>
          <div className="w-2 h-2 rounded-full bg-primary/40"></div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 bg-black/40 p-5 overflow-y-auto scrollbar-thin font-mono text-[13px] leading-relaxed"
      >
        {Array.isArray(logs) && logs.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className="animate-fade-in flex gap-4 pb-1 group"
              >
                <span className="text-slate-600 shrink-0 text-[11px] font-bold">
                  {(() => {
                    const d = new Date(log.time ? log.time * 1000 : log.timestamp || Date.now());
                    return d.toLocaleTimeString('en-GB', { hour12: false });
                  })()}
                </span>
                <span className={`font-bold shrink-0 uppercase text-[11px] w-16 tracking-tighter ${getLogColor(log.type)}`}>
                  [{log.type || 'UNKNOWN'}]
                </span>
                <div className="text-slate-300 break-all flex flex-wrap items-center gap-2">
                  <span className="font-bold text-primary/80">{log.source_ip || log.ip}</span>
                  <span className="text-slate-500 opacity-80">{log.details || 'No details provided'}</span>
                  {log.mitre_id && log.mitre_id !== 'N/A' && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-500/10 text-red-500 border border-red-500/20 rounded uppercase tracking-tighter">
                      MITRE {log.mitre_id}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
            <Cpu size={30} className="animate-pulse opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest italic">Awaiting Telemetry Stream...</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default LogsPanel;

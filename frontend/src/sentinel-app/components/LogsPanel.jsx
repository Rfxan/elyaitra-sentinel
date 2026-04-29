import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

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
        return 'text-[#da3633]';
      case 'evasion':
        return 'text-[#d29922]';
      case 'normal':
        return 'text-[#3fb950]';
      default:
        return 'text-[#8b949e]';
    }
  };

  return (
    <div className="glass-card flex flex-col h-[400px] lg:h-[500px]">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-[#30363d] flex items-center gap-3 bg-slate-50 dark:bg-[#0d1117]">
        <Terminal size={18} className="text-[#58a6ff]" />
        <h3 className="font-semibold text-slate-800 dark:text-[#c9d1d9]">System Logs</h3>
        <div className="ml-auto flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#30363d]"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#30363d]"></div>
          <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-[#30363d]"></div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-[#161b22] p-5 overflow-y-auto scrollbar-thin font-mono text-sm"
      >
        {Array.isArray(logs) && logs.length > 0 ? (
          <div className="flex flex-col gap-2">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className="animate-slide-in-top flex gap-4 border-b border-slate-100 dark:border-[#21262d] pb-2 last:border-0"
              >
                <span className="text-slate-400 dark:text-[#484f58] shrink-0">
                  [{(() => {
                    const d = new Date(log.time ? log.time * 1000 : log.timestamp || Date.now());
                    return d.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(d.getMilliseconds()).padStart(3, '0');
                  })()}]
                </span>
                <span className={`font-semibold shrink-0 uppercase tracking-wider ${getLogColor(log.type)}`}>
                  {log.type || 'UNKNOWN'}
                </span>
                <span className="text-slate-700 dark:text-[#c9d1d9] break-all flex items-center gap-2">
                  <span>{log.source_ip || log.ip} - {log.details || 'No details provided'}</span>
                  {log.mitre_id && log.mitre_id !== 'N/A' && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#d29922]/10 text-[#d29922] rounded-md uppercase tracking-wider">
                      MITRE {log.mitre_id}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-[#484f58] italic">
            Waiting for log stream...
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPanel;

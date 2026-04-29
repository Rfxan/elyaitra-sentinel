import React, { useEffect, useState } from 'react';
import { Terminal } from 'lucide-react';

const API_BASE = "/sentinel-api";

const SIEMLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_BASE}/siem-log`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch SIEM logs", error);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto h-full p-6 bg-slate-50 dark:bg-[#0c0c0c] text-green-600 dark:text-green-400 font-mono rounded-md border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md glass-card">
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <Terminal size={24} className="text-[#3fb950]" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest drop-shadow-sm">SIEM Live Event Stream</h2>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Incident ID</th>
              <th className="py-3 px-4">Source IP</th>
              <th className="py-3 px-4">Event</th>
              <th className="py-3 px-4">MITRE ID</th>
              <th className="py-3 px-4 text-center">Severity</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const sev = log.severity?.toLowerCase();
              const sevClass = 
                sev === 'critical' ? 'bg-[#da3633]/15 text-[#da3633] border-[#da3633]/40' :
                sev === 'high' ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' :
                sev === 'medium' ? 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40' :
                'bg-[#238636]/15 text-[#3fb950] border-[#238636]/40';

              return (
                <tr key={i} className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {log.time ? new Date(log.time * 1000).toLocaleString([], { hour12: false }) : log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-[#3fb950] dark:text-[#3fb950] font-mono text-xs">{log.incident_id}</td>
                  <td className="py-3 px-4 text-[#58a6ff] dark:text-[#58a6ff] font-medium">{log.source_ip}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 uppercase text-xs font-bold">{log.event_type}</td>
                  <td className="py-3 px-4 text-[#d29922] font-mono text-xs">{log.mitre_id}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${sevClass}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'blocked' ? <span className="text-[#da3633] text-[10px] font-bold uppercase tracking-tighter">● BLOCKED</span> : 
                     log.status === 'allowed' ? <span className="text-[#3fb950] text-[10px] font-bold uppercase tracking-tighter">● ALLOWED</span> : 
                     <span className="text-slate-500 text-[10px] font-bold uppercase tracking-tighter">● {log.status}</span>}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">No events recorded. Waiting for stream...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SIEMLog;

import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  AlertTriangle, 
  Clock, 
  ChevronRight,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import StatCard from './StatCard';

const API_BASE = "/sentinel-api";

const IncidentDashboard = () => {
  const [summary, setSummary] = useState({
    total_incidents: 0,
    active: 0,
    critical: 0,
    top_ips: []
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [sumRes, incRes] = await Promise.all([
        fetch(`${API_BASE}/incident-summary`),
        fetch(`${API_BASE}/incidents`)
      ]);
      
      if (sumRes.ok && incRes.ok) {
        const sumData = await sumRes.json();
        const incData = await incRes.json();
        setSummary(sumData);
        setIncidents(incData);
      }
    } catch (error) {
      console.error("Failed to fetch SIEM data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'text-[#da3633] bg-[#da3633]/15 border-[#da3633]/40';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-[#d29922] bg-[#d29922]/15 border-[#d29922]/40';
      default: return 'text-[#3fb950] bg-[#238636]/15 border-[#238636]/40';
    }
  };

  const getPatternIcon = (pattern) => {
    switch (pattern?.toLowerCase()) {
      case 'escalating': return <TrendingUp size={14} className="text-[#da3633]" />;
      case 'persistent': return <Activity size={14} className="text-orange-500" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <ShieldAlert className="text-[#3fb950]" size={28} />
            SIEM Incident Command
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time correlation and threat grouping engine</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#238636]/15 border border-[#238636]/40 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-bold text-[#3fb950] uppercase tracking-widest">Engine Active</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Incidents" 
          value={summary.total_incidents} 
          icon={Fingerprint} 
          colorClass="text-[#58a6ff]" 
          gradientClass="bg-blue-500" 
        />
        <StatCard 
          title="Active Clusters" 
          value={summary.active} 
          icon={Users} 
          colorClass="text-[#a371f7]" 
          gradientClass="bg-purple-500" 
        />
        <StatCard 
          title="Critical Threats" 
          value={summary.critical} 
          icon={AlertTriangle} 
          colorClass="text-[#da3633]" 
          gradientClass="bg-rose-500" 
        />
        <div className="glass-card p-6 flex flex-col justify-between">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-2">Top Offending IPs</p>
          <div className="flex flex-wrap gap-2">
            {summary.top_ips.map((ip, i) => (
              <span key={i} className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                {ip}
              </span>
            ))}
            {summary.top_ips.length === 0 && <span className="text-slate-400 dark:text-slate-600 italic text-xs">Awaiting traffic...</span>}
          </div>
        </div>
      </div>

      {/* Incident Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-[#c9d1d9]">Active Threat Clusters</h3>
          <span className="text-xs text-slate-500">{(incidents || []).length} incidents being tracked</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Incident ID</th>
                <th className="px-6 py-3 font-semibold">Source IP</th>
                <th className="px-6 py-3 font-semibold text-center">Events</th>
                <th className="px-6 py-3 font-semibold">Pattern</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Severity</th>
                <th className="px-6 py-3 font-semibold">Last Seen</th>
                <th className="px-6 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
              {(incidents || []).map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[#3fb950] dark:text-[#3fb950] text-sm">{inc.incident_id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{inc.ip}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                      {inc.event_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPatternIcon(inc.pattern)}
                      <span className="text-xs text-slate-600 dark:text-slate-400 capitalize">{inc.pattern}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      inc.status === 'blocked' ? 'text-[#da3633]' : 'text-[#3fb950] animate-pulse'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {inc.last_seen_time ? new Date(inc.last_seen_time * 1000).toLocaleString([], { hour12: false }) : inc.last_seen}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 dark:text-slate-500 group-hover:text-[#3fb950] dark:group-hover:text-[#3fb950]">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(incidents || []).length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 italic">
                    No active threat clusters detected. System is calm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentDashboard;

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
import { GlassCard } from '@/components/ui/glass-card';

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
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
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
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <ShieldAlert className="text-primary" size={28} />
             SIEM Incident Command
          </h1>
          <p className="text-slate-500 text-sm">Real-time correlation and threat grouping engine</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Engine Active</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Incidents" 
          value={summary.total_incidents} 
          icon={Fingerprint} 
          trend="up"
          trendValue="2.4"
        />
        <StatCard 
          title="Active Clusters" 
          value={summary.active} 
          icon={Users} 
          trend="down"
          trendValue="1.1"
        />
        <StatCard 
          title="Critical Threats" 
          value={summary.critical} 
          icon={AlertTriangle} 
          trend="up"
          trendValue="0.5"
        />
        <GlassCard className="p-5 flex flex-col justify-between border-white/5">
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-2">Offending Subnets</p>
          <div className="flex flex-wrap gap-2">
            {summary.top_ips.map((ip, i) => (
              <span key={i} className="text-[10px] font-mono bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-white/10 uppercase tracking-tighter">
                {ip}
              </span>
            ))}
            {summary.top_ips.length === 0 && <span className="text-slate-500 italic text-[10px]">No active blocks...</span>}
          </div>
        </GlassCard>
      </div>

      {/* Incident Table */}
      <GlassCard className="overflow-hidden border-white/5">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Active Threat Clusters</h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{(incidents || []).length} Live Correlated Traces</span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-black/20 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                <th className="px-6 py-3">Incident Hash</th>
                <th className="px-6 py-3">Source Vector</th>
                <th className="px-6 py-3 text-center">Events</th>
                <th className="px-6 py-3">Risk Pattern</th>
                <th className="px-6 py-3">Enforcement</th>
                <th className="px-6 py-3">Impact</th>
                <th className="px-6 py-3">Discovery</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(incidents || []).map((inc) => (
                <tr key={inc.incident_id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-primary text-xs uppercase">{inc.incident_id.slice(0, 12)}</td>
                  <td className="px-6 py-4 font-bold text-slate-300">{inc.ip}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 border border-white/10 uppercase tracking-tighter">
                      {inc.event_count} TRACES
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getPatternIcon(inc.pattern)}
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{inc.pattern}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      inc.status === 'blocked' ? 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-primary animate-pulse'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-tighter ${getSeverityColor(inc.severity)}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] text-slate-500 font-mono">
                    {inc.last_seen_time ? new Date(inc.last_seen_time * 1000).toLocaleTimeString([], { hour12: false }) : inc.last_seen}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-slate-600 group-hover:text-primary">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(incidents || []).length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-600 text-xs font-bold uppercase tracking-widest italic opacity-50">
                    System Secure. No anomalous activity correlated.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default IncidentDashboard;

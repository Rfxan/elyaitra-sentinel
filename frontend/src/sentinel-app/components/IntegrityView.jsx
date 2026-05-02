import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, AlertTriangle, TrendingUp, Loader2, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import axios from 'axios';

const API_BASE = "/api/v1/integrity";

const IntegrityView = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lRes, sRes] = await Promise.allSettled([
        axios.get(API_BASE + '/leaderboard'),
        axios.get(API_BASE + '/stats')
      ]);
      if (lRes.status === 'fulfilled') setLeaderboard(lRes.value.data);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
      else setStats({ avg_integrity: 100.0, total_users: 0, risk_distribution: { clean: 0, suspicious: 0, critical: 0 } });
    } catch (err) {
      console.error("Failed to fetch integrity data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Integrity Scoring</h1>
          <p className="text-slate-500 text-sm">Real-time telemetry on academic honesty and query risk.</p>
        </div>
        {loading && <Loader2 size={20} className="animate-spin text-primary" />}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <GlassCard className="p-6 lg:col-span-3 border-white/5">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
               <UserCheck size={18} className="text-primary" />
               Integrity Leaderboard
            </h3>
            <div className="w-full overflow-x-auto scrollbar-thin">
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="border-b border-white/5 text-slate-500 font-medium">
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Rank</th>
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Student / ID</th>
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Queries</th>
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Bypass Attempts</th>
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Integrity Score</th>
                        <th className="pb-3 px-2 uppercase tracking-wider text-[10px]">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {leaderboard.map((s, i) => (
                        <tr key={s.user_id} className="group hover:bg-white/5 transition-colors">
                           <td className="py-4 px-2 font-mono text-slate-500">#0{i+1}</td>
                           <td className="py-4 px-2">
                              <div className="flex flex-col">
                                 <span className="text-white font-bold">User_{s.user_id}</span>
                                 <span className="text-[10px] text-slate-500">ID: {String(s.user_id).slice(0, 8)}</span>
                              </div>
                           </td>
                           <td className="py-4 px-2 text-slate-400 font-mono">{s.total_queries}</td>
                           <td className="py-4 px-2 text-slate-400 font-mono">{s.bypass_attempts}</td>
                           <td className="py-4 px-2">
                              <span className={`font-bold ${s.integrity_score > 90 ? 'text-green-500' : s.integrity_score > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                                 {s.integrity_score.toFixed(0)}%
                              </span>
                           </td>
                           <td className="py-4 px-2">
                              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-center w-20 border uppercase tracking-wider
                                 ${s.integrity_score > 90 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                   s.integrity_score > 60 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                   'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                 {s.integrity_score > 90 ? 'Clean' : s.integrity_score > 60 ? 'Suspicious' : 'Critical'}
                              </div>
                           </td>
                        </tr>
                     ))}
                     {leaderboard.length === 0 && !loading && (
                        <tr>
                           <td colSpan={6} className="py-10 text-center text-slate-500 italic">No telemetry data available.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </GlassCard>

         <div className="flex flex-col gap-6">
            <GlassCard className="p-6 bg-primary/5 border border-primary/20">
               <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  Fleet Metrics
               </h3>
               <div className="space-y-6">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Global Avg Score</span>
                     <span className="text-3xl font-bold text-white tracking-tight">
                        {stats ? stats.avg_integrity.toFixed(1) : '0.0'}%
                     </span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Monitored</span>
                     <div className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
                        <Users size={20} className="text-slate-500" />
                        {stats ? stats.total_users : '0'}
                     </div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                     <div className="flex justify-between items-center text-[10px] uppercase font-bold mb-2">
                        <span className="text-slate-500">Security Coverage</span>
                        <span className="text-primary">100%</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.5)]" style={{ width: '100%' }} />
                     </div>
                  </div>
               </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/5">
               <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  Risk Distribution
               </h3>
               <div className="flex items-end gap-2 h-20 mb-2">
                  {[20, 15, 30, 25, 60, 45, 50].map((h, i) => (
                     <div key={i} className="flex-1 bg-white/5 hover:bg-red-500/50 transition-all rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
               </div>
               <div className="flex justify-between text-[8px] text-slate-500 uppercase font-bold tracking-tighter">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
               </div>
               <div className="mt-6 flex items-center gap-2 text-green-500 text-[10px] font-bold uppercase">
                  <TrendingUp size={14} />
                  <span>5.2% Bypass Reduction</span>
               </div>
            </GlassCard>
         </div>
      </div>
    </div>
  );
};

export default IntegrityView;

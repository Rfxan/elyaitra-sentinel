import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Activity, 
  ShieldAlert, 
  UserX,
  Target,
  Clock,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../hooks/useAlerts';
import HoneypotMonitor from './HoneypotMonitor';

const ATTACK_TYPE_COLORS = {
  evasion: '#f97316',   // orange-500
  poisoning: '#a855f7', // purple-500
  standard_attack: '#ef4444', // red-500
};

const AttackerIntelligence = () => {
  const { attackerProfiles, honeypotLog } = useAlerts();
  const [expandedIp, setExpandedIp] = useState(null);

  // Card Calculations
  const cards = useMemo(() => {
    if (!attackerProfiles || attackerProfiles.length === 0) {
      return [
        { title: 'Most Dangerous Attacker', value: 'None', sub: 'Monitoring...' },
        { title: 'Dominant Attack Vector', value: 'None', sub: 'No threats' },
        { title: 'Honeypots Activated', value: honeypotLog.length, sub: 'All decoys idle', isHoneypot: true }
      ];
    }

    const mostDangerous = [...attackerProfiles].sort((a, b) => b.events.length - a.events.length)[0];
    
    const vectorCounts = {};
    attackerProfiles.forEach(p => {
      p.events.forEach(e => {
        vectorCounts[e.attack_type] = (vectorCounts[e.attack_type] || 0) + 1;
      });
    });
    
    const totalEvents = Object.values(vectorCounts).reduce((a, b) => a + b, 0);
    const dominantVector = Object.entries(vectorCounts).sort((a, b) => b[1] - a[1])[0];
    const dominantPercentage = totalEvents > 0 ? Math.round((dominantVector[1] / totalEvents) * 100) : 0;

    return [
      { 
        title: 'Most Dangerous Attacker', 
        value: mostDangerous.ip, 
        sub: mostDangerous.behaviour_pattern 
      },
      { 
        title: 'Dominant Attack Vector', 
        value: dominantVector ? dominantVector[0].replace('_', ' ').toUpperCase() : 'None', 
        sub: `${dominantPercentage}% of observed threats` 
      },
      { 
        title: 'Honeypots Activated', 
        value: honeypotLog.length, 
        sub: honeypotLog.length > 0 ? 'Threat containment active' : 'Decoys idle',
        isHoneypot: true
      }
    ];
  }, [attackerProfiles, honeypotLog]);

  // Chart Data
  const chartData = useMemo(() => {
    return attackerProfiles.slice(0, 10).map(p => {
      const counts = { evasion: 0, poisoning: 0, standard_attack: 0 };
      p.events.forEach(e => {
        counts[e.attack_type] = (counts[e.attack_type] || 0) + 1;
      });
      return {
        name: p.ip.length > 12 ? p.ip.substring(0, 8) + '...' : p.ip,
        ...counts
      };
    });
  }, [attackerProfiles]);

  const toggleExpand = (ip) => {
    setExpandedIp(expandedIp === ip ? null : ip);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#8957e5]/15 text-[#a371f7] rounded-md border border-[#8957e5]/40 shadow-sm">
            <Zap size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Attacker Intelligence</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Deep behavioral profiling and vector correlation</p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              {card.isHoneypot ? <Shield size={64} /> : <Target size={64} />}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">{card.title}</span>
            <span className={`text-2xl font-semibold ${card.isHoneypot && card.value > 0 ? 'text-[#da3633]' : 'text-slate-900 dark:text-white'}`}>
              {card.value}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 italic">{card.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Profiles & Chart */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Profiles Table */}
          <div className="glass-card flex flex-col overflow-hidden">
            {/* ... table header ... */}
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#a371f7]" />
                Identified Threat Actors
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* ... table content ... */}
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 border-b border-white/5">
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Behaviour Pattern</th>
                  <th className="px-6 py-4">Attack Methods</th>
                  <th className="px-6 py-4">Strikes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {attackerProfiles.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic text-sm">
                        No active threat profiles established. Monitoring global traffic...
                      </td>
                    </tr>
                  ) : (
                    attackerProfiles.map((p) => (
                      <React.Fragment key={p.ip}>
                        <motion.tr 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-white/[0.02] transition-colors ${expandedIp === p.ip ? 'bg-white/[0.03]' : ''}`}
                        >
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">{p.ip}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                              {p.behaviour_pattern}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              {p.attack_types_used.map(t => (
                                <span 
                                  key={t} 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: ATTACK_TYPE_COLORS[t] || '#94a3b8' }}
                                  title={t}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-0.5">
                              {[...Array(3)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-3 h-1.5 rounded-sm ${i < p.total_strikes ? 'bg-red-500' : 'bg-slate-200 dark:bg-white/10'}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {p.is_blocked ? (
                              <span className="bg-[#da3633]/15 text-[#da3633] text-[10px] font-semibold px-2 py-1 rounded border border-[#da3633]/40 ">BLOCKED</span>
                            ) : (
                              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-semibold px-2 py-1 rounded border border-orange-500/30">MONITORING</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => toggleExpand(p.ip)}
                              className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400"
                            >
                              {expandedIp === p.ip ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </motion.tr>
                        <AnimatePresence>
                          {expandedIp === p.ip && (
                            <tr>
                              <td colSpan="6" className="px-6 py-0">
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-black/20 rounded-md my-4 border border-white/5"
                                >
                                  <div className="p-6 flex flex-col gap-4">
                                    <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                      <Clock size={12} /> Event Timeline
                                    </h4>
                                    <div className="flex flex-col gap-3">
                                      {p.events.map((e, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.01] rounded-lg">
                                          <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-mono text-zinc-600">{e.timestamp}</span>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                                              e.attack_type === 'evasion' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                              e.attack_type === 'poisoning' ? 'bg-[#8957e5]/15 text-[#a371f7] border-[#8957e5]/40' :
                                              'bg-[#da3633]/15 text-[#da3633] border-[#da3633]/40'
                                            }`}>
                                              {e.attack_type.toUpperCase()}
                                            </span>
                                            <div className="flex flex-col gap-0.5">
                                               <span className="text-[10px] text-zinc-500 uppercase">Confidence</span>
                                               <span className="text-xs font-bold text-slate-700 dark:text-white">{Math.round(e.confidence_score * 100)}%</span>
                                            </div>
                                            {e.z_score_max > 0 && (
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] text-zinc-500 uppercase">Z-Score</span>
                                                <span className="text-xs font-bold text-orange-400">{e.z_score_max.toFixed(2)}σ</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-4">
                                            {['min', 'max', 'mean'].map(k => (
                                              <div key={k} className="text-center">
                                                <div className="text-[9px] text-zinc-600 uppercase">{k}</div>
                                                <div className="text-[10px] font-mono text-zinc-400">{e.packet_features_summary[k].toFixed(2)}</div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="glass-card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
               <BarChart3 size={16} className="text-[#a371f7]" />
               Behaviour Pattern Correlation
             </h3>
             <span className="text-[10px] text-zinc-500 uppercase">Vector Distribution per IP</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  itemStyle={{ fontWeight: 'black' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="evasion" stackId="a" fill={ATTACK_TYPE_COLORS.evasion} radius={[0, 0, 0, 0]} />
                <Bar dataKey="standard_attack" stackId="a" fill={ATTACK_TYPE_COLORS.standard_attack} radius={[0, 0, 0, 0]} />
                <Bar dataKey="poisoning" stackId="a" fill={ATTACK_TYPE_COLORS.poisoning} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          </div>
        </div>

        {/* Right Side: Honeypot Monitor */}
        <div className="flex flex-col gap-6">
          <HoneypotMonitor honeypotLog={honeypotLog} />
          <div className="glass-card p-6 flex flex-col gap-3">
             <h4 className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Defence Summary</h4>
             <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
               Neural containment is active across 3 global regions. 
               All identified threat actors are being routed to isolation pools 
               where their behaviour is profiled via recursive honeypots.
             </p>
             <div className="flex items-center gap-2 mt-2">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               <span className="text-[10px] font-bold text-green-500">SYSTEM STABLE</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackerIntelligence;

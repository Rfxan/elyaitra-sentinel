import React from 'react';
import { ShieldAlert, Globe, Clock, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const AttackerProfileCard = ({ profile }) => {
  if (!profile) return null;

  const severityColor = {
    'CRITICAL': 'text-rose-500 border-rose-500/20 bg-rose-500/10',
    'HIGH': 'text-orange-500 border-orange-500/20 bg-orange-500/10',
    'MEDIUM': 'text-amber-500 border-amber-500/20 bg-amber-500/10',
    'LOW': 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d1117] border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest border-l border-b ${severityColor[profile.threat_level]}`}>
        {profile.threat_level} THREAT
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-white/10">
          <Zap size={24} className="text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white font-mono">{profile.ip}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-tighter">
            <Globe size={12} />
            Detected Pattern: <span className="text-rose-400">{profile.behaviour_pattern}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
            <ShieldAlert size={10} /> Total Strikes
          </div>
          <div className="text-xl font-bold text-white">{profile.total_strikes}</div>
        </div>
        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
            <Target size={10} /> Risk Score
          </div>
          <div className="text-xl font-bold text-rose-500">{profile.risk_score}%</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1"><Clock size={12}/> First Seen</span>
          <span className="text-slate-200 font-mono">{profile.first_seen}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1"><Clock size={12}/> Last Activity</span>
          <span className="text-slate-200 font-mono">{profile.last_seen}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="text-[10px] text-slate-500 uppercase font-bold mb-3">Techniques Observed</div>
        <div className="flex flex-wrap gap-2">
          {profile.attack_types_used.map(type => (
            <span key={type} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400 font-bold uppercase">
              {type.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AttackerProfileCard;

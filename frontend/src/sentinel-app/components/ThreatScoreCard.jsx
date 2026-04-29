import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Zap, Lock, Info, Activity } from 'lucide-react';

const API_BASE = "/sentinel-api";

const ThreatScoreCard = () => {
  const [scoreData, setScoreData] = useState({ score: 0, band: 'LOW' });
  const [loading, setLoading] = useState(true);

  const fetchScore = async () => {
    try {
      const res = await axios.get(`${API_BASE}/threat-score`);
      setScoreData(res.data);
    } catch (err) {
      console.error("Failed to fetch threat score:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScore();
    const interval = setInterval(fetchScore, 3000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score) => {
    if (score < 25) return 'text-[#3fb950]';
    if (score < 50) return 'text-[#d29922]';
    if (score < 75) return 'text-orange-500';
    return 'text-[#da3633]';
  };

  const getSeverityBandStyles = (band) => {
    switch (band) {
      case 'LOW': return 'bg-[#238636] text-white';
      case 'MEDIUM': return 'bg-[#d29922] text-white';
      case 'HIGH': return 'bg-[#da3633] text-white';
      case 'CRITICAL': return 'bg-[#da3633] text-white';
      default: return 'bg-[#30363d] text-[#c9d1d9]';
    }
  };

  const isCritical = scoreData.score >= 75;

  return (
    <div className={`bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg p-6 relative overflow-hidden ${isCritical ? 'border-l-4 border-l-[#da3633]' : ''}`}>
      <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className={`text-5xl font-bold tabular-nums transition-colors duration-500 ${getScoreColor(scoreData.score)}`}>
            {scoreData.score}
          </div>
          <div className={`px-3 py-0.5 rounded-md text-[10px] font-semibold tracking-wider ${getSeverityBandStyles(scoreData.band)}`}>
            {scoreData.band} SEVERITY
          </div>
        </div>

        <div className="hidden lg:block w-px h-12 bg-slate-200 dark:bg-[#30363d] mx-2" />

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0 w-full">
          {[
            { label: 'IP Blocks', value: 'System Strike', icon: <Lock size={12} /> },
            { label: 'Evasion', value: 'Dynamic Risk', icon: <Zap size={12} /> },
            { label: 'Poisoning', value: 'Training Integrity', icon: <ShieldAlert size={12} /> },
            { label: 'Accuracy', value: 'XGBoost Drift', icon: <Activity size={12} /> }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-[#8b949e] tracking-wider uppercase flex items-center gap-1.5 truncate">
                {item.icon} {item.label}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-[#c9d1d9] truncate">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-[#8b949e] p-3 bg-slate-50 dark:bg-[#0d1117] rounded-md border border-slate-200 dark:border-[#30363d]">
            <Info size={14} className="text-[#58a6ff]" /> COMPOSITE THREAT SCORE
          </div>
          <p className="text-[10px] text-slate-400 dark:text-[#484f58] font-mono">V4.2 AUDIT ENGINE: SECURE</p>
        </div>
      </div>
    </div>
  );
};

export default ThreatScoreCard;

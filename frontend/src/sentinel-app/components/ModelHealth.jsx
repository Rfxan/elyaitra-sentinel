import React, { useState } from 'react';
import axios from 'axios';
import { RefreshCw, Activity, Target, Shield, AlertOctagon } from 'lucide-react';

const ModelHealth = ({ stats }) => {
  const [isRetraining, setIsRetraining] = useState(false);
  const safeStats = stats || {
    accuracy: 0,
    total_predictions: 0,
    attacks_caught: 0,
    evasion_caught: 0,
    poisoning_caught: 0,
    uptime_seconds: 0
  };
  const accuracy = safeStats.accuracy * 100;

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      await axios.post('/api/retrain');
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setIsRetraining(false);
    }, 1500);
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="flex flex-col h-full rounded-lg bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d]">
      <div className="p-4 border-b border-slate-200 dark:border-[#30363d] flex justify-between items-center">
        <h2 className="text-base font-semibold flex items-center gap-2 text-slate-900 dark:text-[#c9d1d9]">
          <Activity className="w-5 h-5 text-[#58a6ff]" />
          Model Health
        </h2>
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isRetraining ? 'bg-slate-100 dark:bg-[#21262d] text-slate-400 dark:text-[#484f58] cursor-not-allowed' : 'bg-[#238636] hover:bg-[#2ea043] text-white'}`}
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining...' : 'Retrain Model'}
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center items-center gap-8">
        <div className="relative flex items-center justify-center">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle cx="64" cy="64" r="40" className="stroke-slate-200 dark:stroke-[#30363d]" strokeWidth="8" fill="none" />
            <circle
              cx="64" cy="64" r="40"
              className="stroke-[#58a6ff] transition-all duration-1000 ease-out"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-slate-800 dark:text-[#c9d1d9]">
              {accuracy.toFixed(1)}<span className="text-xl text-slate-500 dark:text-[#8b949e]">%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full mt-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] p-3 rounded-md border border-slate-200 dark:border-[#30363d] flex flex-col items-center">
            <Target className="w-4 h-4 text-[#3fb950] dark:text-[#3fb950] mb-1" />
            <div className="text-xl font-mono font-bold text-slate-800 dark:text-[#c9d1d9]">{safeStats.total_predictions}</div>
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase tracking-wider text-center">Total Served</div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0d1117] p-3 rounded-md border border-slate-200 dark:border-[#30363d] flex flex-col items-center">
            <Shield className="w-4 h-4 text-[#da3633] dark:text-[#da3633] mb-1" />
            <div className="text-xl font-mono font-bold text-slate-800 dark:text-[#c9d1d9]">{safeStats.attacks_caught}</div>
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase tracking-wider text-center">Attacks Caught</div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0d1117] p-3 rounded-md border border-slate-200 dark:border-[#30363d] flex flex-col items-center">
            <AlertOctagon className="w-4 h-4 text-[#d29922] dark:text-[#d29922] mb-1" />
            <div className="text-xl font-mono font-bold text-slate-800 dark:text-[#c9d1d9]">{safeStats.evasion_caught}</div>
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase tracking-wider text-center">Evasion Blocked</div>
          </div>
          <div className="bg-slate-50 dark:bg-[#0d1117] p-3 rounded-md border border-slate-200 dark:border-[#30363d] flex flex-col items-center">
            <Activity className="w-4 h-4 text-[#a371f7] dark:text-[#a371f7] mb-1" />
            <div className="text-xl font-mono font-bold text-slate-800 dark:text-[#c9d1d9]">{safeStats.poisoning_caught}</div>
            <div className="text-[10px] text-slate-500 dark:text-[#8b949e] uppercase tracking-wider text-center">PoisonPrevented</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelHealth;

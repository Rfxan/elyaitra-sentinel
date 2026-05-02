import React, { useMemo } from 'react';

const ThreatGauge = ({ feed }) => {
  const recentAttacksParams = useMemo(() => {
    const now = Date.now() / 1000;
    const recent = feed.filter(f => {
      const eventTime = f.time || (f.timestamp ? new Date(f.timestamp.includes('T') ? f.timestamp : f.timestamp.replace(' ', 'T')).getTime() / 1000 : 0);
      return now - eventTime < 60 && ['attack', 'evasion', 'poisoning', 'fgsm'].includes(f.type?.toLowerCase());
    });
    const count = recent.length;
    
    const maxCount = 100;
    const value = Math.min(count, maxCount);
    const percentage = (value / maxCount) * 100;
    
    let color = "#10b981";
    let label = "SAFE";
    if (count > 8) {
      color = "#ef4444";
      label = "CRITICAL";
    } else if (count > 3) {
      color = "#f59e0b";
      label = "ELEVATED";
    }

    return { count, percentage, color, label };
  }, [feed]);

  const { count, percentage, color, label } = recentAttacksParams;
  const rotation = -90 + (percentage * 1.8);

  return (
    <div className="card p-6 h-full flex flex-col items-center justify-center relative overflow-hidden bg-slate-800">
      <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-6 w-full text-left absolute top-4 left-4">
        Threat Gauge
      </h2>
      
      <div className="relative w-48 h-24 mt-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-48 h-48 rounded-full border-[1.5rem] border-slate-700 box-border border-b-transparent border-l-transparent transform -rotate-45"></div>
        </div>
        
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="w-48 h-48 rounded-full border-[1.5rem] box-border border-b-transparent border-l-transparent transition-transform duration-1000 ease-out"
            style={{ 
              borderColor: `${color} ${color} transparent transparent`,
              transform: `rotate(${-45 + (percentage * 1.8)}deg)`
            }}
          ></div>
        </div>

        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-200 origin-bottom rounded-full transition-transform duration-1000 ease-out shadow-lg"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-slate-200 rounded-full"></div>
        </div>
        
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-slate-800 border-4 border-slate-600 rounded-full z-10"></div>
      </div>
      
      <div className="mt-8 text-center">
        <div className="text-4xl font-bold font-mono tracking-tight transition-colors duration-1000" style={{ color }}>
          {count}
        </div>
        <div className="text-xs text-slate-500 uppercase mt-1">strikes / min</div>
        <div className="mt-2 text-sm font-bold tracking-widest px-3 py-1 rounded bg-slate-900 border border-slate-700 transition-colors duration-1000" style={{ color }}>
          {label}
        </div>
      </div>
    </div>
  );
};

export default ThreatGauge;

import React from 'react';
import ThreatMeter from './ThreatMeter';

const ThreatView = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full animate-fade-in">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
          Threat Intelligence
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Real-time global threat evaluation and adversary attack prevention systems.
        </p>
      </div>
      
      <div className="w-full h-auto min-h-[500px]">
        <ThreatMeter />
      </div>
    </div>
  );
};

export default ThreatView;

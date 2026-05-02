import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

const StatCounter = ({ title, value, icon: Icon, colorClass }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(Math.round(v));
      }
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div className={`p-4 rounded-md border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#0d1117] backdrop-blur-md flex items-center justify-between shadow-sm dark:shadow-lg ${colorClass || ''}`}>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-bold font-mono tracking-tight text-slate-800 dark:text-white">{displayValue}</p>
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-white">
          <Icon className="w-6 h-6 opacity-80" />
        </div>
      )}
    </div>
  );
};

export default StatCounter;

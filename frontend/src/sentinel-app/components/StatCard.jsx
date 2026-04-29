import React, { useEffect, useState } from 'react';

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass }) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated number increment
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const incrementTime = 50;
    const steps = duration / incrementTime;
    const increment = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${gradientClass} transition-opacity duration-500 group-hover:opacity-40`}></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-1">{title}</p>
          <h3 className={`text-3xl font-bold tracking-tight ${colorClass}`}>
            {displayValue.toLocaleString()}
          </h3>
        </div>
        
        <div className={`p-4 rounded-md glass ${colorClass.replace('text-', 'text-glow-')}`}>
          <Icon size={24} className={colorClass} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue }) => {
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
    <GlassCard className="p-5 flex flex-col justify-between group transition-all duration-300 hover:translate-y-[-4px]">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
           <Icon size={20} />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full 
             ${trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trendValue}%
           </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </h3>
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// BUG-9: Updated StatCard to handle real delta trends with +/- prefix and neutral state
const StatCard = ({ title, value, icon: Icon, trendDelta }) => {
  const [displayValue, setDisplayValue] = useState(0);

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

  // Derive trend display from real delta
  const isPositive = trendDelta > 0;
  const isNegative = trendDelta < 0;
  const isNeutral = trendDelta === 0 || trendDelta === undefined;

  return (
    <GlassCard className="p-5 flex flex-col justify-between group transition-all duration-300 hover:translate-y-[-4px]">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Icon size={20} />
        </div>
        {trendDelta !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full
            ${isPositive ? 'bg-green-500/10 text-green-500' : isNegative ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}`}>
            {isPositive ? <TrendingUp size={10} /> : isNegative ? <TrendingDown size={10} /> : <Minus size={10} />}
            {isNeutral ? '—' : `${isPositive ? '+' : ''}${trendDelta}`}
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

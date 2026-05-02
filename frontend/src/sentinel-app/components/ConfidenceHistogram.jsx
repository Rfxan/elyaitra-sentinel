import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 border border-slate-200 dark:border-slate-700/50 rounded-lg shadow-sm">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Confidence: <span className="font-bold text-slate-800 dark:text-white">{label}</span></p>
        <p className="text-lg font-bold text-[#58a6ff] dark:text-[#58a6ff]">
          {payload[0].value} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Predictions</span>
        </p>
      </div>
    );
  }
  return null;
};

const ConfidenceHistogram = ({ data }) => {
  return (
    <div className="w-full h-64 flex flex-col pt-2">
      <div className="flex justify-between items-end mb-4 px-2">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confidence Distribution</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">Based on recent traffic</span>
      </div>
      <div className="flex-1 min-h-0 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#barGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConfidenceHistogram;

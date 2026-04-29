import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import Needle from './Needle';

const Gauge = ({ value }) => {
  // Gauge segments
  const data = [
    { name: 'Safe', value: 30, color: '#22c55e' },    // 0-30 Green
    { name: 'Warning', value: 40, color: '#eab308' }, // 30-70 Yellow
    { name: 'Critical', value: 30, color: '#ef4444' } // 70-100 Red
  ];

  const width = 400;
  const height = 220;
  const cx = width / 2;
  const cy = height - 20; // Move it down since it's a semi-circle
  const innerRadius = 130;
  const outerRadius = 180;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Recharts PieChart for background semi-circle */}
      <div style={{ width, height }} className="relative z-10">
        <PieChart width={width} height={height}>
          <Pie
            data={data}
            cx={cx}
            cy={cy}
            startAngle={180}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        
        {/* Overlay Needle as an absolute precise SVG */}
        <svg 
          width={width} 
          height={height} 
          className="absolute top-0 left-0 pointer-events-none drop-shadow-sm"
        >
          <Needle value={value} cx={cx} cy={cy} radius={outerRadius - 20} />
        </svg>
      </div>

      {/* Value Readout positioned in document flow below the gauge so it never overlaps the needle */}
      <div className="mt-2 flex flex-col items-center justify-center z-20 pointer-events-none">
        <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase mb-1">
          System Risk
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-semibold text-slate-800 dark:text-white tracking-tighter">
            {value}
          </span>
          <span className="text-2xl text-slate-500 font-bold">%</span>
        </div>
      </div>
    </div>
  );
};

export default Gauge;

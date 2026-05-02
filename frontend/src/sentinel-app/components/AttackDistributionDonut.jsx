import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';

const AttackDistributionDonut = ({ data = [] }) => {
  // Process traffic data into distribution
  const counts = data.reduce((acc, curr) => {
    if (curr.type === 'attack') {
      const label = curr.label_name || 'Other';
      acc[label] = (acc[label] || 0) + 1;
    }
    return acc;
  }, {});

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  // Fallback data if no attacks
  const displayData = chartData.length > 0 ? chartData : [
    { name: 'RAG Injection', value: 45 },
    { name: 'Model Extraction', value: 25 },
    { name: 'Evasion', value: 20 },
    { name: 'Recon', value: 10 },
  ];

  const COLORS = ['#22d3ee', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

  return (
    <GlassCard className="p-6 border-white/5 h-[300px]">
       <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Threat Distribution</h3>
       <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
             <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
             </PieChart>
          </ResponsiveContainer>
       </div>
    </GlassCard>
  );
};

export default AttackDistributionDonut;

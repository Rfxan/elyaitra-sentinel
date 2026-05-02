import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AttackTimeline = ({ feed }) => {
  const [data, setData] = useState(Array(10).fill({ time: '', normal: 0, attacks: 0, adv: 0 }));

  useEffect(() => {
    const updateInterval = setInterval(() => {
      const now = Date.now() / 1000;
      const newData = [];
      for(let i = 9; i >= 0; i--) {
        const bucketStart = now - (i * 5) - 5;
        const bucketEnd = now - (i * 5);
        
        const eventsInBucket = feed.filter(f => f.time >= bucketStart && f.time < bucketEnd);
        
        let normal = 0, attacks = 0, adv = 0;
        eventsInBucket.forEach(e => {
          const type = e.type.toLowerCase();
          if (type === 'normal') normal++;
          else if (type === 'attack') attacks++;
          else if (type === 'evasion' || type === 'poisoning') adv++;
        });

        const d = new Date(Math.floor(bucketEnd) * 1000);
        newData.push({
          time: `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
          normal,
          attacks,
          adv
        });
      }
      setData(newData);
    }, 5000);

    return () => clearInterval(updateInterval);
  }, [feed]);

  return (
    <div className="card flex flex-col h-full bg-slate-900 border-slate-700">
      <div className="p-4 flex items-center justify-between z-10 relative border-b border-slate-800">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Traffic Volume (5s Window)
        </h2>
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Normal</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Attack</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Adv</div>
        </div>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAdv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide={true} />
            <YAxis hide={true} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Area type="monotone" dataKey="normal" stroke="#10b981" fillOpacity={1} fill="url(#colorNormal)" strokeWidth={2} />
            <Area type="monotone" dataKey="attacks" stroke="#ef4444" fillOpacity={1} fill="url(#colorAttacks)" strokeWidth={2} />
            <Area type="monotone" dataKey="adv" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAdv)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttackTimeline;

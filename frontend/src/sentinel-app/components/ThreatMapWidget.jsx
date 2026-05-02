import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Map, Ghost } from 'lucide-react';

const ThreatMapWidget = () => {
  // Simple stylized world map points
  const points = [
    { name: 'US-East', x: '20%', y: '35%', intensity: 'high' },
    { name: 'Europe', x: '50%', y: '30%', intensity: 'medium' },
    { name: 'East-Asia', x: '85%', y: '40%', intensity: 'critical' },
    { name: 'Australia', x: '88%', y: '80%', intensity: 'low' },
    { name: 'South-America', x: '30%', y: '75%', intensity: 'medium' },
  ];

  return (
    <GlassCard className="p-6 border-white/5 h-full relative overflow-hidden bg-black/40">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
             <Map size={14} className="text-primary" />
             Global Threat Origins
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Live Trace Active</span>
          </div>
       </div>

       {/* Stylized SVG Map Placeholder */}
       <div className="relative w-full aspect-video border border-white/5 bg-slate-900/50 rounded-xl overflow-hidden group">
          <svg viewBox="0 0 1000 500" className="w-full h-full opacity-20 transition-opacity group-hover:opacity-30">
            <path 
              d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150 T650,150 T750,150 T850,150 T950,150" 
              stroke="white" fill="none" strokeWidth="0.5" strokeDasharray="5,5" 
            />
            {/* Very rough world continent shapes */}
            <path d="M50,100 L250,100 L300,250 L200,450 L50,300 Z" fill="white" opacity="0.1" /> {/* Americas */}
            <path d="M450,80 L600,80 L650,300 L450,400 Z" fill="white" opacity="0.1" /> {/* Africa/Europe */}
            <path d="M700,50 L950,50 L950,300 L700,450 Z" fill="white" opacity="0.1" /> {/* Eurasia */}
          </svg>

          {/* Pulse Points */}
          {points.map((p, i) => (
             <div 
               key={i}
               className="absolute"
               style={{ left: p.x, top: p.y }}
             >
                <div className={`w-3 h-3 rounded-full relative ${
                  p.intensity === 'critical' ? 'bg-red-500' : p.intensity === 'high' ? 'bg-orange-500' : 'bg-primary'
                }`}>
                   <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                     p.intensity === 'critical' ? 'bg-red-500' : p.intensity === 'high' ? 'bg-orange-500' : 'bg-primary'
                   }`} />
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-white font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                   {p.name}
                </div>
             </div>
          ))}
       </div>

       <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Primary Vector</span>
             <span className="text-white text-xs font-bold font-mono">194.31.22.102 [CN]</span>
          </div>
          <Ghost size={24} className="text-white/5" />
       </div>
    </GlassCard>
  );
};

export default ThreatMapWidget;

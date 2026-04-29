import React, { useMemo, useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

// SentinelML Node Details
const DEFENDER_LAT = 12.97;
const DEFENDER_LNG = 77.59;

// Calculate X and Y percentages based on Equirectangular projection
const getPosition = (lat, lng) => {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 100;
  return { x, y };
};

const SEVERITY_COLORS = {
  attack: '#ef4444',   // Red
  evasion: '#eab308',  // Yellow
  poison: '#a855f7',   // Purple
  normal: '#22c55e',   // Green
};

const getEventColor = (type) => {
  const t = type?.toLowerCase() || 'normal';
  return SEVERITY_COLORS[t] || SEVERITY_COLORS.normal;
};

const WorldMap = ({ trafficFeed = [] }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Limit to last 50 events for performance
  const recentEvents = useMemo(() => {
    return [...trafficFeed].slice(0, 50).filter(e => e.geo && e.geo.lat && e.geo.lng);
  }, [trafficFeed]);

  // Cluster Detection: Check for High Activity Regions
  const clusters = useMemo(() => {
    const regions = {};
    recentEvents.forEach(e => {
      // Group by roughly 5 degrees lat/lng resolution
      const rx = Math.round(e.geo.lat / 5) * 5;
      const ry = Math.round(e.geo.lng / 5) * 5;
      const key = `${rx},${ry}`;
      if (!regions[key]) regions[key] = { count: 0, lat: e.geo.lat, lng: e.geo.lng };
      regions[key].count += 1;
    });

    return Object.values(regions).filter(r => r.count > 5);
  }, [recentEvents]);

  const defenderPos = getPosition(DEFENDER_LAT, DEFENDER_LNG);

  if (!mounted) return null;

  return (
    <div className="glass-card p-6 flex flex-col relative overflow-hidden" style={{ minHeight: '550px' }}>
      <div className="flex items-center justify-between mb-4 z-10">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Global Threat Map
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time attack trajectories and geo-distribution
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div>Attack</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>Evasion</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Poisoning</div>
        </div>
      </div>

      <div className="relative flex-1 w-full mt-2 rounded-md border border-white/10 overflow-hidden bg-[#050510]">
        {/* Abstract World Map Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')",
            backgroundSize: '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            filter: 'invert(1) sepia(1) hue-rotate(180deg) saturate(3) opacity(0.5)'
          }}
        />

        {/* Drawing Canvas for SVGs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Lines */}
          {recentEvents.map((evt, i) => {
            if (evt.type === 'normal') return null;
            const attackerPos = getPosition(evt.geo.lat, evt.geo.lng);
            const color = getEventColor(evt.type);
            
            // Adjust to viewBox logic: SVG uses 100% coordinates
            return (
              <line
                key={`line-${evt.id || i}`}
                x1={`${attackerPos.x}%`}
                y1={`${attackerPos.y}%`}
                x2={`${defenderPos.x}%`}
                y2={`${defenderPos.y}%`}
                className={`map-line ${evt.type}`}
                strokeWidth="1.5"
                opacity={0.6 - (i * 0.01)} // Fade older lines
              />
            );
          })}

          {/* Defender Base */}
          <circle 
            cx={`${defenderPos.x}%`} 
            cy={`${defenderPos.y}%`} 
            r="6" 
            fill="#3b82f6" 
            className="animate-pulse"
          />
          <circle 
            cx={`${defenderPos.x}%`} 
            cy={`${defenderPos.y}%`} 
            r="15" 
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            className="animate-pulse-slow"
          />

          {/* Attack Event Nodes */}
          {recentEvents.map((evt, i) => {
            if (evt.type === 'normal') return null;
            const attackerPos = getPosition(evt.geo.lat, evt.geo.lng);
            const color = getEventColor(evt.type);
            const isNew = i < 5; // First 5 are highly vibrant

            return (
              <g key={`node-${evt.id || i}`} opacity={1 - (i * 0.015)}>
                <circle 
                  cx={`${attackerPos.x}%`} 
                  cy={`${attackerPos.y}%`} 
                  r={isNew ? "4" : "2"} 
                  fill={color} 
                />
                {isNew && (
                  <circle 
                    cx={`${attackerPos.x}%`} 
                    cy={`${attackerPos.y}%`} 
                    r="12" 
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    style={{ animation: 'map-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Global Cluster Alerts Overlay */}
        {clusters.map((c, i) => {
          const pos = getPosition(c.lat, c.lng);
          return (
            <div 
              key={`alert-${i}`}
              className="absolute z-20 flex flex-col items-center animate-fade-in pointer-events-none"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -100%)' }}
            >
              <div className="bg-[#da3633]/15 border border-red-500/50 backdrop-blur-sm text-red-100 text-[10px] px-2 py-1 rounded shadow-sm flex items-center gap-1 whitespace-nowrap mb-1">
                <ShieldAlert size={10} className="text-[#da3633]" />
                HIGH ACTIVITY DETECTED
              </div>
              <div className="w-px h-6 bg-gradient-to-b from-red-500 to-transparent"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;

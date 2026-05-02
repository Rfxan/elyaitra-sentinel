import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { motion } from 'framer-motion';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

const ThreatMap = ({ attackerProfiles }) => {
  // Static IP to Geo mapping for demo purposes
  const getCoordinates = (ip) => {
    if (ip.startsWith("185.220.")) return [10.45, 51.16]; // Germany
    if (ip.startsWith("45.33.")) return [-77.03, 38.89]; // USA (DC)
    if (ip.startsWith("103.21.")) return [139.69, 35.68]; // Japan
    if (ip.startsWith("181.65.")) return [-46.63, -23.55]; // Brazil
    if (ip.startsWith("77.88.")) return [37.61, 55.75]; // Russia
    if (ip.startsWith("13.233.")) return [72.87, 19.07]; // India
    if (ip.startsWith("41.203.")) return [36.82, -1.29]; // Kenya
    return [0, 0];
  };

  const markers = useMemo(() => {
    return attackerProfiles.map(p => ({
      ip: p.ip,
      coordinates: getCoordinates(p.ip),
      isBlocked: p.is_blocked,
      strikes: p.total_strikes
    })).filter(m => m.coordinates[0] !== 0);
  }, [attackerProfiles]);

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-[400px] relative overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#c9d1d9]">Live Threat Origins</h3>
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-widest">
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-orange-400">Monitoring</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-red-500" />
             <span className="text-[#da3633]">Blocked</span>
           </div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center bg-slate-900/20 rounded-md overflow-hidden border border-white/5">
        <ComposableMap
          projectionConfig={{
            rotate: [-10, 0, 0],
            scale: 147
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "rgba(255,255,255,0.05)", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map(({ ip, coordinates, isBlocked, strikes }) => (
            <Marker key={ip} coordinates={coordinates}>
              <circle
                r={isBlocked ? 4 : 3}
                fill={isBlocked ? "#ef4444" : "#f97316"}
                stroke="#fff"
                strokeWidth={0.5}
                className={!isBlocked ? "animate-pulse" : ""}
              />
              <text
                textAnchor="middle"
                y={-10}
                style={{ fontFamily: "monospace", fill: isBlocked ? "#ef4444" : "#f97316", fontSize: "8px", fontWeight: "bold" }}
              >
                {isBlocked ? "⛔" : "⚡"} {ip.split('.').slice(-2).join('.')}
              </text>
            </Marker>
          ))}
        </ComposableMap>
      </div>
      
      <div className="absolute bottom-4 left-6 text-[9px] text-slate-500 italic">
        Geospatial approximation via threat-range lookup table
      </div>
    </div>
  );
};

export default ThreatMap;

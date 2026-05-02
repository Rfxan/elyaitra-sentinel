import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, AlertOctagon, Zap } from 'lucide-react';

const MapDot = ({ ip, data, isNew }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Convert lat/lon to X/Y based on a 1000x500 viewbox (Equirectangular)
  const x = (data.lon + 180) * (1000 / 360);
  const y = (90 - data.lat) * (500 / 180);

  return (
    <div 
      className="absolute"
      style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 500) * 100}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative flex items-center justify-center cursor-pointer -ml-1.5 -mt-1.5"
      >
        {isNew && (
          <motion.div
            animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-red-500 rounded-full"
          />
        )}
        <div className={`w-3 h-3 rounded-full border border-black ${isNew ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-red-400 shadow-[0_0_5px_#ef4444]'}`} />
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 shadow-sm rounded-md p-3 flex flex-col gap-2 pointer-events-none"
          >
            <div className="flex items-center gap-2 border-b border-slate-700 pb-2">
              <AlertOctagon size={14} className="text-[#da3633]" />
              <span className="font-mono text-xs font-bold text-white">{ip}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Target size={12} className="text-slate-500" />
              <span>{data.country || 'Unknown'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BlockMap = ({ blockedIPs, geoDataMap, newlyBlocked }) => {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#1A1F2B] overflow-hidden flex items-center justify-center rounded-md border border-white/10 p-4">
      {/* Background SVG map (Wikipedia blank world map) */}
      <div 
        className="absolute inset-0 opacity-10 bg-no-repeat bg-center bg-contain"
        style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')` }}
      />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Map Dots Container (constrained to map aspect ratio) */}
      <div className="relative w-full max-w-4xl aspect-[2/1] z-10">
        {blockedIPs.map(b => (
          geoDataMap[b.ip] && (
            <MapDot 
              key={b.ip} 
              ip={b.ip} 
              data={geoDataMap[b.ip]} 
              isNew={newlyBlocked.has(b.ip)}
            />
          )
        ))}
      </div>
      
      <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-500 tracking-widest flex items-center gap-2">
        <Zap size={12} className="text-slate-400" />
        GLOBAL THREAT ORIGIN TRACKER
      </div>
    </div>
  );
};

export default BlockMap;

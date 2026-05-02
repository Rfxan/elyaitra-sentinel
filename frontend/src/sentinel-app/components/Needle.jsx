import React from 'react';
import { motion } from 'framer-motion';

const Needle = ({ value, cx, cy, radius }) => {
  // Map value (0-100) to angle (-180 to 0) or rather (0 to 180) based on rotation
  // Assuming a semi-circle from left (0) to right (180deg) for the gauge
  // Wait, if it's pointing left it's -90, if pointing right it's 90, if we rotate from center.
  // Standard SVG rotation: 0 is pointing UP. Left is -90, Right is +90.
  // We want value 0 to point left, value 100 to point right.
  // So angle = map(value, 0, 100, -90, 90)
  
  const angle = (value / 100) * 180 - 90;

  // The needle geometry
  return (
    <>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <motion.g
        initial={{ rotate: -90 }}
        animate={{ rotate: angle }}
        transition={{ 
          type: "spring", 
          stiffness: 60, 
          damping: 15, 
          mass: 1 
        }}
        style={{ originX: `${cx}px`, originY: `${cy}px` }}
      >
        <circle cx={cx} cy={cy} r={12} className="fill-slate-900 dark:fill-slate-700" />
        <circle cx={cx} cy={cy} r={6} className="fill-slate-500 dark:fill-slate-300" />
        
        {/* Main Needle Body */}
        <path
          d={`M ${cx - 6} ${cy} L ${cx} ${cy - radius + 20} L ${cx + 6} ${cy} Z`}
          className="fill-slate-700 dark:fill-slate-300"
        />
        
        {/* Optional glow layer */}
        <path
          d={`M ${cx - 2} ${cy} L ${cx} ${cy - radius + 22} L ${cx + 2} ${cy} Z`}
          fill={value > 70 ? "#ef4444" : value > 30 ? "#eab308" : "#22c55e"}
          filter="url(#glow)"
        />
      </motion.g>
    </>
  );
};

export default Needle;

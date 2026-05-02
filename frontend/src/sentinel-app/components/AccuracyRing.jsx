import React from 'react';
import { motion } from 'framer-motion';

const AccuracyRing = ({ accuracy }) => {
  const radius = 90;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  let gradientColors = { start: '#ef4444', end: '#b91c1c' }; // Red
  let glowColor = 'rgba(239, 68, 68, 0.4)';
  if (accuracy >= 90) {
    gradientColors = { start: '#10b981', end: '#047857' }; // Green
    glowColor = 'rgba(16, 185, 129, 0.4)';
  } else if (accuracy >= 75) {
    gradientColors = { start: '#f59e0b', end: '#b45309' }; // Yellow
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-2xl z-0 transition-colors duration-700"
        style={{
          backgroundColor: glowColor,
          opacity: accuracy > 90 ? 0.6 : 0.3,
          transform: 'scale(0.8)'
        }}
      />
      
      <svg className="transform -rotate-90 w-56 h-56 z-10" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors.start} className="transition-colors duration-700" />
            <stop offset="100%" stopColor={gradientColors.end} className="transition-colors duration-700" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          className="stroke-slate-200 dark:stroke-slate-800 transition-colors duration-300"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#accuracyGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#glow)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl font-bold text-slate-800 dark:text-white tracking-tighter drop-shadow-sm"
        >
          {accuracy.toFixed(1)}<span className="text-2xl text-slate-500 dark:text-slate-400">%</span>
        </motion.span>
        <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Current Accuracy
        </span>
      </div>
    </div>
  );
};

export default AccuracyRing;

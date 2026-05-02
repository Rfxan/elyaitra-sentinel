import React, { useMemo } from 'react';
import { Activity, ShieldAlert, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';
import Gauge from './Gauge';
import StatCounter from './StatCounter';
import { useThreatStats } from '../hooks/useThreatStats';

const ThreatMeter = () => {
  const { threatScore, totalRequests, attacksBlocked, adversarialAttempts } = useThreatStats();

  const isCritical = threatScore > 70;
  const isWarning = threatScore > 30 && threatScore <= 70;

  // Pulse animation variants for the container glow
  const glowVariants = {
    safe: {
      boxShadow: '0px 0px 40px -10px rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(255,255,255,0.05)'
    },
    warning: {
      boxShadow: '0px 0px 60px -10px rgba(234, 179, 8, 0.3)',
      borderColor: 'rgba(234, 179, 8, 0.2)'
    },
    critical: {
      boxShadow: [
        '0px 0px 80px -10px rgba(239, 68, 68, 0.4)',
        '0px 0px 120px -10px rgba(239, 68, 68, 0.8)',
        '0px 0px 80px -10px rgba(239, 68, 68, 0.4)'
      ],
      borderColor: 'rgba(239, 68, 68, 0.5)',
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const currentVariant = isCritical ? 'critical' : isWarning ? 'warning' : 'safe';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full relative rounded-md overflow-hidden glass-card"
    >
      <motion.div
        variants={glowVariants}
        animate={currentVariant}
        className="w-full h-full p-8 border border-slate-200 dark:border-[#30363d] rounded-md bg-white/80 dark:bg-slate-900/40 backdrop-blur-md relative z-10 flex flex-col items-center shadow-lg dark:shadow-none"
      >
        {/* Glow backdrop behind the gauge */}
        {isCritical && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#da3633]/15  rounded-full pointer-events-none" />
        )}
        
        <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide border-b border-slate-200 dark:border-[#30363d] pb-4 w-full text-center mb-6">
          Global Threat Monitor
        </h2>

        {/* Central Radial Gauge */}
        <div className="mb-16 w-full flex justify-center scale-110 sm:scale-100">
          <Gauge value={threatScore} />
        </div>

        {/* 3 Stat Counters Row */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto z-20">
          <StatCounter
            title="Total Requests"
            value={totalRequests}
            icon={Activity}
            colorClass="hover:border-[#388bfd]/40 transition-colors"
          />
          <StatCounter
            title="Attacks Blocked"
            value={attacksBlocked}
            icon={Wifi}
            colorClass="hover:border-[#da3633]/40 transition-colors"
          />
          <StatCounter
            title="Adversarial Attempts Caught"
            value={adversarialAttempts}
            icon={ShieldAlert}
            colorClass="hover:border-[#8957e5]/40 transition-colors"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThreatMeter;

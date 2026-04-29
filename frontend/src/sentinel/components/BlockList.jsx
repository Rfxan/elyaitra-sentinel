import React from 'react';
import ThreatCard from './ThreatCard';
import BlockMap from './BlockMap';
import { ShieldX, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BlockList = ({ blockedIPs = [], sentinelBaseUrl }) => {
  // We'll manage geo data locally here or just display the list
  const newlyBlocked = new Set(); // Simplified for now

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
            <ShieldX size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Blocked Threats</h1>
            <p className="text-slate-400 text-sm">IPs actively contained and verified by neural network.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#1A1F2B] border border-white/10 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-white">{blockedIPs.length} Active Blocks</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Left Column: Cards */}
        <div className="flex flex-col bg-[#1A1F2B] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-200">Mitigated Sources</h3>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <AnimatePresence>
              {blockedIPs.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-10 text-center"
                >
                  <ShieldX className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-slate-400 font-medium">No IPs currently blocked.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  {blockedIPs.map(b => (
                    <ThreatCard
                      key={b.ip}
                      ipData={b}
                      isNew={false}
                      sentinelBaseUrl={sentinelBaseUrl}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: World Map */}
        <div className="flex flex-col">
          <BlockMap
            blockedIPs={blockedIPs}
            geoDataMap={{}} // Simplified for now
            newlyBlocked={newlyBlocked}
          />
        </div>
      </div>
    </div>
  );
};

export default BlockList;

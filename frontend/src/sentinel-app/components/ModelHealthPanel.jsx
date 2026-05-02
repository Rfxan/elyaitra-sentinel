import React from 'react';
import { RefreshCw, Activity, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModelHealth } from '../hooks/useModelHealth';
import AccuracyRing from './AccuracyRing';
import ConfidenceHistogram from './ConfidenceHistogram';

const RetrainingOverlay = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-[#1A1F2B]/80 backdrop-blur-sm rounded-md"
  >
    <div className="relative">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-indigo-500 blur-xl"
      />
      <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-md border border-slate-200 dark:border-slate-700">
        <RefreshCw className="w-10 h-10 text-[#58a6ff] dark:text-[#58a6ff] animate-spin" />
      </div>
    </div>
    <h3 className="mt-6 text-xl font-bold text-slate-800 dark:text-white tracking-wide">Retraining API...</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Updating neural network weights</p>
  </motion.div>
);

const ModelHealthPanel = () => {
  const { 
    accuracy, 
    previousAccuracy, 
    histogramData, 
    isRetraining, 
    triggerRetrain,
    lastTrained 
  } = useModelHealth();

  const diff = accuracy - previousAccuracy;
  const hasImproved = diff > 0;
  const hasDecreased = diff < 0;

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col glass-card rounded-md p-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white tracking-tight">
            <Activity className="w-6 h-6 text-[#58a6ff]" />
            Model Intelligence
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last trained: {new Date(lastTrained).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={triggerRetrain}
          disabled={isRetraining}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 shadow-lg ${
             isRetraining 
               ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed shadow-none' 
               : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white hover:shadow-indigo-500/25 active:scale-95'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Configuring...' : 'Retrain Model'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* LEFT COLUMN: Ring & Comparison */}
        <div className="flex flex-col items-center justify-center p-4">
          <AccuracyRing accuracy={accuracy} />
          
          <div className="mt-8 h-12 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {previousAccuracy > 0 && Math.abs(diff) > 0.01 && (
                <motion.div
                  key={`${accuracy}-${previousAccuracy}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700/50"
                >
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Was {previousAccuracy.toFixed(1)}%
                  </span>
                  
                  {hasImproved ? (
                    <ArrowUpRight className="w-4 h-4 text-[#3fb950]" />
                  ) : hasDecreased ? (
                    <ArrowDownRight className="w-4 h-4 text-[#da3633]" />
                  ) : (
                    <span className="w-4 h-4 text-slate-400 text-center text-xs font-bold">→</span>
                  )}

                  <span className={`text-sm font-bold ${hasImproved ? 'text-[#3fb950] dark:text-[#3fb950]' : hasDecreased ? 'text-[#da3633] dark:text-[#da3633]' : 'text-slate-700 dark:text-[#c9d1d9]'}`}>
                    Now {accuracy.toFixed(1)}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Histogram */}
        <div className="h-full flex flex-col justify-center">
          <ConfidenceHistogram data={histogramData} />
        </div>

      </div>

      {/* Retraining Overlay */}
      <AnimatePresence>
        {isRetraining && <RetrainingOverlay />}
      </AnimatePresence>
    </div>
  );
};

export default ModelHealthPanel;

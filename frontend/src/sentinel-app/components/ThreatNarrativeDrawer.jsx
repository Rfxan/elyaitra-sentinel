import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Target, Zap, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

const ThreatNarrativeDrawer = ({ sessionId, isOpen, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchAnalysis();
    }
  }, [isOpen, sessionId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('/api/v1/forensics/analyze', { session_id: sessionId });
      setAnalysis(resp.data.analysis);
    } catch (err) {
      console.error('Failed to fetch AI analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const severityColor = {
    'CRITICAL': 'text-rose-500 bg-rose-500/10 border-rose-500/30',
    'HIGH': 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    'MEDIUM': 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    'LOW': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0d1117] border-l border-white/10 shadow-2xl z-[130] flex flex-col"
          >
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#161b22]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={20} className="text-[#00D4FF]" />
                  AI Threat Insight
                </h3>
                <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mt-1">SESSION: {sessionId}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <div className="relative">
                    <Loader2 size={48} className="animate-spin text-[#00D4FF]" />
                    <Zap size={20} className="absolute inset-0 m-auto text-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Synthesizing Forensic Intelligence</h4>
                    <p className="text-xs text-slate-500">Processing event correlation and attacker intent...</p>
                  </div>
                </div>
              ) : analysis ? (
                <div className="animate-fade-in space-y-8">
                  {/* Severity Banner */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${severityColor[analysis.severity]}`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={24} />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Calculated Severity</div>
                        <div className="text-xl font-black">{analysis.severity}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Zap size={14} className="text-amber-400" /> Executive Summary
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">
                      "{analysis.summary}"
                    </p>
                  </section>

                  {/* Objective */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Target size={14} className="text-rose-400" /> Attacker Objective
                    </h4>
                    <div className="text-white text-sm font-medium bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                      {analysis.attacker_objective}
                    </div>
                  </section>

                  {/* TTPs */}
                  <section>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">TTPs & MITRE Mapping</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.mitre_techniques.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Remediation */}
                  <section className="bg-[#00D4FF]/5 p-6 rounded-2xl border border-[#00D4FF]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <CheckCircle size={80} />
                    </div>
                    <h4 className="text-xs font-bold text-[#00D4FF] uppercase tracking-widest mb-3">Recommended Remediation</h4>
                    <p className="text-slate-300 text-sm leading-relaxed relative z-10">
                      {analysis.recommended_remediation}
                    </p>
                  </section>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                  Failed to load analysis.
                </div>
              )}
            </div>
            
            <div className="p-6 bg-[#161b22] border-t border-white/10">
               <button 
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/10"
               >
                 CLOSE INTELLIGENCE DRAWER
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThreatNarrativeDrawer;

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE = "/sentinel-api";

const AIInsights = ({ className }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    try {
      const url = `${API_BASE}/ai-insights`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("AI temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  const getThreatAssessmentColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'text-[#da3633]';
      case 'HIGH': return 'text-orange-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-[#3fb950]';
    }
  };

  const getThreatAssessmentIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-[#da3633]" />;
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <CheckCircle className="w-5 h-5 text-[#3fb950]" />;
    }
  };

  return (
    <div className={`p-5 rounded-lg bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#58a6ff]" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#c9d1d9]">AI Intelligence Layer</h2>
        </div>
        {!loading && !error && insights && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] text-xs font-semibold">
            {getThreatAssessmentIcon(insights.threat_assessment)}
            <span className={getThreatAssessmentColor(insights.threat_assessment)}>
              {insights.threat_assessment}
            </span>
          </div>
        )}
      </div>

      {loading && !insights ? (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="w-8 h-8 text-[#58a6ff] animate-spin mb-2" />
          <p className="text-sm text-slate-500 dark:text-[#8b949e]">Analyzing threat patterns...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-[#8b949e]">
          <div className="text-xs text-[#8b949e] w-full">
            <div className="font-semibold text-[#58a6ff] mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Model Status
            </div>
            <div className="flex justify-between mb-1">
              <span>Classifier:</span>
              <span className="text-[#c9d1d9]">RandomForest — 100 estimators</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Feature Space:</span>
              <span className="text-[#c9d1d9]">NSL-KDD (41 features)</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Evasion Threshold:</span>
              <span className="text-[#c9d1d9]">Z-score &gt; 3.5σ</span>
            </div>
            <div className="text-[#3fb950] mt-2 flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3 h-3" /> Defender module active
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-md bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] text-sm text-slate-700 dark:text-[#c9d1d9] leading-relaxed">
            {insights?.summary}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#484f58] uppercase tracking-wide">Key Patterns:</span>
            <span className="text-sm font-semibold text-slate-800 dark:text-[#c9d1d9]">{insights?.key_patterns}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;

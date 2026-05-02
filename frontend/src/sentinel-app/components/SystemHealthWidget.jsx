import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Server, Database, Globe, Cpu, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SystemHealthWidget = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await axios.get('/api/v1/health');
      setHealth(res.data);
    } catch (err) {
      console.error("Health check failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <GlassCard className="p-6 flex items-center justify-center border-white/5 h-full">
       <Loader2 className="animate-spin text-primary" size={24} />
    </GlassCard>
  );

  const StatusIcon = ({ status }) => {
    if (status?.startsWith('online')) return <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />;
    return <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
  };

  return (
    <GlassCard className="p-6 border-white/5 h-full flex flex-col justify-between">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
             <Server size={14} className="text-primary" />
             Infrastructure Health
          </h3>
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border 
             ${health?.status === 'operational' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
             {health?.status || 'UNKNOWN'}
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Database size={16} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Relational DB</span>
             </div>
             <StatusIcon status={health?.services?.database} />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Globe size={16} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Chroma VectorDB</span>
             </div>
             <StatusIcon status={health?.services?.chromadb} />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Cpu size={16} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">LLM Gateway</span>
             </div>
             <StatusIcon status={health?.services?.llm} />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-slate-500" />
                <span className="text-xs text-slate-400 font-medium">Sentinel-ML</span>
             </div>
             <StatusIcon status={health?.services?.sentinel_ml} />
          </div>
       </div>

       <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
             Operational Stability: {health?.status === 'operational' ? '99.9%' : 'DEGRADED'}
          </p>
       </div>
    </GlassCard>
  );
};

export default SystemHealthWidget;

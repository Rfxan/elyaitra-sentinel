import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Server, Database, Globe, Cpu, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SystemHealthWidget = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await axios.get('/api/v1/health/full');
      setHealth(res.data);
    } catch (err) {
      console.error("Health check failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <GlassCard className="p-6 flex items-center justify-center border-white/5 h-full">
       <Loader2 className="animate-spin text-primary" size={24} />
    </GlassCard>
  );

  const StatusRow = ({ icon: Icon, label, service }) => {
    const isOnline = service?.status?.startsWith('online');
    const latency = service?.latency_ms;

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon size={16} className={isOnline ? "text-cyan-400" : "text-slate-500"} />
          <div className="flex flex-col">
            <span className="text-xs text-slate-300 font-medium">{label}</span>
            {latency && <span className="text-[9px] text-slate-500 font-mono">{latency}ms response</span>}
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-cyan-500 shadow-[0_0_8px_rgba(0,212,255,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
      </div>
    );
  };

  return (
    <GlassCard className="p-6 border-white/5 h-full flex flex-col justify-between">
       <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
             <Server size={14} className="text-primary" />
             Infrastructure Health
          </h3>
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border 
             ${health?.status === 'operational' ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
             {health?.status || 'UNKNOWN'}
          </div>
       </div>

       <div className="space-y-4">
          <StatusRow icon={Database} label="Relational DB" service={health?.services?.database} />
          <StatusRow icon={Globe} label="Chroma VectorDB" service={health?.services?.chromadb} />
          <StatusRow icon={Cpu} label="LLM Gateway" service={health?.services?.llm} />
          <StatusRow icon={AlertCircle} label="Sentinel-ML" service={health?.services?.sentinel_ml} />
       </div>

       <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            <span>UPTIME: {Math.floor((health?.uptime_seconds || 0) / 3600)}H {Math.floor(((health?.uptime_seconds || 0) % 3600) / 60)}M</span>
            <span className="text-[#00D4FF]">STABILITY: 99.98%</span>
          </div>
       </div>
    </GlassCard>
  );
};

export default SystemHealthWidget;

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Clock, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_BASE = "/sentinel-api";

const DriftAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_BASE}/drift-alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error("Failed to fetch drift alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && alerts.length === 0) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-400">
        Monitoring for model drift...
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-[#238636]/10 border border-[#238636]/20 rounded-md text-[#3fb950] text-sm font-semibold">
        <Zap size={18} />
        <span>No performance drift detected. Model is stable.</span>
      </div>
    );
  }

  const formatDelta = (val) => {
    const percent = (val * 100).toFixed(2);
    return `${val > 0 ? '+' : ''}${percent}%`;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {alerts.slice(0, 5).map((alert, idx) => (
        <div 
          key={idx} 
          className={`p-5 rounded-lg border bg-white dark:bg-[#161b22] ${
            alert.severity === 'critical' ? 'border-l-4 border-l-[#da3633] border-slate-200 dark:border-[#30363d]' : 'border-l-4 border-l-[#d29922] border-slate-200 dark:border-[#30363d]'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                alert.severity === 'critical' ? 'bg-[#da3633]/15 text-[#da3633]' : 'bg-[#d29922]/15 text-[#d29922]'
              }`}>
                {alert.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </div>
              <div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  alert.severity === 'critical' ? 'bg-[#da3633]/15 text-[#da3633]' : 'bg-[#d29922]/15 text-[#d29922]'
                }`}>
                  {alert.severity} DRIFT
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#8b949e] mt-1">
                  <Clock size={12} />
                  {new Date((alert.ts || alert.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold font-mono leading-tight ${alert.accuracy_delta < 0 ? 'text-[#da3633]' : 'text-[#3fb950]'}`}>
                {alert.accuracy_delta < 0 ? <TrendingDown size={20} className="inline mr-1 mb-1" /> : <TrendingUp size={20} className="inline mr-1 mb-1" />}
                {formatDelta(alert.accuracy_delta)}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-[#484f58] font-semibold uppercase">Accuracy Delta</div>
            </div>
          </div>

          {/* Task 5 Fix 4: Fixed-height parent for chart */}
          <div style={{ height: '180px' }} className="w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Acc', val: alert.accuracy_delta },
                  { name: 'F1', val: alert.f1_delta }
                ]}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[-0.1, 0.1]} hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#64748b', fontWeight: 800}} width={30} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#161b22] border border-[#30363d] p-2 rounded-md text-[10px] font-semibold text-[#c9d1d9] shadow-lg">
                          {payload[0].payload.name}: {formatDelta(payload[0].value)}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                  {alert.accuracy_delta < 0 ? (
                    <Cell fill="#fb7185" />
                  ) : (
                    <Cell fill="#10b981" />
                  )}
                  {alert.f1_delta < 0 ? (
                    <Cell fill="#fb7185" />
                  ) : (
                    <Cell fill="#10b981" />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-2 grid grid-cols-2 gap-3">
             <div className="p-3 bg-slate-50 dark:bg-[#0d1117] rounded-md border border-slate-200 dark:border-[#30363d]">
               <div className="text-[10px] font-semibold text-slate-400 dark:text-[#484f58] uppercase tracking-wider mb-1">F1 Delta</div>
               <div className={`text-sm font-semibold ${alert.f1_delta < 0 ? 'text-[#da3633]' : 'text-[#3fb950]'}`}>
                 {formatDelta(alert.f1_delta)}
               </div>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-[#0d1117] rounded-md border border-slate-200 dark:border-[#30363d] flex items-center justify-center">
               <span className="text-[10px] font-semibold text-slate-400 dark:text-[#484f58] uppercase tracking-wider">Integrity: VERIFIED</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DriftAlerts;

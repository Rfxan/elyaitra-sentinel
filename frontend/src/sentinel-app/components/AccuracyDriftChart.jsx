import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Activity, TrendingUp, Info } from 'lucide-react';

const API_BASE = "/sentinel-api";

const AccuracyDriftChart = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/model-history`);
      if (res.data && Array.isArray(res.data)) {
        setHistory(res.data.map(item => ({
          ...item,
          timeStr: new Date(item.ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        })));
      }
    } catch (err) {
      console.error("Failed to fetch model history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && history.length === 0) return (
    <div className="h-[400px] w-full bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg flex items-center justify-center text-slate-400 dark:text-[#484f58] font-semibold animate-pulse">
      Loading History...
    </div>
  );

  if (history.length === 0) return (
    <div className="h-[400px] w-full bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg flex flex-col items-center justify-center gap-4">
      <div className="p-4 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-md text-slate-300 dark:text-[#484f58]">
        <Activity size={32} />
      </div>
      <p className="text-slate-500 font-bold">Train or retrain the model to see accuracy history.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#58a6ff]/10 text-[#58a6ff] rounded-md">
             <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#c9d1d9]">Model Accuracy Drift</h3>
            <p className="text-slate-500 dark:text-[#8b949e] text-xs">Live accuracy and F1 score history across retrains.</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] rounded-md flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
           <span className="text-[10px] font-semibold text-slate-400 dark:text-[#484f58] uppercase tracking-wider">Accuracy Monitoring: Active</span>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
            <XAxis 
              dataKey="timeStr" 
              stroke="var(--chart-text)" 
              fontSize={10} 
              tickMargin={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="var(--chart-text)" 
              fontSize={10} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              itemStyle={{ fontWeight: 'black' }}
            />
            <Legend />
            {history.map((entry, idx) => (
              entry.event === 'train' && (
                <ReferenceLine 
                  key={`ref-${idx}`} 
                  x={entry.timeStr} 
                  stroke="#3b82f6" 
                  strokeDasharray="4 4" 
                  label={{ position: 'top', value: 'Retrain', fill: '#3b82f6', fontSize: 9, fontWeight: 900 }}
                />
              )
            ))}
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2, fill: '#0c0c0c' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="f1" 
              stroke="#10b981" 
              strokeWidth={2} 
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#10b981' }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-md border border-blue-500/10">
        <Info size={16} className="text-[#58a6ff] shrink-0" />
        <p className="text-[11px] text-blue-200/50 leading-relaxed italic">
          Accuracy represents the percentage of correct predictions on the NSL-KDD test set. F1 score accounts for precision and recall — essential for identifying rare attack classes in imbalanced data.
        </p>
      </div>
    </div>
  );
};

export default AccuracyDriftChart;

import React, { useEffect, useState } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Label
} from 'recharts';
import { 
  Fingerprint, 
  AlertOctagon, 
  Hexagon, 
  RefreshCw,
  Info
} from 'lucide-react';

const API_BASE = "/sentinel-api";

const ClusterAnalysis = () => {
  const [data, setData] = useState({ clusters: [], summaries: [], outliers: 0, total_events: 0 });
  const [loading, setLoading] = useState(true);

  const fetchClusters = async () => {
    try {
      const response = await fetch(`${API_BASE}/clusters`);
      if (response.ok) {
        const clusterData = await response.json();
        setData(clusterData);
      }
    } catch (error) {
      console.error("Failed to fetch clustering data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
    const interval = setInterval(fetchClusters, 5000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = [
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
  ];

  const getClusterColor = (id) => {
    if (id === -1) return '#f43f5e'; // Rose (Outlier)
    return COLORS[id % COLORS.length];
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="glass-card p-3 border border-slate-200 dark:border-slate-700 text-xs shadow-sm dark:shadow-md">
          <p className="font-bold text-slate-800 dark:text-[#c9d1d9] mb-1">Source: {d.ip}</p>
          <p className="text-slate-600 dark:text-slate-400 uppercase tracking-tighter">Cluster: {d.cluster_id === -1 ? "OUTLIER" : d.cluster_id}</p>
          <p className="text-slate-600 dark:text-slate-400 capitalize">Type: {d.type}</p>
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 italic">
            PCA Coordinate: {d.x.toFixed(2)}, {d.y.toFixed(2)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Fingerprint className="text-[#3fb950]" size={28} />
            DBSCAN Cluster Geometry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Algorithmic behavior grouping & novel threat identification</p>
        </div>
        <button 
          onClick={fetchClusters}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card h-[500px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-[#c9d1d9] flex items-center gap-2">
              <Hexagon size={18} className="text-[#58a6ff]" />
              Behavioral Manifold (PCA)
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Standard</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500 anim-pulse"></div>
                  <span className="text-[10px] text-[#da3633] uppercase tracking-widest font-bold">Novel Threat</span>
               </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                   type="number" 
                   dataKey="x" 
                   name="PCA 1" 
                   hide 
                   domain={['auto', 'auto']}
                />
                <YAxis 
                   type="number" 
                   dataKey="y" 
                   name="PCA 2" 
                   hide 
                   domain={['auto', 'auto']}
                />
                <ZAxis type="number" range={[60, 400]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter data={data.clusters || []}>
                  {(data.clusters || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getClusterColor(entry.cluster_id)}
                      className={entry.cluster_id === -1 ? 'animate-pulse drop-shadow-sm' : ''}
                      strokeWidth={entry.cluster_id === -1 ? 2 : 0}
                      stroke={entry.cluster_id === -1 ? "#fff" : "none"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Statistics */}
        <div className="flex flex-col gap-6 h-full">
          <div className="glass-card p-6 flex-1 flex flex-col">
            <h3 className="font-bold text-slate-800 dark:text-[#c9d1d9] mb-6 flex items-center gap-2">
              <AlertOctagon size={18} className="text-[#da3633]" />
              Novel Behavior Report
            </h3>
            
            <div className="flex flex-col gap-4 flex-1">
               <div className="p-4 bg-[#da3633]/15 border border-[#da3633]/40 rounded-md">
                  <p className="text-[10px] uppercase font-bold text-[#da3633] mb-1">Outlier Density</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{data.outliers}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {data.outliers > 0 
                      ? "⚠️ Warning: Detected unknown attacker behaviors outside training baseline."
                      : "No novel threats detected. All traffic fits known patterns."}
                  </p>
               </div>

               <div className="flex-1 overflow-auto max-h-[250px] scrollbar-thin mt-2">
                   <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Active Cluster Breakdown</p>
                  <div className="space-y-3">
                    {(data.summaries || []).map(s => (
                      <div key={s.cluster_id} className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getClusterColor(s.cluster_id) }}></div>
                           <span className="font-mono text-sm text-slate-700 dark:text-slate-300">Cluster-{s.cluster_id}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{s.count} events</span>
                      </div>
                    ))}
                    {data.summaries.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 italic">Analyzing traffic patterns...</p>}
                  </div>
               </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex items-start gap-2">
               <Info size={14} className="text-[#58a6ff] shrink-0 mt-0.5" />
               <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                 DBSCAN Clustering (Density-Based Spatial Clustering of Applications with Noise) uses unsupervised learning to group packets by statistical density, bypassing the need for fixed labels or "strike" counters.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterAnalysis;

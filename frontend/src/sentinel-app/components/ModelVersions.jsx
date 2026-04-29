import React, { useState, useEffect } from 'react';
import { History, RotateCcw, CheckCircle2, AlertCircle, Loader2, Calendar, Database } from 'lucide-react';

const API_BASE = "/sentinel-api";

const ModelVersions = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ id: null, loading: false, msg: null, type: null });

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/model-versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      const data = await response.json();
      setVersions(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleRollback = async (versionId) => {
    if (!window.confirm(`Roll back to version ${versionId}? This replaces the current model.`)) return;

    setActionStatus({ id: versionId, loading: true, msg: null, type: null });
    try {
      const response = await fetch(`${API_BASE}/model-rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_id: versionId }),
      });
      
      if (!response.ok) throw new Error('Rollback failed');
      
      const result = await response.json();
      setActionStatus({ 
        id: versionId, 
        loading: false, 
        msg: `Successfully rolled back to ${versionId}`, 
        type: 'success' 
      });
      
      // Refresh versions to update accuracy/f1 display if needed
      fetchVersions();
    } catch (err) {
      setActionStatus({ 
        id: versionId, 
        loading: false, 
        msg: err.message, 
        type: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#58a6ff]" size={40} />
          <p className="text-slate-500 dark:text-[#8b949e] font-bold animate-pulse">Loading versions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
              <History className="text-[#58a6ff]" size={32} />
              Model Versioning
            </h1>
            <p className="text-slate-500 dark:text-[#8b949e] mt-2 font-medium">
              Manage and restore previous iterations of the XGBoost detection engine.
            </p>
          </div>
          <button 
            onClick={fetchVersions}
            className="px-4 py-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-md text-sm font-bold text-slate-600 dark:text-[#c9d1d9] hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
          >
            Refresh List
          </button>
        </div>

        {error ? (
          <div className="p-6 bg-[#da3633]/15 border border-[#da3633]/40 rounded-md flex items-center gap-4 text-[#da3633]">
            <AlertCircle size={24} />
            <p className="font-bold">{error}</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="p-20 bg-slate-100/50 dark:bg-[#161b22] border-2 border-dashed border-slate-200 dark:border-[#30363d] rounded-lg flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-200/50 dark:bg-[#161b22] rounded-full text-slate-400">
              <Database size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-900 dark:text-white">No versions saved yet.</p>
              <p className="text-sm text-slate-500 dark:text-zinc-500 max-w-xs font-medium">
                Versions are created automatically every time the model is successfully retrained.
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden rounded-md border-white/[0.05] shadow-md bg-white/50 dark:bg-[#0d1117]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-[#161b22] border-b border-slate-200 dark:border-[#30363d]">
                  <th className="p-5 text-xs font-semibold text-slate-500 dark:text-[#8b949e] uppercase tracking-widest">Version ID</th>
                  <th className="p-5 text-xs font-semibold text-slate-500 dark:text-[#8b949e] uppercase tracking-widest">Timestamp</th>
                  <th className="p-5 text-xs font-semibold text-slate-500 dark:text-[#8b949e] uppercase tracking-widest text-center">Accuracy</th>
                  <th className="p-5 text-xs font-semibold text-slate-500 dark:text-[#8b949e] uppercase tracking-widest text-center">F1 Score</th>
                  <th className="p-5 text-xs font-semibold text-slate-500 dark:text-[#8b949e] uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {versions.map((ver, idx) => (
                  <tr key={ver.version_id} className={`group hover:bg-white dark:hover:bg-zinc-800/20 transition-all ${idx === 0 ? 'border-l-4 border-emerald-500' : ''}`}>
                    <td className="p-5">
                      <span className="font-mono text-xs font-bold text-[#58a6ff] dark:text-[#58a6ff] bg-[#388bfd]/15 px-2 py-1 rounded">
                        {ver.version_id}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-[#c9d1d9]">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(ver.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {(ver.accuracy * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="text-sm font-semibold text-slate-500 dark:text-[#8b949e]">
                        {(ver.f1 * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {actionStatus.id === ver.version_id && actionStatus.msg ? (
                        <div className={`text-xs font-bold flex items-center justify-end gap-2 ${actionStatus.type === 'success' ? 'text-[#3fb950]' : 'text-[#da3633]'}`}>
                          {actionStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                          {actionStatus.msg}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRollback(ver.version_id)}
                          disabled={actionStatus.loading}
                          className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-semibold hover:scale-105 transition-all flex items-center gap-2 ml-auto shadow-md disabled:opacity-50"
                        >
                          {actionStatus.id === ver.version_id && actionStatus.loading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RotateCcw size={14} />
                          )}
                          ROLLBACK
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelVersions;

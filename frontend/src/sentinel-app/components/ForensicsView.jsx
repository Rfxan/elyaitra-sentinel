import React, { useState, useEffect } from 'react';
import { Search, History, Share2, ShieldAlert, Play, Download, Loader2, ChevronRight, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import axios from 'axios';
import ThreatNarrativeDrawer from './ThreatNarrativeDrawer';

const API_BASE = "/api/v1/forensics";

const ForensicsView = () => {
  const [events, setEvents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [replayData, setReplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replayLoading, setReplayLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(-1);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (replayData) setPlaybackIndex(replayData.events.length);
  }, [replayData]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_BASE + '/events');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch forensic events", err);
      setLoading(false);
    }
  };

  const handleSelectSession = async (session_id) => {
    setSelectedSession(session_id);
    setReplayLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/replay/${session_id}`);
      setReplayData(res.data);
    } catch (err) {
      console.error("Failed to fetch replay", err);
    } finally {
      setReplayLoading(false);
    }
  };

  const handleExportStix = async () => {
    if (!selectedSession) return;
    try {
      const res = await axios.post(`${API_BASE}/export/stix`, { session_id: selectedSession });
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stix_forensics_${selectedSession}.json`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("STIX export failed", err);
    }
  };

  const handleExportPdf = async () => {
    if (!selectedSession) return;
    try {
      const resp = await fetch(`${API_BASE}/export/pdf/${selectedSession}`, { method: 'GET' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinel_incident_${selectedSession}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // Group events by session_id, assigning a fallback for null sessions
  const sessions = Array.from(new Set(events.map(e => e.session_id || `orphan_${e.id}`))).map(sid => {
    const sessionEvents = events.filter(e => (e.session_id || `orphan_${e.id}`) === sid);
    if (!sessionEvents.length) return null;
    return {
      id: sid,
      type: sessionEvents[0]?.attack_type || 'Unknown',
      ip: sessionEvents[0]?.ip || 'unknown',
      count: sessionEvents.length,
      timestamp: sessionEvents[0]?.timestamp
    };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attack Forensics</h1>
          <p className="text-slate-500 text-sm">Deep session analysis and attack replay narrative.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportPdf}
            disabled={!selectedSession}
            className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Download PDF Report
          </button>
          <button 
            onClick={handleExportStix}
            disabled={!selectedSession}
            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm text-primary transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 size={16} />
            Export STIX 2.1
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 md:col-span-1 border-white/5">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white flex items-center gap-2">
                <History size={18} className="text-primary" />
                Session History
              </h3>
           </div>
           
           <div className="space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin pr-1">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10 italic">No forensic events logged.</p>
              ) : (
                sessions.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => handleSelectSession(s.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group
                      ${selectedSession === s.id ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5 hover:border-primary/20'}`}
                  >
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-primary uppercase">{String(s.id || '').slice(0, 12)}...</span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                           {s.count} Events
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm text-white font-medium truncate w-40">{s.type}</span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{s.ip}</span>
                        </div>
                        <ChevronRight size={16} className={selectedSession === s.id ? 'text-primary' : 'text-slate-600'} />
                     </div>
                  </div>
                ))
              )}
           </div>
        </GlassCard>

        <div className="md:col-span-2 flex flex-col gap-6">
           <GlassCard className="p-6 border-l-4 border-primary bg-primary/5 min-h-[200px]">
               <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ShieldAlert size={18} className="text-primary" />
                  Forensic Narrative
                </h3>
                <div className="flex items-center gap-3">
                  {replayLoading && <Loader2 size={16} className="animate-spin text-primary" />}
                  {replayData && (
                    <button 
                      onClick={() => setShowAnalysis(true)}
                      className="px-3 py-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-md text-[10px] font-bold text-primary uppercase tracking-wider transition-all"
                    >
                      Deep AI Analysis
                    </button>
                  )}
                </div>
              </div>
              
              {replayData ? (
                <div className="animate-fade-in">
                   <p className="text-sm text-slate-300 leading-relaxed italic mb-4">
                     "{replayData.narrative}"
                   </p>
                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                         High Confidence Detector
                      </div>
                      <div className="flex items-center gap-1">
                         <div className="w-2 h-2 rounded-full bg-primary" />
                         MITRE T1190
                      </div>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                  <Search size={40} className="text-slate-700 mb-4" />
                  <p className="text-xs text-slate-400">Select an attack session to generate AI analysis.</p>
                </div>
              )}
           </GlassCard>

           <ThreatNarrativeDrawer 
             sessionId={selectedSession} 
             isOpen={showAnalysis} 
             onClose={() => setShowAnalysis(false)} 
           />

           <GlassCard className="p-6 flex-1 min-h-[300px]">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                 <Play size={18} className="text-primary" />
                 Attack Replay Timeline
              </h3>
              
              {!replayData ? (
                 <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                    Sequential event log will appear here...
                 </div>
              ) : (
                <div className="flex flex-col h-full animate-fade-in">
                   {replayData.events.length > 0 && (
                     <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                       <div className="flex justify-between text-[10px] text-primary font-bold uppercase tracking-widest mb-2">
                         <span>Event 1</span>
                         <span>Playback: {playbackIndex === -1 ? replayData.events.length : playbackIndex} / {replayData.events.length}</span>
                       </div>
                       <input 
                         type="range" 
                         min="1" 
                         max={replayData.events.length} 
                         value={playbackIndex === -1 ? replayData.events.length : playbackIndex}
                         onChange={(e) => setPlaybackIndex(Number(e.target.value))}
                         className="w-full accent-primary bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                       />
                     </div>
                   )}
                   <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                   {replayData.events.slice(0, playbackIndex === -1 ? replayData.events.length : playbackIndex).map((e, idx) => (
                      <div key={idx} className="flex gap-4">
                         <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border 
                               ${e.honeypot_served ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                               {idx + 1}
                            </div>
                            {idx < replayData.events.length - 1 && <div className="w-px h-full bg-white/5 my-1" />}
                         </div>
                         <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                               <span className="text-xs font-bold text-white">{e.attack_type}</span>
                               <span className="text-[10px] font-mono text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 font-mono text-[11px] text-slate-400 break-all">
                               {e.raw_query}
                            </div>
                            {e.honeypot_served && (
                               <div className="mt-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-500 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                                  <Eye size={10} /> Deceptive Response Served
                               </div>
                            )}
                         </div>
                      </div>
                   ))}
                   </div>
                </div>
              )}
           </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ForensicsView;

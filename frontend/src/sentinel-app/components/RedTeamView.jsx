import React, { useState, useEffect } from 'react';
import { Target, Sword, Brain, Trophy, ChevronRight, Loader2, Sparkles, ShieldAlert } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import axios from 'axios';

const API_BASE = "/api/v1/redteam";

const RedTeamView = () => {
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [session, setSession] = useState(null);
  const [promptInput, setPromptInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState([]);
  const [score, setScore] = useState(0);
  
  const [sessionHistory, setSessionHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('redteam-history') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await axios.get(API_BASE + '/challenges');
      setChallenges(res.data);
      if (res.data.length > 0) setActiveChallenge(res.data[0]);
    } catch (err) {
      console.error("Failed to fetch challenges", err);
    }
  };

  const handleStartSession = async (challenge) => {
    setActiveChallenge(challenge);
    try {
      const res = await axios.post(API_BASE + '/start', { challenge_id: challenge.id });
      setSession(res.data);
      setLogs([`// Session ${res.data.session_id} initialized`, `// Target: ${challenge.title}`]);
      
      const newHistory = [{
        id: res.data.session_id,
        challenge: challenge.title,
        date: new Date().toLocaleDateString(),
        score: 0
      }, ...sessionHistory].slice(0, 10);
      setSessionHistory(newHistory);
      localStorage.setItem('redteam-history', JSON.stringify(newHistory));
    } catch (err) {
      console.error("Failed to start session", err);
    }
  };

  const handleSubmit = async () => {
    if (!session || !promptInput.trim()) return;
    setIsExecuting(true);
    setLogs(prev => [...prev, `> ${promptInput}`]);
    
    try {
      const res = await axios.post(API_BASE + '/submit', {
        session_id: session.session_id,
        challenge_id: activeChallenge.id,
        prompt: promptInput
      });
      
      const data = res.data;
      const wasSuccess = data.status === 'success' || data.was_detected;
      const reason = data.reason || 'Analysis complete';
      const pts = data.score || 0;
      const dangerScore = data.danger_score || 0;

      setLogs(prev => [
        ...prev, 
        wasSuccess 
          ? `✅ CHALLENGE SOLVED: ${reason}` 
          : `❌ BLOCKED: ${reason}`,
        `// Score: ${pts} | Danger: ${dangerScore}/100`
      ]);
      
      setScore(pts);
      setPromptInput('');
      
      setSessionHistory(prev => {
        const updated = prev.map(h => h.id === session.session_id ? { ...h, score: pts } : h);
        localStorage.setItem('redteam-history', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.error("Submission failed", err);
      setLogs(prev => [...prev, `⚠️ Error: ${err.message}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Red Team Playground</h1>
          <p className="text-slate-500 text-sm">Simulate adversarial attacks to test AI safety boundaries.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
           <Trophy size={18} className="text-primary" />
           <span className="text-xl font-bold text-white">{score}</span>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rank: Novice</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Active Challenges</h3>
           {challenges.map(c => {
             const diffColor = c.difficulty === 'Extreme' || c.difficulty === 'Hard' ? 'text-red-500' : c.difficulty === 'Medium' ? 'text-yellow-500' : 'text-green-500';
             const isActive = activeChallenge?.id === c.id;
             return (
               <GlassCard 
                 key={c.id} 
                 className={`p-4 cursor-pointer transition-all ${isActive ? 'border-primary ring-1 ring-primary/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'hover:bg-white/5 border-white/5'}`}
                 onClick={() => handleStartSession(c)}
               >
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${isActive ? 'bg-primary text-black' : 'bg-white/5'}`}>
                        <Target size={20} />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                        <span className={`text-[10px] font-bold uppercase transition-colors ${diffColor}`}>
                           {c.difficulty} • {c.points}pts
                        </span>
                     </div>
                     {isActive && <Sparkles size={16} className="text-primary animate-pulse" />}
                  </div>
               </GlassCard>
             );
           })}
            
            <div className="mt-8">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Session History</h3>
               {sessionHistory.length === 0 ? (
                 <div className="text-sm text-slate-500 px-1 italic">No previous sessions</div>
               ) : (
                 <div className="space-y-2">
                   {sessionHistory.map(h => (
                     <div key={h.id} className="text-xs flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                       <div className="flex flex-col gap-1">
                         <span className="text-slate-300 font-bold">{h.challenge}</span>
                         <span className="text-slate-500 text-[10px]">{h.date} - {h.id.slice(0, 8)}...</span>
                       </div>
                       <span className="text-primary font-bold">{h.score}pts</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
           <GlassCard className="flex-1 p-6 flex flex-col bg-black/40 border-white/5">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Simulator Terminal</span>
                    <h3 className="text-xl font-bold text-white">{activeChallenge?.title || "Select a Challenge"}</h3>
                 </div>
                 <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center gap-2">
                    <ShieldAlert size={14} />
                    Target: Elyaitra-LLM-v2
                 </div>
              </div>

              <div className="flex-1 border border-white/5 bg-black/60 rounded-xl p-5 mb-4 font-mono text-sm overflow-y-auto min-h-[400px] scrollbar-thin">
                 {logs.map((log, i) => (
                    <div key={i} className={`mb-2 ${log.startsWith('✅') ? 'text-green-400' : log.startsWith('❌') ? 'text-red-400' : log.startsWith('>') ? 'text-white' : 'text-slate-500'}`}>
                       {log}
                    </div>
                 ))}
                 {isExecuting && <div className="text-primary animate-pulse">Processing adversarial vector...</div>}
                 {!isExecuting && logs.length > 0 && <div className="text-primary mt-4 animate-blink border-l-2 border-primary pl-1">&nbsp;</div>}
              </div>

              <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={promptInput}
                   onChange={(e) => setPromptInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                   placeholder={session ? "Enter your adversarial prompt..." : "Start a session to begin..."}
                   disabled={!session || isExecuting}
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
                 />
                 <button 
                   onClick={handleSubmit}
                   disabled={!session || isExecuting || !promptInput.trim()}
                   className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                 >
                    {isExecuting ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                    Execute
                 </button>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default RedTeamView;

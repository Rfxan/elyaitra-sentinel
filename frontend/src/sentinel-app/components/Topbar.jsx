import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, ShieldAlert, Activity, Sun, Moon, Play, RefreshCw, Check } from 'lucide-react';
import NotificationBell from './NotificationBell';
import axios from 'axios';

const API_BASE = "/sentinel-api";

const Topbar = ({ isLive, theme, setTheme, activeItem, setActiveItem }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoState, setDemoState] = useState('idle'); // 'idle' | 'running' | 'complete'

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate scan
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleRunDemo = async () => {
    setDemoState('running');
    try {
      // Step 1: Blitz (25 events)
      await axios.post(`${API_BASE}/simulate`, { mode: 'blitz', count: 25 });
      
      // Wait 3 seconds
      await new Promise(r => setTimeout(r, 3000));
      
      // Step 2: Evasion (10 events)
      await axios.post(`${API_BASE}/simulate`, { mode: 'evasion', count: 10 });
      
      setDemoState('complete');
      setTimeout(() => setDemoState('idle'), 5000);
    } catch (err) {
      console.error("Demo failed:", err);
      setDemoState('idle');
    }
  };

  return (
    <header className="h-16 bg-[#0b1120] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <img src="/logo.png" alt="Elyaitra" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
           <span className="font-black text-xl text-white tracking-tighter">ELY<span className="text-primary">AITRA</span></span>
        </div>
      </div>

      {/* Center Nav Links - Task 78 */}
      <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1.5 py-1">
        {['Dashboard', 'Threat Feed', 'Forensics', 'Red Team', 'Integrity', 'Rooms'].map((item) => {
          const isActive = activeItem === item || (activeItem === 'Dashboards' && item === 'Dashboard');
          return (
            <button
              key={item}
              onClick={() => setActiveItem(item === 'Dashboard' ? 'Dashboards' : item)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-black shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-md text-slate-500 dark:text-[#8b949e] hover:bg-slate-100 dark:hover:bg-[#161b22] border border-slate-200 dark:border-[#30363d] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5">
          {isLive ? (
            <>
              <ShieldCheck size={14} className="text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">System Secure</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </>
          ) : (
            <>
              <ShieldAlert size={14} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Offline</span>
            </>
          )}
        </div>

        {/* Demo Mode Button */}
        <button 
          onClick={handleRunDemo}
          disabled={demoState !== 'idle'}
          className="rounded-xl px-4 py-2 bg-primary text-black text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {demoState === 'idle' ? (
            <><Play size={12} className="fill-current" /> Execute Simulation</>
          ) : (
            <><RefreshCw size={12} className="animate-spin" /> Ingress Live...</>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;

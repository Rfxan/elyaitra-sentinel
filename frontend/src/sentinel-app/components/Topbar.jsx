import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, ShieldAlert, Activity, Sun, Moon, Play, RefreshCw, Check } from 'lucide-react';
import NotificationBell from './NotificationBell';
import axios from 'axios';

const API_BASE = "/sentinel-api";

const Topbar = ({ isLive, theme, setTheme, activeItem }) => {
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
    <header className="h-16 bg-white dark:bg-[#010409] border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-slate-500 dark:text-[#8b949e] hover:text-slate-700 dark:hover:text-[#c9d1d9] cursor-pointer transition-colors">Global</span>
        <ChevronRight size={14} className="text-slate-300 dark:text-[#484f58]" />
        <span className="text-slate-500 dark:text-[#8b949e] hover:text-slate-700 dark:hover:text-[#c9d1d9] cursor-pointer transition-colors">Admin</span>
        <ChevronRight size={14} className="text-slate-300 dark:text-[#484f58]" />
        <span className="text-slate-900 dark:text-[#c9d1d9] font-semibold">
          {activeItem === 'Dashboards' ? 'Security Dashboard' : activeItem}
        </span>
      </div>

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-[#161b22]">
          {isLive ? (
            <>
              <ShieldCheck size={14} className="text-green-600 dark:text-[#3fb950]" />
              <span className="text-xs font-semibold text-green-700 dark:text-[#3fb950]">Protected</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 dark:bg-[#3fb950] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-[#3fb950]"></span>
              </span>
            </>
          ) : (
            <>
              <ShieldAlert size={14} className="text-slate-400 dark:text-[#484f58]" />
              <span className="text-xs font-semibold text-slate-500 dark:text-[#484f58]">Offline</span>
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400 dark:bg-[#484f58]"></span>
              </span>
            </>
          )}
        </div>

        {/* Demo Mode Button */}
        <button 
          onClick={handleRunDemo}
          disabled={demoState !== 'idle'}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 border
            ${demoState === 'idle' ? 'bg-[#238636] text-white border-[#2ea043] hover:bg-[#2ea043]' : 
              demoState === 'running' ? 'bg-slate-100 dark:bg-[#161b22] text-slate-400 dark:text-[#484f58] border-slate-200 dark:border-[#30363d] cursor-not-allowed' : 
              'bg-[#238636] text-white border-[#2ea043]'}
          `}
        >
          {demoState === 'idle' ? (
            <><Play size={12} className="fill-current" /> Run Demo</>
          ) : demoState === 'running' ? (
            <><RefreshCw size={12} className="animate-spin" /> Running...</>
          ) : (
            <><Check size={12} /> Complete</>
          )}
        </button>

        {/* Analyze CTA */}
        <button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="rounded-md px-4 py-1.5 bg-slate-900 dark:bg-[#c9d1d9] text-white dark:text-[#0d1117] text-xs font-semibold hover:bg-slate-700 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 border border-slate-900 dark:border-[#c9d1d9]"
        >
          <Activity size={14} className={isAnalyzing ? 'animate-pulse' : ''} />
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Logs'}</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;

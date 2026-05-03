import React, { useState } from 'react';
import { ChevronRight, ShieldCheck, ShieldAlert, Activity, Sun, Moon, Play, RefreshCw, Check, Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import axios from 'axios';
import { toast } from 'sonner';

const Topbar = ({ isLive, theme, setTheme, activeItem, setActiveItem, setIsMobileOpen }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoState, setDemoState] = useState('idle'); // 'idle' | 'running' | 'complete'

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleRunDemo = async () => {
    setDemoState('running');
    try {
      await axios.get('/api/v1/demo/seed');

      setDemoState('complete');
      // BUG-2: toast + auto-navigate to Threat Feed
      toast.success('Demo seeded — 30 events ingested', {
        description: 'Navigating to Threat Feed...',
        duration: 4000,
      });
      setActiveItem('Threat Feed');
      setTimeout(() => setDemoState('idle'), 3000);
    } catch (err) {
      console.error('Seeding failed:', err);
      toast.error('Demo seeding failed', { description: err.message });
      setDemoState('idle');
    }
  };

  return (
    <header className="h-16 bg-[#0b1120] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
        {/* BUG-1: Replaced broken /logo.png with inline SVG icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <ShieldCheck size={16} className="text-primary" />
          </div>
          <span className="font-black text-xl text-white tracking-tighter">ELY<span className="text-primary">AITRA</span></span>
        </div>
      </div>

      {/* Center Nav Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-1.5 py-1">
        {['Dashboard', 'Threat Feed', 'Forensics', 'Red Team', 'Integrity', 'Rooms', 'Attack Graph'].map((item) => {
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
          ) : demoState === 'complete' ? (
            <><Check size={12} /> Seeded!</>
          ) : (
            <><RefreshCw size={12} className="animate-spin" /> Ingress Live...</>
          )}
        </button>
      </div>
    </header>
  );
};

export default Topbar;

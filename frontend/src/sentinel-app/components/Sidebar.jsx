import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Bell, 
  ShieldAlert, 
  Target, 
  Ban, 
  HeartPulse,
  Eye,
  History,
  Terminal,
  Fingerprint,
  Zap
} from 'lucide-react';


const navItems = [
  { name: 'Dashboards', icon: LayoutDashboard },
  { name: 'Incidents', icon: ShieldAlert },
  { name: 'Intelligence', icon: Zap },
  { name: 'Clustering', icon: Fingerprint },
  { name: 'Traffic', icon: Activity },
  { name: 'Alerts', icon: Bell },
  { name: 'Attack', icon: Target },
  { name: 'Block List', icon: Ban },
  { name: 'Health', icon: HeartPulse },
  { name: 'Versions', icon: History },
  { name: 'SIEM Log', icon: Terminal },
];


const Sidebar = ({ activeItem, setActiveItem }) => {

  return (
    <aside className="w-64 bg-white dark:bg-[#010409] h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-[#30363d] flex flex-col z-40">
      {/* Brand */}
      <div className="h-20 px-5 flex items-center gap-3 border-b border-slate-200 dark:border-[#30363d]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900 dark:text-[#c9d1d9]">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span className="font-semibold text-base text-slate-900 dark:text-[#c9d1d9]">
          Sentinel ML
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <React.Fragment key={item.name}>
              <button
                onClick={() => setActiveItem(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isActive 
                    ? 'bg-slate-100 text-slate-900 dark:bg-[#161b22] dark:text-white' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-[#8b949e] dark:hover:bg-[#161b22] dark:hover:text-[#c9d1d9]'
                  }
                `}
              >
                <Icon 
                  size={16} 
                  className={isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-[#484f58]'} 
                />
                <span>{item.name}</span>
              </button>
              {index < navItems.length - 1 && (
                <div className="h-px mx-3 my-1 bg-slate-100 dark:bg-[#21262d]" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

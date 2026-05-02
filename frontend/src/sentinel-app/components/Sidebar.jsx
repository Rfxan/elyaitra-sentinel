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
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  UserCheck,
  DoorOpen,
  Radio
} from 'lucide-react';


const navItems = [
  { name: 'Dashboards', icon: LayoutDashboard },
  { name: 'Threat Feed', icon: Radio },
  { name: 'Forensics', icon: Search },
  { name: 'Red Team', icon: Target },
  { name: 'Integrity', icon: UserCheck },
  { name: 'Rooms', icon: DoorOpen },
  { name: 'Incidents', icon: ShieldAlert },
  { name: 'Intelligence', icon: Zap },
  { name: 'Clustering', icon: Fingerprint },
  { name: 'Alerts', icon: Bell },
  { name: 'Block List', icon: Ban },
  { name: 'Health', icon: HeartPulse },
  { name: 'Versions', icon: History },
  { name: 'SIEM Log', icon: Terminal },
];


const Sidebar = ({ activeItem, setActiveItem, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside 
        className={`bg-[#0b1120] dark:bg-[#0b1120] h-screen fixed left-0 top-0 border-r border-white/10 flex flex-col z-[50] transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className={`h-16 px-5 flex items-center justify-between border-b border-white/10 ${isCollapsed ? 'px-0 justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
               <ShieldCheck size={20} className="text-primary" />
               <span className="font-bold text-lg text-white tracking-tight">Sentinel<span className="text-primary">ML</span></span>
            </div>
          )}
          {isCollapsed && <ShieldCheck size={24} className="text-primary" />}
          
          <div className="flex items-center">
            {isMobileOpen && (
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-6 px-3 space-y-0.5">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;

          return (
            <button
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              title={isCollapsed ? item.name : ""}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
            >
              <Icon 
                size={isCollapsed ? 20 : 18} 
                className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-slate-500'}`} 
              />
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile Placeholder */}
      <div className={`p-4 border-t border-white/10 ${isCollapsed ? 'items-center px-0' : ''}`}>
         <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-primary/10">
              SA
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">Sentinel Analyst</span>
                <span className="text-[10px] text-slate-500">Security Lead</span>
              </div>
            )}
         </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;

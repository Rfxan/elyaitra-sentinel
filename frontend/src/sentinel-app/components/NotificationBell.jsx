import React, { useState, useRef, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../hooks/useAlerts';

const NotificationBell = () => {
  const { unreadCount, markAllRead, soundEnabled, setSoundEnabled, alerts } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recentAlerts = alerts.slice(0, 5); // Just show top 5 in dropdown

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark as read when opened? Or explicit button? Let's do explicit button for UX
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Action Buttons Row */}
      <div className="flex items-center gap-3">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg transition-colors border shadow-sm ${
            soundEnabled 
            ? 'bg-[#238636]/15 dark:bg-[#238636]/15 text-[#3fb950] dark:text-[#3fb950] border-[#238636]/40 dark:border-emerald-800' 
            : 'bg-slate-100/50 dark:bg-[#161b22] text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-[#30363d] hover:text-slate-600'
          }`}
          title={soundEnabled ? "Audio Alerts On" : "Audio Alerts Off"}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Bell Button */}
        <button
          onClick={handleToggle}
          className="relative p-2 rounded-lg bg-slate-100/50 dark:bg-[#161b22] text-slate-600 dark:text-[#c9d1d9] hover:bg-white dark:hover:bg-zinc-700 shadow-sm border border-slate-200 dark:border-[#30363d] transition-colors"
        >
          <Bell size={18} />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
                <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75"></span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#30363d] shadow-md rounded-md overflow-hidden z-50"
          >
            <div className="p-4 border-b border-slate-100 dark:border-[#30363d] flex items-center justify-between bg-slate-50 dark:bg-[#111]">
              <h3 className="font-semibold text-slate-800 dark:text-[#c9d1d9]">Alerts</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-xs font-semibold text-[#58a6ff] hover:text-[#58a6ff] flex items-center gap-1"
                >
                  <Check size={12} /> Mark read
                </button>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
              {recentAlerts.length > 0 ? (
                <div className="flex flex-col">
                  {recentAlerts.map(alert => (
                    <div key={`${alert.time}-${alert.ip}`} className="p-3 border-b border-slate-50 dark:border-[#30363d] hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors cursor-default">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold capitalize text-slate-800 dark:text-[#c9d1d9]">{alert.type}</span>
                        <span className="text-[10px] text-slate-400">{new Date(alert.timestamp || alert.time * 1000).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{alert.ip || alert.source_ip}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">
                  No recent alerts.
                </div>
              )}
            </div>
            <div className="p-2 border-t border-slate-100 dark:border-[#30363d] bg-slate-50 dark:bg-[#111] text-center">
              <span className="text-xs text-slate-400">View all in Alerts tab</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

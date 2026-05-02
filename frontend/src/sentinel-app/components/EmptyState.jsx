import React from 'react';
import { SearchX } from 'lucide-react';

const EmptyState = ({ message = "Scan Required", subMessage = "No threats currently detected on the network." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 h-full text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700/50 shadow-inner transition-colors duration-300">
        <SearchX size={28} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-300 tracking-wide mb-1 transition-colors duration-300">{message}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-500 max-w-xs transition-colors duration-300">{subMessage}</p>
    </div>
  );
};

export default EmptyState;

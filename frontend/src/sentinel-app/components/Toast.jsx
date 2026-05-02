import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Cpu, Activity, X } from 'lucide-react';

const Toast = ({ toast, onDismiss }) => {
  const getToastConfig = (type) => {
    switch(type?.toLowerCase()) {
      case 'evasion': 
        return { icon: AlertTriangle, bg: 'bg-[#d29922]/15 dark:bg-[#d29922]/15', text: 'text-[#d29922] dark:text-[#d29922]', border: 'border-[#d29922]/40 dark:border-[#d29922]/40' };
      case 'poisoning': 
        return { icon: Cpu, bg: 'bg-[#8957e5]/15 dark:bg-[#8957e5]/15', text: 'text-[#a371f7] dark:text-[#a371f7]', border: 'border-[#8957e5]/40 dark:border-[#8957e5]/40' };
      case 'attack': 
        return { icon: ShieldAlert, bg: 'bg-[#da3633]/15 dark:bg-[#da3633]/15', text: 'text-[#da3633] dark:text-[#da3633]', border: 'border-[#da3633]/40 dark:border-[#da3633]/40' };
      default: 
        return { icon: Activity, bg: 'bg-slate-100 dark:bg-[#161b22]', text: 'text-slate-600 dark:text-[#8b949e]', border: 'border-slate-200 dark:border-[#30363d]' };
    }
  };

  const conf = getToastConfig(toast.type);
  const Icon = conf.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative w-[320px] p-4 rounded-md shadow-sm backdrop-blur-md border ${conf.bg} ${conf.border} pointer-events-auto`}
    >
      <button 
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <X size={14} />
      </button>

      <div className="flex gap-3 items-start pr-4">
        <div className={`p-2 rounded-full bg-white dark:bg-[#0d1117] shadow-sm shrink-0 mt-0.5`}>
          <Icon className={`w-5 h-5 ${conf.text}`} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white capitalize">
            {toast.type} Detected
          </h4>
          <p className="text-xs font-mono text-slate-600 dark:text-slate-300 mt-1 truncate max-w-[200px]">
            {toast.ip || toast.source_ip}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide bg-white dark:bg-[#0d1117] ${conf.text}`}>
               {toast.status}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
               Conf: {(toast.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;

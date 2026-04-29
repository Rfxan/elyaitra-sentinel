import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Cpu, Activity, Clock } from 'lucide-react';

const AlertCard = ({ alert, index }) => {
  const getCardConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'evasion':
        return {
          bg: 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-transparent',
          border: 'border-[#d29922]/40/50 dark:border-[#d29922]/40',
          iconBg: 'bg-[#d29922]/15 dark:bg-[#d29922]/15',
          iconColor: 'text-[#d29922] dark:text-[#d29922]',
          Icon: AlertTriangle,
          label: 'FLAGGED',
          labelBg: 'bg-amber-500',
          title: 'Evasion Activity Detected',
        };
      case 'attack':
        return {
          bg: 'bg-gradient-to-r from-rose-500/10 to-rose-500/5 dark:from-rose-500/20 dark:to-transparent',
          border: 'border-[#da3633]/40/50 dark:border-[#da3633]/40',
          iconBg: 'bg-[#da3633]/15 dark:bg-[#da3633]/15',
          iconColor: 'text-[#da3633] dark:text-[#da3633]',
          Icon: ShieldAlert,
          label: 'BLOCKED',
          labelBg: 'bg-rose-600',
          title: 'Attack Activity Detected',
        };
      case 'poisoning':
        return {
          bg: 'bg-gradient-to-r from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-transparent',
          border: 'border-[#8957e5]/40/50 dark:border-[#8957e5]/40',
          iconBg: 'bg-[#8957e5]/15 dark:bg-[#8957e5]/15',
          iconColor: 'text-[#a371f7] dark:text-[#a371f7]',
          Icon: Cpu,
          label: 'REJECTED',
          labelBg: 'bg-purple-500',
          title: 'Data Poisoning Attempt',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-[#161b22]',
          border: 'border-slate-200 dark:border-[#30363d]',
          iconBg: 'bg-slate-200 dark:bg-[#161b22]',
          iconColor: 'text-slate-600 dark:text-zinc-500',
          Icon: Activity,
          label: 'LOGGED',
          labelBg: 'bg-slate-500',
          title: 'Anomalous Activity',
        };
    }
  };

  const config = getCardConfig(alert.type);
  const { Icon } = config;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.005 }}
      className={`flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-md border backdrop-blur-sm ${config.bg} ${config.border} hover:shadow-lg transition-all duration-300`}
    >
      <div className={`p-4 rounded-full ${config.iconBg} shadow-sm shrink-0 flex items-center justify-center`}>
        <Icon className={`w-7 h-7 ${config.iconColor}`} />
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h4 className="font-bold text-lg text-slate-900 dark:text-white capitalize">
            {config.title}
          </h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm text-white uppercase tracking-wider shadow-sm ${config.labelBg}`}>
            {config.label}
          </span>
        </div>

        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-3 font-mono">
          <span>Source: <span className="font-semibold text-slate-800 dark:text-slate-100">{alert.ip || alert.source_ip}</span></span>
          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
          <span>Confidence: <span className="font-semibold text-slate-800 dark:text-slate-100">{(alert.confidence * 100).toFixed(1)}%</span></span>
        </div>

        {alert.mitre_id && alert.mitre_id !== 'N/A' && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-semibold bg-[#d29922]/15 text-[#d29922] border border-[#d29922]/40 px-2 py-0.5 rounded uppercase tracking-wider">
              MITRE {alert.mitre_id}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{alert.mitre_name}</span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Clock size={14} className="text-slate-400" />
        {new Date(alert.time ? alert.time * 1000 : alert.timestamp).toLocaleString([], { hour12: false })}
      </div>
    </motion.div>
  );
};

export default AlertCard;

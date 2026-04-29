import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react';

const TrafficRow = ({ row, onClick }) => {
  const getRowStyle = (type) => {
    switch (type?.toLowerCase()) {
      case 'attack':
        return 'bg-[#da3633]/15 hover:bg-[#da3633]/15 border-[#da3633]/40 text-[#da3633] dark:text-rose-200';
      case 'evasion':
        return 'bg-[#d29922]/15 hover:bg-[#d29922]/15 border-[#d29922]/40 text-[#d29922] dark:text-amber-200';
      case 'poisoning':
        return 'bg-[#8957e5]/15 hover:bg-[#8957e5]/15 border-[#8957e5]/40 text-[#a371f7] dark:text-purple-200';
      default:
        return 'bg-[#238636]/15 hover:bg-[#238636]/15 border-[#238636]/40 text-[#3fb950] dark:text-emerald-200';
    }
  };

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'attack': return <ShieldAlert size={16} className="text-[#da3633]" />;
      case 'evasion': return <AlertTriangle size={16} className="text-[#d29922]" />;
      case 'poisoning': return <Cpu size={16} className="text-[#a371f7]" />;
      default: return <ShieldCheck size={16} className="text-[#3fb950]" />;
    }
  };

  const type = row.type || 'Normal';
  const rowStyle = getRowStyle(type);

  return (
    <motion.tr
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      layout
      onClick={() => onClick(row)}
      className={`border-b border-black/5 dark:border-[#30363d] cursor-pointer transition-colors ${rowStyle}`}
    >
      <td className="p-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-white dark:bg-[#0d1117] shadow-sm">
            {getIcon(type)}
          </div>
          <span className="opacity-80">
            {new Date(row.time ? row.time * 1000 : row.timestamp).toLocaleTimeString([], { hour12: false })}
          </span>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-sm font-mono font-semibold">
        {row.ip || row.source_ip}
      </td>
      <td className="p-4 whitespace-nowrap text-sm font-bold uppercase tracking-wider">
        {type}
      </td>
      <td className="p-4 whitespace-nowrap text-xs font-bold text-slate-500 dark:text-slate-400">
        {row.mitre_id && row.mitre_id !== 'N/A' ? (
          <span className="px-2 py-0.5 rounded bg-[#d29922]/15 text-[#d29922] dark:text-[#d29922] border border-[#d29922]/40">
            {row.mitre_id}
          </span>
        ) : (
          <span className="opacity-50">-</span>
        )}
      </td>
      <td className="p-4 whitespace-nowrap text-sm font-mono">
        {row.reputation_score !== undefined ? (
          <div className="flex flex-col gap-1 w-24">
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-1000 ${
                   row.reputation_score > 80 ? 'bg-rose-500' : row.reputation_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                 }`} 
                 style={{ width: `${row.reputation_score}%` }} 
               />
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-tighter ${
              row.reputation_score > 80 ? 'text-[#da3633]' : row.reputation_score > 40 ? 'text-[#d29922]' : 'text-[#3fb950]'
            }`}>
              {row.reputation_label || 'CHECKING'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-500 italic opacity-50">PRE-SOC</span>
        )}
      </td>
      <td className="p-4 whitespace-nowrap text-sm font-mono">
        {(row.confidence * 100).toFixed(1)}%
      </td>
      <td className="p-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded border shadow-sm ${
          row.status === 'blocked' || row.status === 'rejected'
          ? 'bg-rose-500 text-white border-rose-600'
          : row.status === 'flagged'
          ? 'bg-amber-500 text-white border-amber-600'
          : 'bg-emerald-500 text-white border-emerald-600'
        }`}>
          {row.status}
        </span>
      </td>
    </motion.tr>
  );
};

export default TrafficRow;

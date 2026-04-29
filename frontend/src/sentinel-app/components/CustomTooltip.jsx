import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-md shadow-lg min-w-[180px]">
        <p className="text-[#8b949e] text-sm mb-3 pb-2 border-b border-[#30363d] font-medium">Time: {label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => {
            let colorClass = 'text-[#8b949e]';
            if (entry.dataKey === 'normal') colorClass = 'text-[#3fb950]';
            if (entry.dataKey === 'attacks') colorClass = 'text-[#da3633]';
            if (entry.dataKey === 'adversarial') colorClass = 'text-[#a371f7]';
            if (entry.dataKey === 'fgsm') colorClass = 'text-[#d29922]';
            
            return (
              <div key={index} className="flex items-center gap-3 justify-between">
                <span className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-[#c9d1d9] font-medium text-sm capitalize">
                    {entry.name}
                  </span>
                </span>
                <span className={`font-bold ${colorClass}`}>
                  {entry.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;

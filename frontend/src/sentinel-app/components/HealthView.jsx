import React from 'react';
import ModelHealthPanel from './ModelHealthPanel';

const HealthView = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto h-full animate-fade-in">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
          System Health
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Monitor neural network intelligence, prediction confidences, and model integrity.
        </p>
      </div>
      
      {/* 
        This wrapper controls the height of the panel 
      */}
      <div className="w-full h-auto min-h-[500px]">
        <ModelHealthPanel />
      </div>
    </div>
  );
};

export default HealthView;

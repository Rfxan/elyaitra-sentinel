import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from './Toast';
import { useAlerts } from '../hooks/useAlerts';

const ToastContainer = () => {
  const { toasts, dismissToast } = useAlerts();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            toast={toast} 
            onDismiss={dismissToast} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../hooks/useAlerts';

const FlashOverlay = () => {
  const { activeFlashes } = useAlerts();

  return (
    <AnimatePresence>
      {activeFlashes.length > 0 && (
        <motion.div
          key="flash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] pointer-events-none bg-red-600/15"
        />
      )}
    </AnimatePresence>
  );
};

export default FlashOverlay;

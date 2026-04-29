import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useTrafficPolling } from './useTrafficPolling';

export const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  // Use existing polling hook
  const { trafficFeed, modelStats, blockedIPs, attackerProfiles, honeypotLog, isLive, isLoading } = useTrafficPolling();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [activeFlashes, setActiveFlashes] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [simulatedEvents, setSimulatedEvents] = useState([]);

  // Track the most recent seen event to trigger new alerts
  const [lastSeenTime, setLastSeenTime] = useState(Date.now() / 1000); 

  // Cross-browser clean synthesized audio to avoid asset dependencies
  const playAlertSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'attack') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        osc.type = 'sawtooth';
      } else {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        osc.type = 'sine';
      }
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05); // volume
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }, [soundEnabled]);
  
  // Add a local event to trigger real-time graph spikes without backend polling latency
  const addSimulatedEvent = useCallback((type = 'evasion') => {
    const now = new Date();
    const event = {
      id: `sim-${Date.now()}-${Math.random()}`,
      timestamp: now.toISOString(),
      type: type,
      time: now.getTime() / 1000,
      isSimulated: true
    };
    setSimulatedEvents(prev => [...prev.slice(-1000), event]);
  }, []);

  // Process traffic feed for new alerts
  useEffect(() => {
    if (!trafficFeed || trafficFeed.length === 0) return;
    
    // Filter alerts to keep (Evasion, Attack, Poisoning)
    const criticalTypes = ['evasion', 'poisoning', 'attack'];
    
    // Raw array of alerts sorted chronologically (old -> new implicitly from backend)
    const alertList = trafficFeed.filter(e => criticalTypes.includes(e.type?.toLowerCase()));

    // Set the list for mapping later (Reverse to show newest at top)
    setAlerts([...alertList].reverse());

    if (alertList.length > 0) {
      // Find new alerts
      const newAlerts = alertList.filter(a => {
        const time = a.time || (a.timestamp / 1000);
        return time > lastSeenTime;
      });

      if (newAlerts.length > 0) {
        let triggeredFlash = false;
        let highestSeverity = 'evasion';
        
        let latestTime = lastSeenTime;

        newAlerts.forEach(alert => {
          const type = alert.type?.toLowerCase();
          const time = alert.time || (alert.timestamp / 1000);
          if (time > latestTime) latestTime = time;

          const toastId = `toast-${time}-${alert.ip}-${Math.random()}`;
          
          // Add to stackable toasts
          setToasts(prev => [...prev.slice(-3), { id: toastId, ...alert, createTime: Date.now() }]);

          if (type === 'attack') {
            triggeredFlash = true;
            highestSeverity = 'attack';
          }
        });

        // Trigger flash if it's an attack
        if (triggeredFlash) {
          const flashId = Date.now();
          setActiveFlashes(prev => [...prev, flashId]);
          setTimeout(() => {
            setActiveFlashes(prev => prev.filter(id => id !== flashId));
          }, 400); // 400ms duration
        }

        // Trigger sound
        playAlertSound(highestSeverity);
        
        // Update Unread Count
        setUnreadCount(prev => prev + newAlerts.length);
        
        // Advance seen time pointer
        setLastSeenTime(latestTime);
      }
    }
  }, [trafficFeed, lastSeenTime, playAlertSound]);

  // Auto-dismiss toasts every 5 seconds & prune simulated events > 60s old
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setToasts(prev => prev.filter(t => now - t.createTime < 5000));
      setSimulatedEvents(prev => prev.filter(e => {
        const time = new Date(e.timestamp).getTime();
        return now - time < 60000; // prune after 60s
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{
      alerts,
      unreadCount,
      markAllRead,
      soundEnabled,
      setSoundEnabled,
      activeFlashes,
      toasts,
      dismissToast,
      // Simulated traffic system
      simulatedEvents,
      addSimulatedEvent,
      // Expose general state from useTrafficPolling
      trafficFeed, 
      modelStats, 
      blockedIPs, 
      attackerProfiles,
      honeypotLog,
      isLive, 
      isLoading
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlerts must be used within an AlertProvider");
    }
    return context;
};

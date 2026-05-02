import { useState, useEffect, useMemo } from 'react';
import { useAlerts } from './useAlerts';

export function useAttackTrends(windowSeconds = 15) {
  const { trafficFeed, simulatedEvents } = useAlerts();
  
  // Memoize the data processing to avoid heavy recalcs on every re-render
  const chartData = useMemo(() => {
    const now = new Date();
    const buckets = {};
    
    // 1. Initialize empty buckets for the requested window
    for (let i = windowSeconds - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 1000);
      const timeKey = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      buckets[timeKey] = { time: timeKey, normal: 0, attacks: 0, adversarial: 0, fgsm: 0 };
    }

    const cutoff = new Date(now.getTime() - windowSeconds * 1000);

    // 2. Helper to process events into buckets
    const processEvents = (events) => {
      if (!events || !Array.isArray(events)) return;
      
      events.forEach(event => {
        if (!event.timestamp) return;
        
        // Prioritize unix time for accuracy, fallback to string parsing
        const eventTime = event.time ? new Date(event.time * 1000) : new Date(event.timestamp.includes('T') ? event.timestamp : event.timestamp.replace(' ', 'T'));
        
        if (eventTime >= cutoff) {
          const timeKey = `${String(eventTime.getHours()).padStart(2, '0')}:${String(eventTime.getMinutes()).padStart(2, '0')}:${String(eventTime.getSeconds()).padStart(2, '0')}`;
          
          if (buckets[timeKey]) {
            const type = (event.type || '').toLowerCase();
            if (type === 'normal' || type === 'train') {
              buckets[timeKey].normal++;
            } else if (type === 'attack') {
              buckets[timeKey].attacks++;
            } else if (type === 'fgsm') {
              buckets[timeKey].fgsm++;
            } else if (type === 'evasion' || type === 'poison' || type === 'poisoning') {
              buckets[timeKey].adversarial++;
            }
          }
        }
      });
    };

    // 3. Process both backend traffic and local simulated events
    processEvents(trafficFeed);
    processEvents(simulatedEvents);

    return Object.values(buckets);
  }, [trafficFeed, simulatedEvents, windowSeconds]);

  return chartData;
}

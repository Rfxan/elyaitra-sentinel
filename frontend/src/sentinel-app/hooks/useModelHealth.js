import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = "/sentinel-api";

export function useModelHealth() {
  const [accuracy, setAccuracy] = useState(0);
  const [previousAccuracy, setPreviousAccuracy] = useState(0);
  const [histogramData, setHistogramData] = useState([]);
  const [isRetraining, setIsRetraining] = useState(false);
  const [lastTrained, setLastTrained] = useState(new Date().toISOString());
  
  const accuracyRef = useRef(0);

  const fetchHealthData = async () => {
    // Don't fetch while retraining, let animation play
    if (isRetraining) return;

    try {
      const [statsRes, trafficRes] = await Promise.all([
        axios.get(`${API_URL}/model-stats`),
        axios.get(`${API_URL}/traffic-feed`)
      ]);

      const newAccuracy = statsRes.data.accuracy * 100; // backend accuracy is 0-1
      
      if (accuracyRef.current !== 0 && accuracyRef.current !== newAccuracy) {
        setPreviousAccuracy(accuracyRef.current);
      }
      
      setAccuracy(newAccuracy);
      accuracyRef.current = newAccuracy;

      // Compute histogram from traffic feed
      const traffic = trafficRes.data || [];
      const buckets = {
        '0-20%': 0,
        '20-40%': 0,
        '40-60%': 0,
        '60-80%': 0,
        '80-100%': 0,
      };

      traffic.forEach(event => {
        const conf = event.confidence;
        if (conf != null) {
          if (conf <= 0.2) buckets['0-20%']++;
          else if (conf <= 0.4) buckets['20-40%']++;
          else if (conf <= 0.6) buckets['40-60%']++;
          else if (conf <= 0.8) buckets['60-80%']++;
          else buckets['80-100%']++;
        }
      });

      const formattedHistogram = Object.keys(buckets).map(key => ({
        range: key,
        count: buckets[key]
      }));

      setHistogramData(formattedHistogram);

    } catch (err) {
      console.error('Error fetching model health stats:', err);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 3000); // UI updates every 3-5s
    return () => clearInterval(interval);
  }, [isRetraining]);

  const triggerRetrain = async () => {
    setIsRetraining(true);
    try {
      const res = await axios.post(`${API_URL}/retrain`);
      if (res.data.new_accuracy) {
        setPreviousAccuracy(accuracy);
        setAccuracy(res.data.new_accuracy * 100);
        accuracyRef.current = res.data.new_accuracy * 100;
        setLastTrained(new Date().toISOString());
      }
    } catch (err) {
      console.error('Retrain failed', err);
    } finally {
      // Small delay to ensure smooth transition
      setTimeout(() => setIsRetraining(false), 1500);
    }
  };

  return {
    accuracy,
    previousAccuracy,
    histogramData,
    isRetraining,
    triggerRetrain,
    lastTrained
  };
}

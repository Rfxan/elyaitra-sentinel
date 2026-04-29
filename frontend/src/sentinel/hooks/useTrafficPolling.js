import { useState, useEffect } from 'react';
import axios from 'axios';

export const useTrafficPolling = (baseUrl = "http://localhost:8000") => {
  const [data, setData] = useState({
    trafficFeed: [],
    modelStats: null,
    blockedIPs: [],
    attackerProfiles: [],
    honeypotLog: []
  });
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let pollInterval;

    const fetchAll = async () => {
      try {
        const [feedRes, statsRes, blockedRes] = await Promise.all([
          axios.get(`${baseUrl}/traffic-feed`),
          axios.get(`${baseUrl}/model-stats`),
          axios.get(`${baseUrl}/blocked-ips-detail`)
        ]);
        
        setData({
          trafficFeed: feedRes.data,
          modelStats: statsRes.data,
          blockedIPs: blockedRes.data,
          attackerProfiles: [],
          honeypotLog: []
        });
        setIsLive(true);
      } catch (err) {
        console.error("Failed to connect to SentinelML backend:", err);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
    pollInterval = setInterval(fetchAll, 3000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [baseUrl]);

  return { 
    trafficFeed: data.trafficFeed, 
    modelStats: data.modelStats, 
    blockedIPs: data.blockedIPs, 
    isLive, 
    isLoading 
  };
};

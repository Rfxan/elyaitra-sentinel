import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "/sentinel-api";

export const useTrafficPolling = () => {
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
        const [feedRes, statsRes, blockedRes, profilesRes, honeypotRes] = await Promise.all([
          axios.get(`${API_BASE}/traffic-feed`),
          axios.get(`${API_BASE}/model-stats`),
          axios.get(`${API_BASE}/blocked-ips-detail`),
          axios.get(`${API_BASE}/attacker-profiles`),
          axios.get(`${API_BASE}/honeypot-log`)
        ]);
        
        setData({
          trafficFeed: feedRes.data,
          modelStats: statsRes.data,
          blockedIPs: blockedRes.data,
          attackerProfiles: profilesRes.data,
          honeypotLog: honeypotRes.data
        });
        setIsLive(true);
      } catch (err) {
        console.error("Failed to connect to backend:", err);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
    pollInterval = setInterval(fetchAll, 3000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  return { 
    trafficFeed: data.trafficFeed, 
    modelStats: data.modelStats, 
    blockedIPs: data.blockedIPs, 
    attackerProfiles: data.attackerProfiles,
    honeypotLog: data.honeypotLog,
    isLive, 
    isLoading 
  };
};

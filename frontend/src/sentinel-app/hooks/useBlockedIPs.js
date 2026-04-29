import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "/sentinel-api";
const geoCache = {};

export function useBlockedIPs() {
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [geoDataMap, setGeoDataMap] = useState({});
  const [newlyBlocked, setNewlyBlocked] = useState(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchGeoData = async (ip) => {
    if (geoCache[ip]) return geoCache[ip];
    
    // Ignore private networks
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '127.0.0.1') {
      const data = { lat: 0, lon: 0, country: 'Local Network' };
      geoCache[ip] = data;
      return data;
    }

    try {
      const res = await axios.get(`http://ip-api.com/json/${ip}`);
      if (res.data.status === 'success') {
        const data = { lat: res.data.lat, lon: res.data.lon, country: res.data.country };
        geoCache[ip] = data;
        return data;
      }
    } catch (e) {
      console.warn('Geo API rate limited or blocked, using fallback for', ip);
    }
    
    // Fallback data
    const data = { lat: 34.05, lon: -118.24, country: 'Unknown' };
    geoCache[ip] = data;
    return data;
  };

  const pollData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/blocked-ips-detail`);
      const currentList = res.data || [];
      
      setBlockedIPs((prev) => {
        // Find new IPs
        const prevIPs = new Set(prev.map(p => p.ip));
        const addedIPs = currentList.filter(p => !prevIPs.has(p.ip)).map(p => p.ip);
        
        if (!isInitialLoad && addedIPs.length > 0) {
          setNewlyBlocked(new Set(addedIPs));
          // Clear animation trigger after 3s
          setTimeout(() => setNewlyBlocked(new Set()), 3000);
        }
        
        return currentList;
      });

      // Fetch geo for unknown
      const newGeoMap = { ...geoDataMap };
      let updatedGeo = false;
      for (const item of currentList) {
        if (!newGeoMap[item.ip]) {
          newGeoMap[item.ip] = await fetchGeoData(item.ip);
          updatedGeo = true;
        }
      }

      if (updatedGeo) setGeoDataMap(newGeoMap);
      setIsInitialLoad(false);

    } catch (e) {
      console.error("Failed to fetch blocked IPs", e);
    }
  }, [geoDataMap, isInitialLoad]);

  useEffect(() => {
    pollData();
    const interval = setInterval(pollData, 5000);
    return () => clearInterval(interval);
  }, [pollData]);

  const removeIPGlobally = (ipToRemove) => {
    setBlockedIPs(prev => prev.filter(b => b.ip !== ipToRemove));
  };

  return { blockedIPs, geoDataMap, newlyBlocked, removeIPGlobally };
}

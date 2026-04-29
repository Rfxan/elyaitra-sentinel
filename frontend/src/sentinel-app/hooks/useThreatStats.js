import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "/sentinel-api";

export const useThreatStats = () => {
  const [stats, setStats] = useState({
    threatScore: 0,
    totalRequests: 0,
    attacksBlocked: 0,
    adversarialAttempts: 0
  });

  useEffect(() => {
    let pollInterval;

    const fetchStats = async () => {
      try {
        const [statsRes, blockedRes] = await Promise.all([
          axios.get(`${API_BASE}/model-stats`),
          axios.get(`${API_BASE}/blocked-ips`)
        ]);

        const data = statsRes.data;
        const blockedIPs = blockedRes.data;

        const totalRequests = data.total_predictions || 0;
        const attacksBlocked = data.attacks_caught || 0;
        const adversarialAttempts = data.adversarial_attempts || 0;
        const blockedCount = Object.keys(blockedIPs || {}).length;

        // Calculate a mock threat score based on attacks, adversarial attempts and blocked IPs
        // Formula: simple weighting for demo purposes
        let score = 0;
        
        // Base risk from blocked IPs (each blocked IP adds 5 risk up to 40)
        score += Math.min(blockedCount * 5, 40);
        
        // Risk from attack rate (attacks / total * 100)
        if (totalRequests > 0) {
          const attackRate = (attacksBlocked / totalRequests) * 200; // Multiplied by 200 to make the rate more prominent
          score += Math.min(attackRate, 30);
        }

        // Heavy risk penalty for adversarial attempts
        score += Math.min(adversarialAttempts * 10, 30);

        // Normalize between 0 and 100
        const finalScore = Math.max(0, Math.min(Math.round(score), 100));

        setStats({
          threatScore: finalScore,
          totalRequests,
          attacksBlocked,
          adversarialAttempts
        });
      } catch (err) {
        console.error("Failed to fetch threat stats:", err);
      }
    };

    fetchStats();
    pollInterval = setInterval(fetchStats, 2500); // 2.5 seconds as requested (2-3s)

    return () => clearInterval(pollInterval);
  }, []);

  return stats;
};

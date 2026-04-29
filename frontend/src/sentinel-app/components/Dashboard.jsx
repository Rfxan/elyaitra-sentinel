import React, { useMemo } from 'react';
import StatCard from './StatCard';
import LogsPanel from './LogsPanel';
import ThreatTable from './ThreatTable';
import { Activity, ShieldAlert, Wifi } from 'lucide-react';
import ThreatScoreCard from './ThreatScoreCard';
import AccuracyDriftChart from './AccuracyDriftChart';
import AttackChart from './AttackChart';
import ModelHealth from './ModelHealth';
import DriftAlerts from './DriftAlerts';
import RateLimiterPanel from './RateLimiterPanel';
import AIInsights from './AIInsights';

const Dashboard = ({ data }) => {
  const { trafficFeed, modelStats, blockedIPs } = data;

  const activeThreats = useMemo(() => {
    if (!trafficFeed || !Array.isArray(trafficFeed)) return 0;
    return trafficFeed.filter(t => t.type?.toLowerCase() === 'attack').length;
  }, [trafficFeed]);

  const blockedCount = useMemo(() => {
    if (!blockedIPs || typeof blockedIPs !== 'object') return 0;
    return Object.keys(blockedIPs).length;
  }, [blockedIPs]);

  const requestsLogged = useMemo(() => {
    if (modelStats && modelStats.total_predictions) return modelStats.total_predictions;
    if (!trafficFeed || !Array.isArray(trafficFeed)) return 0;
    return trafficFeed.length;
  }, [modelStats, trafficFeed]);

  const tableThreats = useMemo(() => {
    // Generate threats from blockedIPs or recent attack traffic
    const blocks = Object.entries(blockedIPs || {}).map(([ip, details]) => ({
      ip,
      type: details?.reason || 'Intrusion Attempt',
      severity: 'high',
      status: 'Blocked'
    }));

    if (blocks.length > 0) return blocks;

    // Fallback if no blocks: show recent attacks from feed
    return (Array.isArray(trafficFeed) ? trafficFeed : [])
      .filter(t => t.type?.toLowerCase() === 'attack')
      .slice(0, 5) // Last 5
      .map(t => ({
        ip: t.source_ip || t.ip,
        type: t.details || 'Detected Attack',
        severity: 'high',
        status: 'Blocked'
      }));
  }, [blockedIPs, trafficFeed]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* HERO COMPONENT */}
      <div className="w-full">
        <ThreatScoreCard />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
          {/* ATTACK TRENDS CHART */}
          <AttackChart />

          {/* SYSTEM LOG */}
          <LogsPanel logs={trafficFeed} />
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <AIInsights />
          <ModelHealth stats={modelStats} />
          <DriftAlerts />
        </div>
      </div>

      {/* PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full mt-2 min-w-0">
        <AccuracyDriftChart />
        <ThreatTable threats={tableThreats} />
      </div>

      <div className="w-full">
        <RateLimiterPanel />
      </div>
    </div>
  );
};

export default Dashboard;

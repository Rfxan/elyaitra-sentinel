import React, { useMemo, useRef, useState } from 'react';
import StatCard from './StatCard';
import LogsPanel from './LogsPanel';
import ThreatTable from './ThreatTable';
import { Activity, ShieldAlert, Zap, Lock } from 'lucide-react';
import ThreatScoreCard from './ThreatScoreCard';
import AccuracyDriftChart from './AccuracyDriftChart';
import AttackChart from './AttackChart';
import ModelHealth from './ModelHealth';
import DriftAlerts from './DriftAlerts';
import RateLimiterPanel from './RateLimiterPanel';
import AIInsights from './AIInsights';
import SystemHealthWidget from './SystemHealthWidget';
import ThreatMapWidget from './ThreatMapWidget';
import AttackDistributionDonut from './AttackDistributionDonut';
import AttackGraph from './AttackGraph';
import AttackerProfileCard from './AttackerProfileCard';
import axios from 'axios';

const Dashboard = ({ data }) => {
  const { trafficFeed, modelStats, blockedIPs } = data;
  const [profiles, setProfiles] = React.useState([]);

  React.useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const resp = await axios.get('/sentinel-api/attacker-profiles');
        setProfiles(resp.data);
      } catch (err) {
        console.error('Failed to fetch profiles:', err);
      }
    };
    fetchProfiles();
  }, []);

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

  // BUG-9: Compute real deltas against previous snapshot
  const prevStatsRef = useRef(null);
  const [trends, setTrends] = useState({ threats: 0, blocked: 0, telemetry: 0 });

  React.useEffect(() => {
    const current = { threats: activeThreats, blocked: blockedCount, telemetry: requestsLogged };
    if (prevStatsRef.current) {
      setTrends({
        threats: current.threats - prevStatsRef.current.threats,
        blocked: current.blocked - prevStatsRef.current.blocked,
        telemetry: current.telemetry - prevStatsRef.current.telemetry,
      });
    }
    prevStatsRef.current = current;
  }, [activeThreats, blockedCount, requestsLogged]);

  const tableThreats = useMemo(() => {
    const blocks = Object.entries(blockedIPs || {}).map(([ip, details]) => ({
      ip,
      type: details?.reason || 'Intrusion Attempt',
      severity: 'high',
      status: 'Blocked'
    }));

    if (blocks.length > 0) return blocks;

    return (Array.isArray(trafficFeed) ? trafficFeed : [])
      .filter(t => t.type?.toLowerCase() === 'attack')
      .slice(0, 5)
      .map(t => ({
        ip: t.source_ip || t.ip,
        type: t.details || 'Detected Attack',
        severity: 'high',
        status: 'Blocked'
      }));
  }, [blockedIPs, trafficFeed]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* 4-COLUMN KPI GRID — BUG-9: Pass real trendDelta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Threats"
          value={activeThreats}
          icon={ShieldAlert}
          trendDelta={trends.threats}
        />
        <StatCard
          title="Blocked Actors"
          value={blockedCount}
          icon={Lock}
          trendDelta={trends.blocked}
        />
        <StatCard
          title="Total Telemetry"
          value={requestsLogged}
          icon={Activity}
          trendDelta={trends.telemetry}
        />
        <StatCard
          title="System Health"
          value="99.4%"
          icon={Zap}
          trendDelta={0}
        />
      </div>

      {/* HERO COMPONENT - THREAT SCORE */}
      <div className="w-full">
        <ThreatScoreCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">
          {/* ATTACK TOPOLOGY GRAPH */}
          <div className="h-[500px]">
            <AttackGraph />
          </div>

          {/* DUAL WIDGET SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThreatMapWidget />
            <SystemHealthWidget />
          </div>

          {/* ATTACK TRENDS CHART */}
          <AttackChart />

          {/* SYSTEM LOG */}
          <LogsPanel logs={trafficFeed} />
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest px-2 flex items-center gap-2">
            <Zap size={14} className="text-rose-500" /> Top Adversaries
          </h3>
          <div className="space-y-4">
            {profiles.slice(0, 3).map(p => (
              <AttackerProfileCard key={p.ip} profile={p} />
            ))}
            {profiles.length === 0 && (
              <div className="p-10 border border-dashed border-white/10 rounded-xl text-center text-xs text-slate-500 italic">
                No advanced adversaries identified.
              </div>
            )}
          </div>
          <AIInsights />
          <AttackDistributionDonut data={trafficFeed} />
          <ModelHealth stats={modelStats} />
        </div>
      </div>

      {/* PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full min-w-0">
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

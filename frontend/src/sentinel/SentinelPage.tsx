import React from "react";
import ThreatGauge from "./components/ThreatGauge";
import AttackTimeline from "./components/AttackTimeline";
import BlockList from "./components/BlockList";
import { useTrafficPolling } from "./hooks/useTrafficPolling";

// SentinelML backend is always on port 8000
const SENTINEL_BASE_URL = "http://localhost:8000";

export default function SentinelPage() {
  const { trafficFeed, modelStats, blockedIPs, isLive } = useTrafficPolling(SENTINEL_BASE_URL);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 tracking-tight">
            SentinelML
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Adversarially Robust Intrusion Detection · Real-Time Threat Intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLive ? "bg-green-400 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className={`text-xs font-mono ${isLive ? "text-green-400" : "text-red-400"}`}>
            {isLive ? "LIVE" : "OFFLINE"}
          </span>
          <span className="text-xs text-gray-500 ml-2">localhost:8000</span>
        </div>
      </div>

      {/* Stats Row */}
      {modelStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(modelStats).map(([key, value]) => (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                {key.replace(/_/g, " ")}
              </p>
              <p className="text-2xl font-bold text-cyan-300">
                {typeof value === "number" ? (
                  value < 1 && value > 0 ? `${(value * 100).toFixed(1)}%` : String(value)
                ) : String(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Threat Gauge */}
        <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Threat Level
          </h2>
          <ThreatGauge feed={trafficFeed} />
        </div>

        {/* Center + Right: Attack Timeline */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Attack Timeline
          </h2>
          <AttackTimeline feed={trafficFeed} />
        </div>

        {/* Bottom: Block List */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Blocked IPs · Active Adversary List
          </h2>
          <BlockList
            blockedIPs={blockedIPs}
            sentinelBaseUrl={SENTINEL_BASE_URL}
          />
        </div>
      </div>

      {/* Simulate Attack Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() =>
            fetch(`${SENTINEL_BASE_URL}/simulate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mode: "blitz", count: 20 }),
            })
          }
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-red-900/40"
        >
          ⚡ Simulate Blitz Attack
        </button>
      </div>
    </div>
  );
}

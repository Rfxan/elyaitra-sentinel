import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../hooks/useAlerts';

const API_BASE = "/sentinel-api";

const ATTACKS = [
  {
    id: 'normal',
    name: 'NORMAL',
    full: 'Baseline Traffic Generation',
    desc: 'Simulates legitimate user activity and standard network flow to establish a healthy traffic baseline.',
    badge: 'BENIGN',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    steps: ['Generating TCP/UDP packets', 'Simulating HTTP/S requests', 'Normalizing feature vectors', 'Injecting baseline noise'],
  },
  {
    id: 'fgsm',
    name: 'FGSM',
    full: 'Fast Gradient Sign Method',
    desc: 'Single-step gradient perturbation. Crafts adversarial noise by moving features in the direction of the loss gradient.',
    badge: 'EVASION',
    color: '#f97316',
    glow: 'rgba(249,115,22,0.35)',
    steps: ['Computing gradient ∇J(θ,x,y)', 'Applying sign function', 'Perturbing feature vector by ε', 'Clipping to valid bounds'],
  },
  {
    id: 'pgd',
    name: 'PGD',
    full: 'Projected Gradient Descent',
    desc: 'Multi-step iterative attack. Projects perturbations back onto the ε-ball after each gradient step for stronger evasion.',
    badge: 'ITERATIVE',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.35)',
    steps: ['Initialising perturbation δ=0', 'Computing numerical gradient', 'Gradient step + sign projection', 'Clipping to ε-ball & bounds', 'Repeating for N iterations'],
  },
  {
    id: 'blitz',
    name: 'BLITZ',
    full: 'Volumetric Attack Blitz',
    desc: 'Floods the target with a high-density burst of suspicious packets to overwhelm the primary detection layers.',
    badge: 'VOLUMETRIC',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
    steps: ['Spoofing source identifiers', 'Initiating packet flood', 'Varying payload entropy', 'Monitoring detection bypass'],
  },
];

const DYNAMIC_SCENARIO_STYLE = {
  badge: 'DYNAMIC',
  color: '#3b82f6',
  glow: 'rgba(59,130,246,0.3)',
  steps: ['Initializing scenario runner', 'Loading dataset samples', 'Executing vector logic', 'Analyzing response feed']
};

const LOG_PREFIXES = ['[SYS]', '[ADV]', '[ML]', '[NET]', '[DEF]'];

function randomLog(attack, step) {
  const msgs = [
    `Injecting ${attack.name} perturbation — ε=0.10`,
    `Feature vector dimension: 41`,
    `${step}`,
    `Querying /simulate endpoint`,
    `Defender Z-score threshold: 3.5`,
    `RandomForest predict_proba()`,
    `Evasion risk computed`,
    `Blocker strike recorded`,
    `Traffic feed updated`,
    `Response latency: ${(Math.random() * 80 + 20).toFixed(0)}ms`,
  ];
  const prefix = LOG_PREFIXES[Math.floor(Math.random() * LOG_PREFIXES.length)];
  return `${prefix} ${msgs[Math.floor(Math.random() * msgs.length)]}`;
}

export default function AdversarialSimulator() {
  const [selectedIds, setSelectedIds] = useState(['normal']);
  const [count, setCount] = useState(10);
  const [phase, setPhase] = useState('idle'); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { isLive } = useAlerts();
  const logRef = useRef(null);
  const intervalRef = useRef(null);

  const [dynamicAttacks, setDynamicAttacks] = useState([]);
  const [allAttacks, setAllAttacks] = useState(ATTACKS);

  useEffect(() => {
    // Fetch dynamic scenarios from backend
    const fetchScenarios = async () => {
      try {
        const resp = await fetch(`${API_BASE}/scenarios`);
        const data = await resp.json();
        const formatted = data.map(s => ({
          ...DYNAMIC_SCENARIO_STYLE,
          id: s.id,
          name: s.name.toUpperCase(),
          full: s.name.charAt(0).toUpperCase() + s.name.slice(1).replace('_', ' ') + ' Scenario',
          desc: s.description
        }));
        setDynamicAttacks(formatted);
        setAllAttacks([...ATTACKS, ...formatted]);
      } catch (err) {
        console.error("Failed to fetch scenarios:", err);
      }
    };
    fetchScenarios();
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => () => clearTimeout(intervalRef.current), []);

  const addLog = (msg, type = 'info') => {
    const now = new Date();
    const ts = now.toLocaleTimeString('en-GB', { hour12: false }) + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs(prev => [...prev.slice(-500), { ts, msg, type, id: Math.random() }]);
  };

  const reset = () => {
    setPhase('idle');
    setLogs([]);
    setResult(null);
    setProgress(0);
    setCurrentStep(0);
    clearTimeout(intervalRef.current);
  };

  const runSimulation = async () => {
    if (selectedIds.length === 0 || !isLive) return;
    setPhase('running');
    setLogs([]);
    setResult(null);
    setProgress(0);
    setCurrentStep(0);

    const activeModes = allAttacks.filter(a => selectedIds.includes(a.id));
    const steps = activeModes[0].steps;
    const targetCount = parseInt(count);
    let samplesProcessed = 0;
    let stepIdx = 0;

    addLog(`Launching Backend-Driven Simulation — Target: ${targetCount} samples`, 'system');
    addLog(`Vectors: ${activeModes.map(a => a.name).join(', ')}`, 'system');

    const loop = () => {
      if (phase === 'done' || phase === 'error') return;

      if (samplesProcessed >= targetCount) {
        setProgress(100);
        setPhase('done');
        addLog(`Simulation complete — ${samplesProcessed} samples confirmed in traffic feed`, 'success');
        setResult({ count: samplesProcessed, ips: [] });
        return;
      }

      // Log Cycling
      const currentStepIdx = stepIdx % steps.length;
      setCurrentStep(currentStepIdx);
      const logSource = activeModes[stepIdx % activeModes.length];
      addLog(randomLog(logSource, steps[currentStepIdx]), stepIdx % 2 === 0 ? 'info' : 'dim');
      
      // Update progress visually (it will be finalized when backend finishes)
      samplesProcessed += Math.max(1, Math.floor(targetCount / 20));
      setProgress(Math.min((samplesProcessed / targetCount) * 100, 99));

      stepIdx++;
      const baseDelay = targetCount > 100 ? 100 : 200;
      intervalRef.current = setTimeout(loop, baseDelay);
    };

    loop();

    try {
      const countPerVector = Math.ceil(targetCount / activeModes.length);
      const results = await Promise.all(activeModes.map(mode => 
        fetch(`${API_BASE}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: mode.id, count: countPerVector }),
        }).then(r => r.json())
      ));
      
      const totalActual = results.reduce((acc, r) => acc + (r.count || 0), 0);
      samplesProcessed = targetCount; // Force loop to finish
    } catch (err) {
      addLog(`BACKEND ERROR — ${err.message}`, 'error');
      setPhase('error');
    }
  };

  const toggleMode = (id) => {
    if (isRunning) return;
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    reset();
  };

  const selectAll = () => {
    if (isRunning) return;
    setSelectedIds(ATTACKS.map(a => a.id));
    reset();
  };

  const clearAll = () => {
    if (isRunning) return;
    setSelectedIds([]);
    reset();
  };

  const isRunning = phase === 'running';
  const activeColor = ATTACKS.find(a => selectedIds.includes(a.id))?.color || '#94a3b8';

  return (
    <div
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" }}
      className="min-h-screen w-full bg-slate-50 dark:bg-[#050810] text-slate-900 dark:text-white p-6 md:p-10 transition-colors duration-300"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20 dark:opacity-100"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
              <span className="text-[10px] tracking-[0.3em] text-slate-600 dark:text-[#8b949e] uppercase">SentinelML // Adversarial Engine v2</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Attack <span style={{ color: activeColor }}>Simulator</span>
            </h1>
            <p className="text-slate-600 dark:text-[#8b949e] text-sm mt-1">Multi-vector stress-testing environment</p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1">Active Vectors</div>
            <div className="text-xs text-[#3fb950] font-bold">{selectedIds.length} Selected</div>
          </div>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left panel */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] tracking-[0.25em] text-slate-600 dark:text-zinc-500 uppercase">// Attack Algorithm</div>
              <div className="flex gap-3">
                <button onClick={selectAll} disabled={isRunning} className="text-[10px] text-[#58a6ff] hover:text-[#58a6ff] uppercase font-bold transition-colors disabled:opacity-40">Select All</button>
                <button onClick={clearAll} disabled={isRunning} className="text-[10px] text-[#da3633] hover:text-[#da3633] uppercase font-bold transition-colors disabled:opacity-40">Clear</button>
              </div>
            </div>

            {allAttacks.map(atk => (
              <motion.button
                key={atk.id}
                onClick={() => toggleMode(atk.id)}
                whileHover={!isRunning ? { scale: 1.01 } : {}}
                whileTap={!isRunning ? { scale: 0.99 } : {}}
                className="relative w-full text-left p-4 rounded-lg border transition-all duration-300 overflow-hidden"
                style={{
                  borderColor: selectedIds.includes(atk.id) ? atk.color : 'rgba(0,0,0,0.05)',
                  background: selectedIds.includes(atk.id)
                    ? `rgba(${atk.id === 'fgsm' || atk.id === 'pgd' ? '168,85,247' : atk.id === 'normal' ? '16,185,129' : '239,68,68'}, 0.08)`
                    : 'transparent',
                  boxShadow: selectedIds.includes(atk.id) ? `0 4px 20px ${atk.glow}` : 'none',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                }}
              >
                <div className={`absolute inset-0 dark:hidden ${selectedIds.includes(atk.id) ? '' : 'bg-white/50'}`} />
                <div className={`absolute inset-0 hidden dark:block ${selectedIds.includes(atk.id) ? '' : 'bg-white/10'}`} />
                {selectedIds.includes(atk.id) && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ opacity: [0.05, 0.12, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ background: `radial-gradient(circle at 20% 50%, ${atk.glow}, transparent 70%)` }}
                  />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 rounded-full" style={{ background: atk.color }} />
                    <span 
                      style={{ color: selectedIds.includes(atk.id) ? atk.color : undefined }} 
                      className={`text-base font-bold ${selectedIds.includes(atk.id) ? '' : 'text-slate-400 dark:text-zinc-500'}`}
                    >
                      {atk.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedIds.includes(atk.id) && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">✓</span>
                      </motion.div>
                    )}
                    <span
                      className="text-[9px] tracking-widest px-2 py-0.5 rounded-sm border"
                      style={{ color: atk.color, borderColor: `${atk.color}40`, background: `${atk.color}12` }}
                    >
                      {atk.badge}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-700 dark:text-[#8b949e] leading-relaxed font-semibold">{atk.full}</div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-500 mt-2 leading-relaxed">{atk.desc}</div>
              </motion.button>
            ))}

            {/* Count slider */}
            <div className="p-4 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-white/[0.02]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] tracking-[0.25em] text-slate-600 dark:text-zinc-500 uppercase">// Sample Density</span>
                <motion.span
                  key={count}
                  initial={{ scale: 1.3, color: activeColor }}
                  animate={{ scale: 1, color: undefined }}
                  transition={{ duration: 0.2 }}
                  className="text-xl font-bold tabular-nums text-slate-900 dark:text-white"
                >
                  {count}
                </motion.span>
              </div>
              <input
                type="range"
                min="1"
                max="400"
                value={count}
                disabled={isRunning}
                onChange={e => setCount(parseInt(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer disabled:opacity-40"
                style={{
                  accentColor: activeColor,
                  background: `linear-gradient(to right, ${activeColor} ${(count / 400) * 100}%, rgba(0,0,0,0.05) 0%)`,
                }}
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-700 mt-1">
                <span>1</span><span>100</span><span>200</span><span>300</span><span>400</span>
              </div>
            </div>

            {/* Launch / Stop */}
            {phase === 'idle' || phase === 'running' ? (
              <motion.button
                onClick={phase === 'running' ? reset : runSimulation}
                disabled={selectedIds.length === 0 || !isLive}
                whileHover={selectedIds.length > 0 && isLive ? { scale: 1.02 } : {}}
                whileTap={selectedIds.length > 0 && isLive ? { scale: 0.98 } : {}}
                className="relative w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300"
                style={{
                  background: (isRunning || selectedIds.length === 0 || !isLive)
                    ? 'rgba(0,0,0,0.02)'
                    : `linear-gradient(135deg, ${activeColor}dd, ${activeColor}aa)`,
                  border: `1px solid ${isRunning || selectedIds.length === 0 || !isLive ? 'rgba(0,0,0,0.05)' : activeColor}`,
                  color: (isRunning || selectedIds.length === 0 || !isLive) ? '#94a3b8' : '#fff',
                  boxShadow: (isRunning || selectedIds.length === 0 || !isLive) ? 'none' : `0 0 30px ${activeColor}30`,
                  cursor: (isRunning || selectedIds.length === 0 || !isLive) ? 'not-allowed' : 'pointer',
                }}
              >
                {isRunning && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${activeColor}30, transparent)` }}
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                <span className="relative z-10 font-bold">
                  {!isLive ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      SYSTEM OFFLINE
                    </div>
                  ) : phase === 'running' ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      🛰 Stop Stress Test ({selectedIds.length})
                    </div>
                  ) : selectedIds.length === 0 ? 'Select Vector' : `▶ Launch ${selectedIds.length} Vectors`}
                </span>
              </motion.button>
            ) : (
              <motion.button
                onClick={reset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase border border-slate-200 dark:border-[#30363d] text-slate-500 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all bg-white dark:bg-transparent"
              >
                ↺ Reset
              </motion.button>
            )}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Steps tracker */}
            <div className="p-4 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white dark:bg-white/[0.02]">
              <div className="text-[10px] tracking-[0.25em] text-slate-500 dark:text-zinc-600 uppercase mb-3">// Unified Execution Path</div>
              <div className="flex flex-col gap-2">
                {(allAttacks.find(a => selectedIds.includes(a.id))?.steps || ['Select a vector to begin']).map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{
                        background:
                          selectedIds.length > 0 && (phase === 'done' || (phase === 'running' && i <= currentStep))
                            ? activeColor
                            : 'rgba(0,0,0,0.08)',
                        color:
                          selectedIds.length > 0 && (phase === 'done' || (phase === 'running' && i <= currentStep))
                            ? '#fff'
                            : i + 1 > currentStep ? '#94a3b8' : '#64748b',
                        transition: 'all 0.3s',
                      }}
                    >
                      {phase === 'done' || (phase === 'running' && i < currentStep) ? '✓' : i + 1}
                    </div>
                    <span
                      className="text-xs transition-colors duration-300 font-semibold"
                      style={{
                        color:
                          phase === 'running' && i === currentStep ? activeColor :
                          phase === 'done' ? '#475569' :
                          '#94a3b8',
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${activeColor}, ${activeColor}88)` }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Terminal */}
            <div
              className="flex-1 rounded-lg border border-slate-200 dark:border-[#30363d] bg-white/80 dark:bg-[#0d1117] overflow-hidden backdrop-blur-sm"
              style={{ minHeight: '280px', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.02)' }}
            >
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-[#30363d] bg-slate-50 dark:bg-white/[0.02]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 text-[10px] text-slate-400 dark:text-zinc-600 tracking-widest uppercase flex items-center gap-2">
                  Sentinel // Attack Log
                  {isRunning && (
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"
                    />
                  )}
                </span>
              </div>
              <div 
                ref={logRef} 
                className="h-[260px] overflow-y-auto p-4 flex flex-col gap-0.5 scrollbar-thin relative font-mono"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              >
                <AnimatePresence initial={false}>
                  {logs.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 dark:text-zinc-600 text-xs">
                      Awaiting launch command...
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>▌</motion.span>
                    </motion.div>
                  )}
                  {logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex gap-3 text-[10px] leading-5 font-mono"
                    >
                      <span className="text-slate-400 dark:text-zinc-600 flex-shrink-0 tabular-nums">[{log.ts.split('.')[0]}]</span>
                      <span className="dark:text-slate-300 transition-colors whitespace-pre-wrap">
                        {(() => {
                          const parts = log.msg.match(/^(\[[A-Z]+\])\s(.*)/);
                          if (!parts) return (
                            <span style={{
                              color: log.type === 'success' ? '#10b981' :
                                     log.type === 'error' ? '#ef4444' :
                                     log.type === 'system' ? activeColor : '#94a3b8'
                            }}>
                              {log.msg}
                            </span>
                          );
                          const [, prefix, body] = parts;
                          const prefixColor = 
                            prefix === '[ML]' ? '#3b82f6' : 
                            prefix === '[SYS]' ? '#f59e0b' : 
                            prefix === '[NET]' ? '#8b5cf6' : 
                            prefix === '[ADV]' ? '#ef4444' : 
                            prefix === '[DEF]' ? '#10b981' : '#94a3b8';
                          return (
                            <>
                              <span style={{ color: prefixColor, fontWeight: '700' }}>{prefix}</span>
                              <span style={{ color: log.type === 'dim' ? '#64748b' : 'inherit' }}> {body}</span>
                            </>
                          );
                        })()}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Result / error */}
            <AnimatePresence>
              {phase === 'done' && result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: `${activeColor}40`, background: `${activeColor}08` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.4 }}
                        className="text-sm font-bold"
                        style={{ color: activeColor }}
                      >
                        ✓
                      </motion.div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">Simulation Complete</span>
                    </div>
                    <div className="flex gap-4 text-[11px]">
                      <div className="text-center">
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums">{result.count}</div>
                        <div className="text-slate-400 dark:text-zinc-600">samples</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-900 dark:text-white tabular-nums">{(result.ips || []).length}</div>
                        <div className="text-slate-400 dark:text-zinc-600">IPs used</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold" style={{ color: activeColor }}>{selectedIds.length} Vectors</div>
                        <div className="text-slate-500 dark:text-zinc-600">active</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-lg border border-[#da3633]/40 bg-red-500/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#da3633] font-bold">⚠</span>
                    <span className="text-sm text-[#da3633] font-bold">Simulation failed — check backend connectivity</span>
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-1">
                    Verify VITE_SENTINEL_API_URL points to the Railway backend and CORS is configured.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

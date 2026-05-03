import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Maximize2, RefreshCw } from 'lucide-react';

const AttackGraph = () => {
  const svgRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  // BUG-4: Fetch from correct endpoint with correct field mapping
  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/v1/forensics/events');
      const logs = await resp.json();

      const nodes = [{ id: 'Elyaitra RAG', group: 'target', radius: 30 }];
      const links = [];
      const seenNodes = new Set(['Elyaitra RAG']);

      // Only process last 50 events for graph clarity
      logs.slice(0, 50).forEach(log => {
        const ip = log.ip || 'Unknown';
        // BUG-4: use attack_type and mitre_technique (not mitre_id)
        const attackType = log.attack_type || 'unknown_attack';
        const mitre = log.mitre_technique || 'Unknown Technique';

        if (!seenNodes.has(ip)) {
          nodes.push({ id: ip, group: 'attacker', radius: 15 });
          seenNodes.add(ip);
        }

        if (!seenNodes.has(attackType)) {
          nodes.push({ id: attackType, group: 'attack_type', radius: 12 });
          seenNodes.add(attackType);
        }

        if (!seenNodes.has(mitre)) {
          nodes.push({ id: mitre, group: 'technique', radius: 10 });
          seenNodes.add(mitre);
        }

        // BUG-4: IP → attack_type → MITRE technique → Target
        links.push({ source: ip, target: attackType, value: 1 });
        links.push({ source: attackType, target: mitre, value: 1 });
        links.push({ source: mitre, target: 'Elyaitra RAG', value: 2 });
      });

      setData({ nodes, links });
    } catch (err) {
      console.error('Failed to fetch graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // BUG-5: Correct dependency array and ResizeObserver cleanup
  useEffect(() => {
    if (!data.nodes.length || !svgRef.current) return;

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 500;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: 100%;');

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    const link = svg.append('g')
      .attr('stroke', '#ffffff22')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', d => {
        if (d.group === 'target') return '#00D4FF';
        if (d.group === 'attacker') return '#FF4B4B';
        if (d.group === 'attack_type') return '#FFB800';  // amber for attack type
        return '#A855F7'; // purple for mitre technique
      })
      .attr('filter', 'drop-shadow(0 0 6px rgba(0,212,255,0.3))');

    node.append('text')
      .text(d => d.id.length > 20 ? d.id.slice(0, 18) + '…' : d.id)
      .attr('x', d => d.radius + 4)
      .attr('y', 4)
      .attr('fill', '#8b949e')
      .style('font-size', '10px')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // BUG-5: ResizeObserver with proper cleanup
    const ro = new ResizeObserver(() => {
      if (!svgRef.current) return;
      const w = svgRef.current.clientWidth;
      const h = svgRef.current.clientHeight;
      svg.attr('viewBox', [0, 0, w, h]);
      simulation.force('center', d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
    });
    if (svgRef.current) ro.observe(svgRef.current);

    return () => {
      simulation.stop();
      ro.disconnect();
    };
  }, [data.nodes.length, data.links.length]); // BUG-5: use lengths not deep obj

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden border-white/[0.05] shadow-lg">
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-[#0d1117]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400">
            <Maximize2 size={18} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Adversarial Topology Graph</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">IP → Attack Type → MITRE Technique → Target</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] inline-block" /> Attacker</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] inline-block" /> Attack Type</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] inline-block" /> MITRE TTP</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00D4FF] inline-block" /> Target</span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-[#080808]/40 overflow-hidden">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span className="text-xs text-slate-400 uppercase tracking-widest">Compiling Graph...</span>
            </div>
          </div>
        )}
        {!loading && data.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm italic">
            No attack data — seed demo events first.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackGraph;

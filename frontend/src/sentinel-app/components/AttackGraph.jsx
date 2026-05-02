import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Maximize2, RefreshCw } from 'lucide-react';

const AttackGraph = () => {
  const svgRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/sentinel-api/traffic-feed');
      const logs = await resp.json();
      
      const nodes = [{ id: 'SentinelOne RAG', group: 'target', radius: 30 }];
      const links = [];
      const seenNodes = new Set(['SentinelOne RAG']);
      
      // Only process last 50 events for graph clarity
      logs.slice(0, 50).forEach(log => {
        const ip = log.ip || 'Unknown';
        const mitre = log.mitre_id || 'Unknown';
        
        if (!seenNodes.has(ip)) {
          nodes.push({ id: ip, group: 'attacker', radius: 15 });
          seenNodes.add(ip);
        }
        
        if (!seenNodes.has(mitre)) {
          nodes.push({ id: mitre, group: 'technique', radius: 10 });
          seenNodes.add(mitre);
        }
        
        // Link Attacker -> Technique
        links.push({ source: ip, target: mitre, value: 1 });
        // Link Technique -> Target
        links.push({ source: mitre, target: 'SentinelOne RAG', value: 2 });
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

  useEffect(() => {
    if (!data.nodes.length || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = 500;
    
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => {
        if (d.group === 'target') return "#00D4FF";
        if (d.group === 'attacker') return "#FF4B4B";
        return "#FFB800";
      })
      .attr("filter", "drop-shadow(0 0 5px rgba(0,212,255,0.3))");

    node.append("text")
      .text(d => d.id)
      .attr("x", 12)
      .attr("y", 4)
      .attr("fill", "#8b949e")
      .style("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
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

    return () => simulation.stop();
  }, [data]);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden border-white/[0.05] shadow-lg">
      <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-[#0d1117]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-400">
            <Maximize2 size={18} />
          </div>
          <h3 className="font-bold text-lg text-white">Adversarial Topology Graph</h3>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
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
      </div>
    </div>
  );
};

export default AttackGraph;

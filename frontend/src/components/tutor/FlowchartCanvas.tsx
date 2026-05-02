import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Download,
  RefreshCw,
  GitBranch,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlowNode {
  id: string;
  type: "start" | "process" | "decision" | "end";
  label: string;
  children?: string[];
  position?: { x: number; y: number };
}

const mockFlowchart: FlowNode[] = [
  { id: "1", type: "start", label: "Start Learning", children: ["2"] },
  { id: "2", type: "process", label: "Read Notes", children: ["3"] },
  { id: "3", type: "decision", label: "Understand?", children: ["4", "5"] },
  { id: "4", type: "process", label: "Ask AI Tutor", children: ["3"] },
  { id: "5", type: "process", label: "Practice with Flashcards", children: ["6"] },
  { id: "6", type: "decision", label: "Mastered?", children: ["7", "5"] },
  { id: "7", type: "end", label: "Complete!" },
];

const nodeStyles = {
  start: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
  process: "bg-primary/20 border-primary/50 text-primary",
  decision: "bg-amber-500/20 border-amber-500/50 text-amber-300 rotate-45",
  end: "bg-rose-500/20 border-rose-500/50 text-rose-300",
};

const nodeShapes = {
  start: "rounded-full",
  process: "rounded-lg",
  decision: "rounded-lg",
  end: "rounded-full",
};

const FlowchartCanvas = () => {
  const [zoom, setZoom] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
  const handleReset = () => setZoom(100);

  const handleExport = () => {
    // Simulate export
    alert("Flowchart exported as PNG!");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Flowchart</h3>
            <p className="text-xs text-muted-foreground">Auto-generated from notes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{zoom}%</Badge>
          <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
            <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-none h-8 w-8" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto p-8 bg-muted/20">
        <div
          className="min-h-full flex flex-col items-center gap-4 transition-transform origin-top"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Flowchart Nodes */}
          {mockFlowchart.map((node, index) => (
            <div key={node.id} className="flex flex-col items-center">
              {/* Node */}
              <div
                onClick={() => setSelectedNode(node.id)}
                className={cn(
                  "relative flex items-center justify-center border-2 cursor-pointer transition-all hover:scale-105",
                  nodeShapes[node.type],
                  nodeStyles[node.type],
                  selectedNode === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  node.type === "decision" ? "w-28 h-28" : "px-6 py-3 min-w-[140px]"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium text-center",
                    node.type === "decision" && "-rotate-45"
                  )}
                >
                  {node.label}
                </span>
              </div>

              {/* Connector */}
              {node.children && node.children.length > 0 && (
                <div className="flex flex-col items-center my-2">
                  {node.type === "decision" ? (
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">No</span>
                        <ArrowDown className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-1">Yes</span>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-0.5 h-4 bg-muted-foreground/50" />
                      <ArrowDown className="w-5 h-5 text-muted-foreground -mt-1" />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
            <span className="text-xs text-muted-foreground">Start/End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/30 border border-primary/50" />
            <span className="text-xs text-muted-foreground">Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500/30 border border-amber-500/50 rotate-45" />
            <span className="text-xs text-muted-foreground">Decision</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartCanvas;

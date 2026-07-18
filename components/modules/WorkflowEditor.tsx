import { Button } from '@/components/ui/button';
import { DAGEngine, ExecutionLog, WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/utils/dag-engine';
import { YYC3_DESIGN } from '@/utils/design-system';
import { Code, Database, GitBranch, Play, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useState } from 'react';

/** Map DAG node types to their visual representation. */
const NODE_TYPE_CONFIG: Record<WorkflowNode['type'], { icon: React.ElementType; color: string; label: string }> = {
  text_input: { icon: Zap, color: 'bg-emerald-900/40 text-emerald-300', label: 'INPUT' },
  llm_process: { icon: Code, color: 'bg-blue-900/40 text-blue-300', label: 'LLM' },
  image_gen: { icon: Database, color: 'bg-purple-900/40 text-purple-300', label: 'IMAGE' },
  audio_synth: { icon: GitBranch, color: 'bg-pink-900/40 text-pink-300', label: 'AUDIO' },
  output: { icon: GitBranch, color: 'bg-yellow-900/40 text-yellow-300', label: 'OUTPUT' },
};

/** Default workflow graph used as initial state. */
const DEFAULT_GRAPH: WorkflowGraph = {
  nodes: [
    { id: '1', type: 'text_input', label: 'On User Message', config: { value: 'Hello, analyze this request' }, position: { x: 50, y: 100 } },
    { id: '2', type: 'llm_process', label: 'Analyze Intent', config: {}, position: { x: 300, y: 100 } },
    { id: '3', type: 'image_gen', label: 'Generate Cover', config: {}, position: { x: 550, y: 50 } },
    { id: '4', type: 'output', label: 'Return Response', config: {}, position: { x: 550, y: 150 } },
  ],
  edges: [
    { id: 'e1', source: '1', target: '2' },
    { id: 'e2', source: '2', target: '3' },
    { id: 'e3', source: '2', target: '4' },
  ],
};

/** Edge path coordinates computed from node positions. */
function computeEdgePath(
  edges: WorkflowEdge[],
  nodes: WorkflowNode[]
): { id: string; d: string }[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  return edges.map(edge => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return { id: edge.id, d: '' };
    const sx = (src.position?.x ?? 0) + 160; // right edge center
    const sy = (src.position?.y ?? 0) + 40;  // vertical center
    const tx = (tgt.position?.x ?? 0);
    const ty = (tgt.position?.y ?? 0) + 40;
    const cx1 = sx + (tx - sx) / 2;
    return { id: edge.id, d: `M ${sx} ${sy} C ${cx1} ${sy}, ${cx1} ${ty}, ${tx} ${ty}` };
  });
}

export function WorkflowEditor({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [graph, setGraph] = useState<WorkflowGraph>(DEFAULT_GRAPH);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [engineStatus, setEngineStatus] = useState<string>('ENGINE READY');

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setLogs([]);
    setEngineStatus('EXECUTING...');

    const engine = new DAGEngine(graph);
    const result = await engine.execute();

    setLogs(result.logs);
    setEngineStatus(result.success ? 'EXECUTION COMPLETE' : 'EXECUTION FAILED');
    setIsRunning(false);
  }, [graph]);

  const edgePaths = computeEdgePath(graph.edges, graph.nodes);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 ${YYC3_DESIGN.blur.glass} p-4`}
        >
          <div className="w-full max-w-6xl h-[80vh] bg-[#080c14] border border-emerald-500/30 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(16,185,129,0.1)] flex flex-col">

            {/* Toolbar */}
            <div className="h-14 border-b border-white/10 bg-black/40 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <GitBranch className="w-5 h-5" />
                  <span className="font-mono font-bold tracking-widest uppercase">Workflow Engine</span>
                </div>
                <div className="h-4 w-[1px] bg-white/20" />
                <span className="text-xs text-white/40 font-mono">DAG_Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-emerald-500/50 text-emerald-400 hover:bg-emerald-950"
                  onClick={handleRun}
                  disabled={isRunning}
                >
                  <Play className="w-3 h-3 mr-2" /> {isRunning ? 'Running...' : 'Run DAG'}
                </Button>
                <Button size="sm" variant="ghost" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#10b98120_1px,transparent_1px)] [background-size:20px_20px] cursor-grab active:cursor-grabbing">
              {/* Connection Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {edgePaths.map(ep => (
                  <path key={ep.id} d={ep.d} fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.5" />
                ))}
              </svg>

              {/* Nodes */}
              {graph.nodes.map(node => {
                const typeConfig = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG.text_input;
                return (
                  <motion.div
                    key={node.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_e, info) => {
                      setGraph(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === node.id
                            ? { ...n, position: { x: (n.position?.x ?? 0) + info.offset.x, y: (n.position?.y ?? 0) + info.offset.y } }
                            : n
                        ),
                      }));
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1, x: node.position?.x ?? 0, y: node.position?.y ?? 0 }}
                    className="absolute w-40 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl"
                  >
                    {/* Node Header */}
                    <div className={`p-2 rounded-t-lg flex items-center gap-2 border-b border-white/5 ${typeConfig.color}`}>
                      <typeConfig.icon className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{typeConfig.label}</span>
                    </div>

                    {/* Node Body */}
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-200">{node.label}</p>
                      <p className="text-[9px] text-gray-500 mt-1 font-mono">ID: {node.id}</p>
                    </div>

                    {/* Ports */}
                    <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-gray-800 border border-gray-600 rounded-full" />
                    <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-gray-800 border border-gray-600 rounded-full" />
                  </motion.div>
                );
              })}
            </div>

            {/* Footer / Execution Logs */}
            <div className="max-h-32 bg-black border-t border-white/10 overflow-y-auto">
              {logs.length > 0 ? (
                <div className="p-2 space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-mono">
                      <span className={`w-2 h-2 rounded-full ${log.status === 'completed' ? 'bg-emerald-500' :
                          log.status === 'failed' ? 'bg-red-500' :
                            log.status === 'running' ? 'bg-yellow-500 animate-pulse' :
                              log.status === 'skipped' ? 'bg-gray-500' : 'bg-gray-700'
                        }`} />
                      <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-gray-400">{log.nodeId}</span>
                      <span className={`${log.status === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                        {log.status.toUpperCase()}
                      </span>
                      {log.error && <span className="text-red-400 truncate max-w-[200px]">{log.error}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-8 flex items-center justify-between px-4 text-[10px] font-mono text-gray-500">
                  <div>ZOOM: 100% | NODES: {graph.nodes.length} | EDGES: {graph.edges.length}</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {engineStatus}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

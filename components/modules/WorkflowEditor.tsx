import { Button } from '@/components/ui/button';
import { GestureContainer } from '@/components/ui/GestureContainer';
import { useTranslation } from '@/src/i18n';
import { WorkflowDef } from '@/types';
import { DAGEngine, ExecutionLog, WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/utils/dag-engine';
import { CheckCircle, Clock, Code, Database, GitBranch, Layers, Play, Plus, Settings, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useCallback, useMemo, useState } from 'react';

/** Map DAG node types to their visual representation. */
const NODE_TYPE_CONFIG: Record<WorkflowNode['type'], { icon: React.ElementType; color: string; label: string }> = {
  text_input: { icon: Zap, color: 'bg-emerald-900/40 text-emerald-300', label: 'INPUT' },
  llm_process: { icon: Code, color: 'bg-blue-900/40 text-blue-300', label: 'LLM' },
  image_gen: { icon: Database, color: 'bg-purple-900/40 text-purple-300', label: 'IMAGE' },
  audio_synth: { icon: GitBranch, color: 'bg-pink-900/40 text-pink-300', label: 'AUDIO' },
  output: { icon: CheckCircle, color: 'bg-yellow-900/40 text-yellow-300', label: 'OUTPUT' },
};

/** Preset workflow graphs keyed by id. Allows multi-workflow switching on canvas. */
function buildPresetGraph(id: number, t: (k: string) => string): WorkflowGraph {
  const inputLabel = t('workflow.steps.inputParser');
  const llmLabel = t('workflow.steps.llmProcess');
  const outputLabel = t('workflow.steps.output');
  // ID-specific graphs: give each preset a distinct shape.
  if (id === 2) {
    // Data pipeline: 5 nodes, branching
    return {
      nodes: [
        { id: '1', type: 'text_input', label: inputLabel, config: {}, position: { x: 40, y: 120 } },
        { id: '2', type: 'llm_process', label: llmLabel, config: {}, position: { x: 280, y: 120 } },
        { id: '3', type: 'image_gen', label: 'Embed', config: {}, position: { x: 520, y: 40 } },
        { id: '4', type: 'image_gen', label: 'Store', config: {}, position: { x: 520, y: 200 } },
        { id: '5', type: 'output', label: outputLabel, config: {}, position: { x: 760, y: 120 } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' },
        { id: 'e3', source: '2', target: '4' },
        { id: 'e4', source: '3', target: '5' },
        { id: 'e5', source: '4', target: '5' },
      ],
    };
  }
  if (id === 3) {
    // CI/CD: 12 steps collapsed to 6 for canvas clarity
    return {
      nodes: [
        { id: '1', type: 'text_input', label: inputLabel, config: {}, position: { x: 40, y: 120 } },
        { id: '2', type: 'llm_process', label: 'Lint', config: {}, position: { x: 260, y: 60 } },
        { id: '3', type: 'llm_process', label: 'Test', config: {}, position: { x: 260, y: 180 } },
        { id: '4', type: 'image_gen', label: 'Build', config: {}, position: { x: 480, y: 120 } },
        { id: '5', type: 'audio_synth', label: 'Sign', config: {}, position: { x: 700, y: 60 } },
        { id: '6', type: 'output', label: outputLabel, config: {}, position: { x: 700, y: 180 } },
      ],
      edges: [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '1', target: '3' },
        { id: 'e3', source: '2', target: '4' },
        { id: 'e4', source: '3', target: '4' },
        { id: 'e5', source: '4', target: '5' },
        { id: 'e6', source: '4', target: '6' },
      ],
    };
  }
  if (id === 4) {
    // Content moderation: 2 nodes
    return {
      nodes: [
        { id: '1', type: 'text_input', label: inputLabel, config: {}, position: { x: 80, y: 120 } },
        { id: '2', type: 'output', label: outputLabel, config: {}, position: { x: 400, y: 120 } },
      ],
      edges: [{ id: 'e1', source: '1', target: '2' }],
    };
  }
  // Default (id === 1): Security Audit - 3 node linear
  return {
    nodes: [
      { id: '1', type: 'text_input', label: inputLabel, config: {}, position: { x: 80, y: 120 } },
      { id: '2', type: 'llm_process', label: llmLabel, config: {}, position: { x: 360, y: 120 } },
      { id: '3', type: 'output', label: outputLabel, config: {}, position: { x: 640, y: 120 } },
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
    ],
  };
}

/** Compute SVG cubic bezier path between connected nodes. */
function computeEdgePath(edges: WorkflowEdge[], nodes: WorkflowNode[]): { id: string; d: string }[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  return edges.map(edge => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return { id: edge.id, d: '' };
    const sx = (src.position?.x ?? 0) + 160;
    const sy = (src.position?.y ?? 0) + 40;
    const tx = (tgt.position?.x ?? 0);
    const ty = (tgt.position?.y ?? 0) + 40;
    const cx1 = sx + (tx - sx) / 2;
    return { id: edge.id, d: `M ${sx} ${sy} C ${cx1} ${sy}, ${cx1} ${ty}, ${tx} ${ty}` };
  });
}

interface WorkflowEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSwitcher?: () => void;
}

export function WorkflowEditor({ isOpen, onClose, onShowSwitcher }: WorkflowEditorProps) {
  const { t } = useTranslation();
  const [workflows] = useState<WorkflowDef[]>([
    { id: 1, name: t('workflow.securityAudit'), steps: 3, status: 'active', lastRun: '2m ago', successRate: '98%' },
    { id: 2, name: t('workflow.dataPipeline'), steps: 5, status: 'idle', lastRun: '1h ago', successRate: '100%' },
    { id: 3, name: t('workflow.cicdDeploy'), steps: 12, status: 'failed', lastRun: '4h ago', successRate: '92%' },
    { id: 4, name: t('workflow.contentModeration'), steps: 2, status: 'active', lastRun: 'Just now', successRate: '99%' },
  ]);

  const [activeWorkflow, setActiveWorkflow] = useState<number>(1);
  const [graph, setGraph] = useState<WorkflowGraph>(() => buildPresetGraph(1, t));
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [engineStatus, setEngineStatus] = useState<string>('ENGINE READY');

  const edgePaths = useMemo(() => computeEdgePath(graph.edges, graph.nodes), [graph.edges, graph.nodes]);

  const handleSelect = useCallback((id: number) => {
    setActiveWorkflow(id);
    setGraph(buildPresetGraph(id, t));
    setLogs([]);
    setEngineStatus('ENGINE READY');
  }, [t]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    setEngineStatus('EXECUTING...');

    const engine = new DAGEngine(graph);
    const validation = engine.validate();
    if (!validation.valid) {
      setEngineStatus('VALIDATION FAILED');
      setIsRunning(false);
      return;
    }

    const result = await engine.execute();
    setLogs(result.logs);
    setEngineStatus(result.success ? 'EXECUTION COMPLETE' : 'EXECUTION FAILED');
    setIsRunning(false);
  }, [graph, isRunning]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <GestureContainer
            onClose={onClose}
            onMenu={() => onShowSwitcher && onShowSwitcher()}
            className="relative z-10 w-full h-full md:max-w-6xl md:h-[85vh] flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full h-full bg-[#080c14]/80 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col pointer-events-auto relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-emerald-500/20 bg-linear-to-r from-emerald-950/30 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <GitBranch className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-widest text-white font-mono">{t('workflow.title')}</h2>
                    <div className="text-[10px] font-mono text-emerald-500/60 tracking-[0.2em] mt-1 uppercase">{t('workflow.protocol')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span>{engineStatus}</span>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Sidebar: multi-workflow list (from WorkflowPanel) */}
                <div className="w-full md:w-72 border-r border-white/5 bg-black/30 flex flex-col">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{t('workflow.availableFlows')}</span>
                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {workflows.map(wf => (
                      <button
                        key={wf.id}
                        onClick={() => handleSelect(wf.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden ${activeWorkflow === wf.id
                          ? 'bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-1.5 relative z-10">
                          <span className={`font-bold font-mono text-xs ${activeWorkflow === wf.id ? 'text-white' : 'text-gray-300'}`}>{wf.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${wf.status === 'active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                            wf.status === 'failed' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                              'text-gray-400 border-gray-500/30 bg-gray-500/10'
                            }`}>{wf.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono relative z-10">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {wf.steps}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wf.lastRun}</span>
                        </div>
                        {activeWorkflow === wf.id && <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canvas: real DAG editor (from WorkflowEditor) */}
                <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#10b98120_1px,transparent_1px)] [background-size:20px_20px] cursor-grab active:cursor-grabbing bg-[#0a0f16]">
                  {/* Connection Lines (SVG bezier) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edgePaths.map(ep => (
                      <path key={ep.id} d={ep.d} fill="none" stroke="#10b981" strokeWidth="2" strokeOpacity="0.5" />
                    ))}
                  </svg>

                  {/* Draggable Nodes */}
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
                        <div className={`p-2 rounded-t-lg flex items-center gap-2 border-b border-white/5 ${typeConfig.color}`}>
                          <typeConfig.icon className="w-3 h-3" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{typeConfig.label}</span>
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-medium text-gray-200">{node.label}</p>
                          <p className="text-[9px] text-gray-500 mt-1 font-mono">ID: {node.id}</p>
                        </div>
                        <div className="absolute top-1/2 -left-1.5 w-3 h-3 bg-gray-800 border border-gray-600 rounded-full" />
                        <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-gray-800 border border-gray-600 rounded-full" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer: Run button + Real Execution Logs (from WorkflowEditor) */}
              <div className="border-t border-white/10 bg-black/40">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
                    <span>NODES: {graph.nodes.length}</span>
                    <span>EDGES: {graph.edges.length}</span>
                    <span className="hidden md:inline">{t('workflow.successRate')}: {workflows.find(w => w.id === activeWorkflow)?.successRate ?? '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 border-emerald-500/50 text-emerald-400 hover:bg-emerald-950"
                      onClick={handleRun}
                      disabled={isRunning}
                    >
                      <Play className="w-3 h-3 mr-2" /> {isRunning ? t('workflow.executing') : t('workflow.execute')}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-9 text-gray-400">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Execution Logs */}
                <div className="max-h-32 overflow-y-auto border-t border-white/5">
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
                    <div className="h-8 flex items-center px-4 text-[10px] font-mono text-gray-500">
                      {t('workflow.log')}: —
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </GestureContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WorkflowEditor;

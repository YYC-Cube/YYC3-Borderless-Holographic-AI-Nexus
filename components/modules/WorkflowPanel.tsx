import { GestureContainer } from '@/components/ui/GestureContainer';
import { WorkflowDef } from '@/types';
import { DAGEngine, ExecutionLog, WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/utils/dag-engine';
import { Box, CheckCircle, Clock, GitBranch, Layers, Play, Plus, Settings, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
const bgImage = "/Family-AI-001.png";

interface WorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSwitcher?: () => void;
}

export function WorkflowPanel({ isOpen, onClose, onShowSwitcher }: WorkflowPanelProps) {
  const [workflows, _setWorkflows] = useState<WorkflowDef[]>([
    { id: 1, name: '安全审计 / Security Audit', steps: 3, status: 'active', lastRun: '2m ago', successRate: '98%' },
    { id: 2, name: '数据管道 / Data Pipeline', steps: 5, status: 'idle', lastRun: '1h ago', successRate: '100%' },
    { id: 3, name: 'CI/CD 部署 / CI/CD Deploy', steps: 12, status: 'failed', lastRun: '4h ago', successRate: '92%' },
    { id: 4, name: '内容审查 / Content Moderation', steps: 2, status: 'active', lastRun: 'Just now', successRate: '99%' },
  ]);

  const [activeWorkflow, setActiveWorkflow] = useState<number | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const buildDemoGraph = (_wfId: number): WorkflowGraph => {
    const nodes: WorkflowNode[] = [
      { id: 'input_1', type: 'text_input', label: '输入解析 / Input Parser', config: {} },
      { id: 'llm_1', type: 'llm_process', label: 'LLM 处理 / LLM Process', config: { model: 'llama3' } },
      { id: 'output_1', type: 'output', label: '结果输出 / Output', config: {} },
    ];
    const edges: WorkflowEdge[] = [
      { id: 'e1', source: 'input_1', target: 'llm_1' },
      { id: 'e2', source: 'llm_1', target: 'output_1' },
    ];
    return { nodes, edges };
  };

  const handleRun = useCallback(async (id: number) => {
    if (isExecuting) {
      toast.info("工作流执行中 / Workflow Running", { description: "请等待当前执行完成 / Please wait for current execution to finish." });
      return;
    }

    toast.info(`正在初始化工作流 #${id}... / Initializing Workflow...`, {
      description: "DAG 引擎正在验证拓扑排序 / DAG engine validating topological sort.",
      icon: <Zap className="w-4 h-4 text-pink-400" />
    });

    setIsExecuting(true);
    setExecutionLogs([]);

    const graph = buildDemoGraph(id);
    const engine = new DAGEngine(graph);

    const validation = engine.validate();
    if (!validation.valid) {
      toast.error("DAG 验证失败 / DAG Validation Failed", { description: validation.error });
      setIsExecuting(false);
      return;
    }

    // Simulate step-by-step execution for visual feedback
    const nodes = graph.nodes;
    const newLogs: ExecutionLog[] = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      newLogs.push({ nodeId: node.id, status: 'running', timestamp: Date.now() });
      setExecutionLogs([...newLogs]);

      // Simulate processing time
      await new Promise(r => setTimeout(r, 800 + Math.random() * 400));

      newLogs[i] = { nodeId: node.id, status: 'completed', output: `${node.label} 完成`, timestamp: Date.now() };
      setExecutionLogs([...newLogs]);
    }

    setIsExecuting(false);
    toast.success("执行完成 / Execution Complete", { description: "DAG 工作流已成功执行 / DAG workflow executed successfully." });
  }, [isExecuting]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover grayscale mix-blend-overlay" />
            <div className="absolute inset-0 bg-linear-to-t from-[#050a10] via-transparent to-transparent" />
          </div>

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
              className="w-full h-full bg-[#050a10]/60 border border-pink-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(236,72,153,0.15)] flex flex-col pointer-events-auto relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-pink-500/20 bg-linear-to-r from-pink-950/30 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                    <GitBranch className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-widest text-white font-mono">工作流引擎 / WORKFLOW_ENGINE</h2>
                    <div className="text-[10px] font-mono text-pink-500/60 tracking-[0.2em] mt-1 uppercase">Automation Protocol V2.1</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>系统正常 / SYSTEM NORMAL</span>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Sidebar List */}
                <div className="w-full md:w-80 border-r border-white/5 bg-black/20 flex flex-col">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">可用流程 / Available Flows</span>
                    <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {workflows.map(wf => (
                      <button
                        key={wf.id}
                        onClick={() => setActiveWorkflow(wf.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${activeWorkflow === wf.id
                          ? 'bg-pink-900/20 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <span className={`font-bold font-mono text-sm ${activeWorkflow === wf.id ? 'text-white' : 'text-gray-300'}`}>{wf.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase border ${wf.status === 'active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                            wf.status === 'failed' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                              'text-gray-400 border-gray-500/30 bg-gray-500/10'
                            }`}>{wf.status}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono relative z-10">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {wf.steps} Steps</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {wf.lastRun}</span>
                        </div>
                        {activeWorkflow === wf.id && <div className="absolute inset-y-0 left-0 w-1 bg-pink-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 bg-[#0a0f16] relative overflow-hidden flex flex-col">
                  {/* Canvas Background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                  {activeWorkflow ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                      <div className="max-w-2xl w-full">
                        {/* Mock Node Graph */}
                        <div className="flex items-center justify-between relative">
                          {/* Connecting Line */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />

                          {[1, 2, 3].map((step) => (
                            <div key={step} className="flex flex-col items-center gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 bg-[#050a10] shadow-xl ${step === 1 ? 'border-emerald-500 text-emerald-500' :
                                step === 2 ? 'border-pink-500 text-pink-500' :
                                  'border-gray-700 text-gray-700'
                                }`}>
                                {step === 1 ? <Zap className="w-5 h-5" /> :
                                  step === 2 ? <Box className="w-5 h-5" /> :
                                    <CheckCircle className="w-5 h-5" />}
                              </div>
                              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-[#050a10] px-2">Step 0{step}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-16 bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white font-mono">执行详情 / EXECUTION DETAILS</h3>
                            <span className="text-xs text-pink-400 font-mono">ID: #{activeWorkflow}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-[10px] text-gray-500 uppercase mb-1">平均耗时 / Avg Runtime</div>
                              <div className="text-lg font-mono text-white">1.2s</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-[10px] text-gray-500 uppercase mb-1">成功率 / Success Rate</div>
                              <div className="text-lg font-mono text-emerald-400">98.5%</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <div className="text-[10px] text-gray-500 uppercase mb-1">预估成本 / Cost</div>
                              <div className="text-lg font-mono text-white">$0.002</div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleRun(activeWorkflow)}
                              disabled={isExecuting}
                              className="flex-1 py-3 bg-pink-600 hover:bg-pink-500 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-mono text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
                            >
                              {isExecuting ? (
                                <><Zap className="w-4 h-4 animate-spin" /> 执行中 / EXECUTING...</>
                              ) : (
                                <><Play className="w-4 h-4 fill-current" /> 执行工作流 / EXECUTE WORKFLOW</>
                              )}
                            </button>
                            <button className="px-4 py-3 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors">
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Execution Logs */}
                          {executionLogs.length > 0 && (
                            <div className="mt-6 space-y-2">
                              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">执行日志 / EXECUTION LOG</h4>
                              <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5">
                                {executionLogs.map((log, i) => (
                                  <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono ${log.status === 'running' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                    log.status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                                      log.status === 'failed' ? 'bg-red-500/10 border border-red-500/20' :
                                        'bg-white/5 border border-white/5'
                                    }`}>
                                    <span className={`w-2 h-2 rounded-full ${log.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                                      log.status === 'completed' ? 'bg-emerald-400' :
                                        'bg-red-400'
                                      }`} />
                                    <span className="text-gray-300 flex-1">{log.nodeId}</span>
                                    <span className={`uppercase tracking-wider ${log.status === 'running' ? 'text-yellow-400' :
                                      log.status === 'completed' ? 'text-emerald-400' :
                                        'text-red-400'
                                      }`}>{log.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-4">
                      <Layers className="w-16 h-16 opacity-20" />
                      <p className="font-mono text-sm">请选择工作流进行查看 / SELECT_WORKFLOW_TO_INSPECT</p>
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

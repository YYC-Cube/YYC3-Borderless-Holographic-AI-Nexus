import { Button } from '@/components/ui/button';
import { GestureContainer } from '@/components/ui/GestureContainer';
import { YYC3_DESIGN } from '@/utils/design-system';
import { Activity, ArrowLeft, Brain, CheckCircle, Cpu, Database, GitBranch, Network, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
const bgImage = "/Family-AI-001.png";

// --- Types ---
interface ModuleNode {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'active' | 'idle' | 'warning';
  x: number;
  y: number;
  color: string;
  size?: number; // Optional size override
}

interface IntelligentCenterProps {
  active: boolean;
  onClose: () => void;
  onLaunchModule: (moduleId: string) => void;
  onShowSwitcher?: () => void;
}

export function IntelligentCenter({ active, onClose, onLaunchModule, onShowSwitcher }: IntelligentCenterProps) {
  const [nodes, setNodes] = useState<ModuleNode[]>([
    { id: 'tasks', label: 'Task Pod', icon: CheckCircle, status: 'active', x: 25, y: 20, color: 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]' },
    { id: 'mcp_server', label: 'MCP Servers', icon: Database, status: 'active', x: 12, y: 50, color: 'text-orange-400 border-orange-500/50 bg-orange-900/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]' },
    { id: 'security', label: 'Security', icon: Shield, status: 'idle', x: 25, y: 80, color: 'text-blue-400 border-blue-500/50 bg-blue-900/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]' },

    { id: 'engine', label: 'Core Engine', icon: Cpu, status: 'active', x: 50, y: 50, color: 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20 shadow-[0_0_60px_rgba(6,182,212,0.3)]', size: 160 }, // Central Node

    { id: 'memory', label: 'Memory Stream', icon: Brain, status: 'idle', x: 75, y: 20, color: 'text-purple-400 border-purple-500/50 bg-purple-900/20 shadow-[0_0_30px_rgba(168,85,247,0.2)]' },
    { id: 'workflows', label: 'Workflows', icon: GitBranch, status: 'idle', x: 88, y: 50, color: 'text-pink-400 border-pink-500/50 bg-pink-900/20 shadow-[0_0_30px_rgba(236,72,153,0.2)]' },
    { id: 'neural_net', label: 'Neural Net', icon: Network, status: 'warning', x: 75, y: 80, color: 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]' },
  ]);

  // Simulated "Breathing" animation for nodes
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        x: n.id === 'engine' ? 50 : n.x + (Math.random() - 0.5) * 0.5,
        y: n.id === 'engine' ? 50 : n.y + (Math.random() - 0.5) * 0.5
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-40 bg-[#020408]/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden`}
        >
          {/* Background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
          </div>

          <GestureContainer
            onClose={onClose}
            onMenu={() => onShowSwitcher && onShowSwitcher()}
            className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto p-4 flex flex-col z-10"
          >
            {/* Close / Home Button (Gesture Area) */}
            <div className="absolute top-6 left-6 z-50 pointer-events-auto">
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-black/40 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-md"
                onClick={onClose}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> RETURN
              </Button>
            </div>

            {/* Header */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-4 z-10 mt-8"
            >
              <h2 className="text-3xl font-thin text-white tracking-[0.3em] uppercase font-mono">System Core</h2>
              <div className="flex justify-center items-center gap-4 text-cyan-500/60 text-[10px] font-mono mt-2">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> ONLINE</span>
                <span>|</span>
                <span>AI MODULES READY</span>
              </div>
            </motion.div>

            {/* Nodes Container */}
            <div className="relative flex-1 w-full pointer-events-auto">
              {/* Connecting Lines (SVG) - 50% Opacity */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                {/* Connections to Center Engine */}
                {/* Left Side */}
                <line x1="25%" y1="20%" x2="50%" y2="50%" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* Task Pod */}
                <line x1="12%" y1="50%" x2="50%" y2="50%" stroke="#f97316" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* MCP */}
                <line x1="25%" y1="80%" x2="50%" y2="50%" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* Security */}

                {/* Right Side */}
                <line x1="75%" y1="20%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* Memory */}
                <line x1="88%" y1="50%" x2="50%" y2="50%" stroke="#ec4899" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* Workflows */}
                <line x1="75%" y1="80%" x2="50%" y2="50%" stroke="#eab308" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" /> {/* Neural Net */}
              </svg>

              {nodes.map((node) => (
                <motion.button
                  key={node.id}
                  layout
                  initial={{ scale: 0 }}
                  animate={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    scale: 1,
                    transition: YYC3_DESIGN.physics.spring
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLaunchModule(node.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border backdrop-blur-md flex flex-col items-center justify-center gap-2 group transition-colors ${node.color}`}
                  style={{ width: node.size || 120, height: node.size || 120 }}
                >
                  <node.icon className={`${node.id === 'engine' ? 'w-12 h-12' : 'w-6 h-6'} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <span className="text-[10px] font-bold tracking-widest uppercase font-mono text-center px-2">{node.label}</span>

                  {/* Status Ring */}
                  <div className={`absolute inset-0 rounded-full border border-current opacity-20 ${node.status === 'active' ? 'animate-[spin_10s_linear_infinite]' : ''}`} style={{ borderStyle: 'dashed' }} />
                  <div className="absolute inset-[-4px] rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity scale-110" />

                  {/* Data Particles for Engine */}
                  {node.id === 'engine' && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-1/2 w-1 h-full bg-linear-to-b from-transparent via-cyan-400/50 to-transparent animate-[spin_4s_linear_infinite]" />
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-400/50 to-transparent animate-[spin_4s_linear_infinite]" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Footer Data Stream */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="h-12 border-t border-white/5 bg-black/40 backdrop-blur flex items-center px-6 overflow-hidden relative rounded-b-xl"
            >
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-r from-black to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-black to-transparent z-10" />

              <div className="flex gap-12 animate-[translateX_-50%_30s_linear_infinite] whitespace-nowrap text-[9px] font-mono text-cyan-500/40">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="contents">
                    <span>SYS_INTEGRITY: 100%</span>
                    <span>EXTERNAL_LINKS: ACTIVE</span>
                    <span>AI_MODELS: READY</span>
                    <span>RENDER_ENGINE: WEBGL2</span>
                    <span>LATENCY: 12ms</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </GestureContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

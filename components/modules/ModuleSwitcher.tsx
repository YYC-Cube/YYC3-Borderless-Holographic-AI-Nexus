import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Cpu, CheckCircle, Network, GitBranch, X } from 'lucide-react';

interface ModuleSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function ModuleSwitcher({ isOpen, onClose, onSelect }: ModuleSwitcherProps) {
  const modules = [
    { id: 'center', label: 'Intelligent Center', icon: Cpu, color: 'text-cyan-400' },
    { id: 'tasks', label: 'Task Pod', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 'mcp', label: 'MCP Servers', icon: Database, color: 'text-orange-400' },
    { id: 'workflow', label: 'Workflows', icon: GitBranch, color: 'text-pink-400' },
    { id: 'neural', label: 'AI Studio', icon: Network, color: 'text-yellow-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#0a0f18] border-t border-white/10 rounded-t-3xl p-6 pb-12 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono text-white/40 tracking-widest">SYSTEM_MODULES</span>
                <button onClick={onClose}><X className="w-5 h-5 text-white/40" /></button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {modules.map(mod => (
                    <button
                        key={mod.id}
                        onClick={() => { onSelect(mod.id); onClose(); }}
                        className="flex flex-col items-center gap-3 min-w-[80px] group"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors ${mod.color}`}>
                            <mod.icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-mono text-white/60 group-hover:text-white">{mod.label}</span>
                    </button>
                ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

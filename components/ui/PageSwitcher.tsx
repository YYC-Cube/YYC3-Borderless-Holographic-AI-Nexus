import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Database, Shield, Network, Cpu, LayoutGrid } from 'lucide-react';

interface PageSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (pageId: string) => void;
  currentPage: string | null;
}

export function PageSwitcher({ isOpen, onClose, onSwitch, currentPage }: PageSwitcherProps) {
  const pages = [
    { id: 'home', label: 'Home System', icon: LayoutGrid, color: 'text-cyan-400' },
    { id: 'tasks', label: 'Task Pod', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 'mcp', label: 'MCP Server', icon: Database, color: 'text-orange-400' },
    { id: 'workflow', label: 'Workflows', icon: Shield, color: 'text-blue-400' },
    { id: 'ai_gen', label: 'AI Studio', icon: Network, color: 'text-yellow-400' },
    { id: 'intelligent', label: 'Intelligent Center', icon: Cpu, color: 'text-purple-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#0a0f18] border-t border-cyan-500/30 rounded-t-3xl p-6 pb-10 shadow-[0_-10px_50px_rgba(8,145,178,0.2)]"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="grid grid-cols-3 gap-4">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    onSwitch(page.id);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${
                    currentPage === page.id 
                      ? 'bg-white/10 border-cyan-500/50 scale-105' 
                      : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`p-3 rounded-full bg-black/40 ${page.color}`}>
                    <page.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${currentPage === page.id ? 'text-white' : 'text-white/50'}`}>
                    {page.label}
                  </span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={onClose}
              className="mt-8 w-full py-3 flex items-center justify-center text-white/30 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, CheckCircle, Brain, GitBranch, Cpu, X, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pageId: string) => void;
  currentPage: string;
}

export function PageSelector({ isOpen, onClose, onSelect, currentPage }: PageSelectorProps) {
  const pages = [
    { id: 'intelligent_center', label: 'System Core', icon: Cpu, color: 'text-cyan-400' },
    { id: 'tasks', label: 'Task Pod', icon: CheckCircle, color: 'text-emerald-400' },
    { id: 'mcp_server', label: 'MCP Servers', icon: Database, color: 'text-orange-400' },
    { id: 'workflows', label: 'Workflows', icon: GitBranch, color: 'text-pink-400' },
    { id: 'ai_generator', label: 'AI Studio', icon: Brain, color: 'text-yellow-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) onClose();
          }}
          className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0a0f18] border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-8"
        >
          {/* Handle Bar */}
          <div className="w-full flex justify-center pt-3 pb-6" onClick={onClose}>
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          <div className="px-6 mb-6 flex justify-between items-center">
             <h3 className="text-sm font-mono text-white/50 tracking-widest flex items-center gap-2">
                <LayoutGrid className="w-4 h-4" /> MODULE SELECTOR
             </h3>
             <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/30 hover:text-white">
                <X className="w-4 h-4" />
             </Button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 px-4 overflow-x-auto pb-4">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  onSelect(page.id);
                  onClose();
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                  currentPage === page.id 
                    ? 'bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                    : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/5'
                }`}
              >
                <div className={`p-3 rounded-full bg-black/40 ${page.color}`}>
                  <page.icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono tracking-wider whitespace-nowrap ${currentPage === page.id ? 'text-white' : 'text-white/40'}`}>
                  {page.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { MODULE_REGISTRY } from '@/modules/registry';
import { useTranslation } from '@/src/i18n';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface PageSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (pageId: string) => void;
  currentPage: string | null;
}

export function PageSwitcher({ isOpen, onClose, onSwitch, currentPage }: PageSwitcherProps) {
  const { t } = useTranslation();
  // P2-B: page list now derived from the single-source-of-truth registry.
  // Adding a module no longer requires editing this component.
  const pages = MODULE_REGISTRY;

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

          {/* Drawer (with drag-to-close gesture merged from PageSelector) */}
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#0a0f18] border-t border-cyan-500/30 rounded-t-3xl p-6 pb-10 shadow-[0_-10px_50px_rgba(8,145,178,0.2)]"
          >
            {/* Handle Bar (drag indicator) */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            <div className="grid grid-cols-3 gap-4">
              {pages.map((page) => {
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSwitch(page.id);
                      onClose();
                    }}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all ${currentPage === page.id
                        ? 'bg-white/10 border-cyan-500/50 scale-105'
                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className={`p-3 rounded-full bg-black/40 ${page.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-mono uppercase tracking-wider ${currentPage === page.id ? 'text-white' : 'text-white/50'}`}>
                      {t(page.labelKey)}
                    </span>
                  </button>
                );
              })}
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

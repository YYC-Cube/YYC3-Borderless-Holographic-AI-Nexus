import { GestureContainer } from '@/components/ui/GestureContainer';
import { useGaze } from '@/hooks/useGaze';
import { useTranslation } from '@/src/i18n';
import { YYC3_DESIGN } from '@/utils/design-system';
import { Check, Clock, Mic, X } from 'lucide-react';
import { AnimatePresence, motion, PanInfo } from 'motion/react';
import { useEffect, useState } from 'react';
const bgImage = "/Family-AI-001.png";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  timestamp: number;
}

interface TaskPodProps {
  isOpen: boolean;
  onClose: () => void;
  transcript?: string; // For voice adding
  onShowSwitcher?: () => void;
}

export function TaskPod({ isOpen, onClose, transcript, onShowSwitcher }: TaskPodProps) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(() => [
    { id: '1', text: t('taskpod.initialTasks.0'), completed: true, timestamp: Date.now() },
    { id: '2', text: t('taskpod.initialTasks.1'), completed: false, timestamp: Date.now() },
  ]);

  // Handle voice commands
  useEffect(() => {
    if (!isOpen || !transcript) return;
    const lower = transcript.toLowerCase();
    const addKeyword = t('taskpod.commandAdd').toLowerCase();
    const remindKeyword = t('taskpod.commandRemind').toLowerCase();

    if (lower.includes(addKeyword) || lower.includes('add') || lower.includes(remindKeyword)) {
      const content = transcript.replace(new RegExp(`.*(${addKeyword}|add|${remindKeyword})`, 'i'), '').trim();
      if (content.length > 2) {
        const newTask = {
          id: Date.now().toString(),
          text: content,
          completed: false,
          timestamp: Date.now()
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTasks(prev => [...prev, newTask]);
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }
  }, [transcript, isOpen, t]);

  const handleSwipe = (id: string, info: PanInfo) => {
    if (info.offset.x > 100) {
      // Swipe Right -> Complete
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      if (navigator.vibrate) navigator.vibrate(20);
    } else if (info.offset.x < -100) {
      // Swipe Left -> Delete
      setTasks(prev => prev.filter(t => t.id !== id));
      if (navigator.vibrate) navigator.vibrate([30, 30]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
        >
          {/* Background */}
          <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
            <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
          </div>

          <GestureContainer
            onClose={onClose}
            onMenu={() => onShowSwitcher && onShowSwitcher()}
            className="relative w-full h-full flex flex-col items-center justify-center p-6 z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={YYC3_DESIGN.physics.spring}
              className="w-full max-w-md h-[80vh] flex flex-col items-center pointer-events-auto bg-[#05080e]/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl"
            >
              {/* Header Area */}
              <div className="w-full mb-8 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-light text-emerald-400 tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  {t('taskpod.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task Floating Grid */}
              <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-20 relative">
                <AnimatePresence>
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onSwipe={handleSwipe} />
                  ))}
                </AnimatePresence>

                {tasks.length === 0 && (
                  <div className="text-center text-white/20 mt-20 font-mono text-sm">
                    {t('taskpod.empty')}
                  </div>
                )}
              </div>

              {/* Bottom Voice Hint */}
              <div className="absolute bottom-6 flex flex-col items-center gap-2 opacity-50 shrink-0">
                <Mic className="w-5 h-5 animate-pulse text-emerald-400" />
                <span className="text-[10px] text-emerald-200/50 font-mono">{t('taskpod.voiceHint')}</span>
              </div>
            </motion.div>
          </GestureContainer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TaskCard({ task, onSwipe }: { task: Task, onSwipe: (id: string, info: PanInfo) => void }) {
  // Integrate Gaze
  const { isGazing, progress, gazeBindings } = useGaze({
    onGazeLock: () => {
      // Visual feedback handled by state
    }
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0, scale: isGazing ? 1.05 : 1 }}
      exit={{ opacity: 0, height: 0 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, info) => onSwipe(task.id, info)}
      {...gazeBindings}
      className={`relative w-full p-5 rounded-xl border backdrop-blur-md transition-colors group cursor-grab active:cursor-grabbing select-none ${task.completed
        ? 'bg-emerald-900/10 border-emerald-500/20 text-emerald-100/50'
        : 'bg-white/5 border-white/10 text-white'
        } ${isGazing ? 'border-emerald-400/50 shadow-[0_0_20px_rgba(52,211,153,0.2)]' : ''}`}
    >
      {/* Gaze Progress Indicator */}
      {progress > 0 && progress < 1 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-75"
          style={{ width: `${progress * 100}%` }}
        />
      )}

      <div className="flex items-start gap-4">
        <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/30'
          }`}>
          {task.completed && <Check className="w-3 h-3 text-black" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-light break-words ${task.completed ? 'line-through' : ''}`}>{task.text}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] opacity-40 font-mono">
            <Clock className="w-3 h-3" />
            {new Date(task.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Gesture Hints */}
      <div className="absolute inset-y-0 left-0 w-12 bg-linear-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-start pl-2 pointer-events-none">
        <X className="w-4 h-4 text-red-400" />
      </div>
      <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-l from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-end pr-2 pointer-events-none">
        <Check className="w-4 h-4 text-emerald-400" />
      </div>
    </motion.div>
  );
}

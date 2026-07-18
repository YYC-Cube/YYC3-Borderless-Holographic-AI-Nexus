import { useGaze } from '@/hooks/useGaze'; // Import useGaze
import { YYC3_DESIGN } from '@/utils/design-system'; // Import Design System
import { Eye, Maximize2, Mic, Sparkles, X } from 'lucide-react';
import { motion, PanInfo, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';

interface MultimodalArtifactProps {
  type: 'image' | 'text';
  content: string; // Image URL (base64) or Text string
  transcript?: string; // Real-time voice transcript
  messages?: unknown[]; // Optional message context for dynamic elements
  onClose?: () => void;
}

export function MultimodalArtifact({ type, content, transcript, messages, onClose }: MultimodalArtifactProps) {
  // --- Physics & Motion State ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-300, 300], [30, -30]), YYC3_DESIGN.physics.spring);
  const rotateY = useSpring(useTransform(x, [-300, 300], [-30, 30]), YYC3_DESIGN.physics.spring);
  const scale = useSpring(1, YYC3_DESIGN.physics.spring);

  // --- Interaction State ---
  const [activeLayer, setActiveLayer] = useState<'base' | 'meta' | 'analysis'>('base');

  // --- Gaze Hook Integration ---
  const { isGazing, gazeBindings } = useGaze({
    dwellTime: 800,
    onGazeLock: () => {
      if (navigator.vibrate) navigator.vibrate(10);
    }
  });

  // --- Haptics Helper ---
  const triggerHaptic = (pattern: 'light' | 'heavy' | 'success') => {
    if (!navigator.vibrate) return;
    switch (pattern) {
      case 'light': navigator.vibrate(10); break;
      case 'heavy': navigator.vibrate(40); break;
      case 'success': navigator.vibrate([20, 50, 20]); break;
    }
  };

  // --- Voice Command Processing ---
  useEffect(() => {
    if (!transcript) return;
    const cmd = transcript.toLowerCase();

    // Voice + Context Fusion: Only works if we are interacting or gazing
    // In this version, we assume if the artifact is open, it receives commands
    if (cmd.includes('放大') || cmd.includes('enhance')) {
      scale.set(1.5);
      triggerHaptic('success');
    } else if (cmd.includes('缩小') || cmd.includes('reset')) {
      scale.set(1);
      triggerHaptic('light');
    } else if (cmd.includes('关闭') || cmd.includes('close')) {
      if (onClose) onClose();
      triggerHaptic('heavy');
    } else if (cmd.includes('分析') || cmd.includes('analyze')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveLayer('analysis');
      triggerHaptic('success');
    } else if (cmd.includes('详情') || cmd.includes('details')) {
      setActiveLayer('meta');
      triggerHaptic('light');
    }
  }, [transcript, scale, onClose]);

  // --- Gesture Handlers ---
  const handlePan = (_e: PointerEvent, info: PanInfo) => {
    x.set(info.offset.x);
    y.set(info.offset.y);
    triggerHaptic('light');
  };

  const handlePanEnd = () => {
    x.set(0);
    y.set(0);
    triggerHaptic('heavy'); // Snap back feel
  };

  // If only messages are provided (used as dynamic background container), render nothing or custom logic
  // This is to support the usage in ResponsiveAIAssistant line 673: <MultimodalArtifact messages={messages} />
  if (messages && !content) {
    return null; // Or render floating background artifacts if desired
  }

  // Safety check
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 ${YYC3_DESIGN.blur.glass} perspective-1000`}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {/* 3D Container */}
      <motion.div
        style={{ x, y, rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        {...gazeBindings} // Spread Gaze Bindings
        className="relative w-80 h-[500px] md:w-96 cursor-grab active:cursor-grabbing"
      >
        {/* Visual Feedback for Modes */}
        {isGazing && (
          <motion.div
            layoutId="gaze-cursor"
            className="absolute -top-10 left-1/2 -translate-x-1/2 text-cyan-400 text-xs tracking-widest uppercase flex items-center gap-1"
          >
            <Eye className="w-3 h-3 animate-pulse" />
            Gaze Locked
          </motion.div>
        )}

        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-16 left-0 right-0 text-center"
          >
            <span className="bg-white/10 px-4 py-1 rounded-full text-xs text-white/80 backdrop-blur-md flex items-center gap-2 w-fit mx-auto border border-white/20">
              <Mic className="w-3 h-3 animate-pulse text-red-400" />
              {transcript}
            </span>
          </motion.div>
        )}

        {/* The Crystal Card */}
        <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-[#0f172a]/90 transition-all duration-500 ${isGazing ? 'shadow-[0_0_30px_rgba(34,211,238,0.3)] border-cyan-500/50' : ''}`}>

          {/* Content Layer */}
          <div className="absolute inset-0 z-10 p-6 flex flex-col">
            {type === 'image' ? (
              <img src={`data:image/jpeg;base64,${content}`} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center text-slate-200 font-light text-lg p-4 border border-white/5 rounded-2xl bg-black/20">
                {content}
              </div>
            )}
          </div>

          {/* Meta Layer (Revealed by Gaze or Voice) */}
          <motion.div
            initial={false}
            animate={{ opacity: activeLayer === 'meta' || isGazing ? 1 : 0 }}
            className="absolute inset-0 z-20 pointer-events-none bg-linear-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6"
          >
            <h3 className="text-white font-bold text-lg translate-y-2">Memory Artifact #042</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">VISUAL</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">ENCRYPTED</span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Captured via Temporal Link.
              <br />Use voice to "Analyze" or "Enhance".
            </p>
          </motion.div>

          {/* Analysis Layer (Triggered by Voice) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: activeLayer === 'analysis' ? 1 : 0 }}
            className="absolute inset-0 z-30 bg-cyan-900/10 backdrop-blur-[2px] p-6 grid grid-cols-2 gap-2 pointer-events-none"
          >
            <div className="border border-cyan-500/30 rounded bg-cyan-900/20" />
            <div className="border border-cyan-500/30 rounded bg-cyan-900/20" />
            <div className="border border-cyan-500/30 rounded bg-cyan-900/20 col-span-2 row-span-2 flex items-center justify-center text-cyan-400 font-mono text-xs tracking-widest animate-pulse">
              ANALYZING STRUCTURAL INTEGRITY...
            </div>
          </motion.div>

          {/* Gloss/Reflection Effect */}
          <div className="absolute inset-0 z-40 bg-linear-to-tr from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Floating Controls (Fallback for non-voice/gesture users) */}
        <div className="absolute -right-16 top-10 flex flex-col gap-4">
          <button onClick={() => scale.set(1.5)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveLayer('analysis')} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors">
            <Sparkles className="w-4 h-4" />
          </button>
          {onClose && (
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur flex items-center justify-center text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </motion.div>
    </motion.div>
  );
}

import { motion } from 'motion/react';
import React from 'react';

/**
 * 3D visual theme: holographic globe.
 *
 * Props are compatible with CubeVisual so the main stage can swap
 * between <CubeVisual /> and <GlobeVisual /> without adapter code.
 * Unknown states fall back to 'idle'.
 */
type VisualState = 'idle' | 'listening' | 'processing' | 'speaking' | 'loading_tts';

interface GlobeVisualProps {
  state: VisualState;
  onClick?: () => void;
  /** Reserved for parity with CubeVisual; currently unused. */
  analyserNode?: AnalyserNode | null;
}

const globeImage = '/placeholder.jpg';

const stateColor: Record<VisualState, string> = {
  idle: 'rgba(6, 182, 212, 0.4)',       // Cyan
  listening: 'rgba(239, 68, 68, 0.6)',  // Red
  processing: 'rgba(168, 85, 247, 0.7)', // Purple
  speaking: 'rgba(34, 197, 94, 0.6)',   // Green
  loading_tts: 'rgba(234, 179, 8, 0.6)', // Yellow
};

export const GlobeVisual = React.memo(function GlobeVisual({ state, onClick }: GlobeVisualProps) {
  const glow = stateColor[state] ?? stateColor.idle;

  return (
    <motion.div
      className="relative w-72 h-72 flex items-center justify-center cursor-grab active:cursor-grabbing"
      role="button"
      aria-label={`Globe visual core, state: ${state}`}
      onTap={onClick}
    >
      {/* Outer Holographic Rings */}
      <motion.div
        className="absolute inset-0 border border-cyan-500/30 rounded-full"
        style={{ width: '140%', height: '140%', left: '-20%', top: '-20%' }}
        animate={{
          rotate: 360,
          scale: state === 'listening' ? [1, 1.05, 1] : 1
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      <motion.div
        className="absolute inset-0 border border-blue-500/20 dashed rounded-full"
        style={{ width: '120%', height: '120%', left: '-10%', top: '-10%', borderStyle: 'dashed' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ backgroundColor: glow }}
        animate={{
          opacity: state === 'speaking' ? [0.2, 0.5, 0.2] : 0.25,
          scale: state === 'speaking' ? [0.8, 1.1, 0.8] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* The Globe Image */}
      <motion.div
        className="relative z-10 w-48 h-48 lg:w-64 lg:h-64"
        animate={{
          y: [0, -10, 0],
          scale: state === 'listening' ? 1.05 : 1,
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.3 },
        }}
      >
        <img
          src={globeImage}
          alt="Holographic Globe"
          className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
        />
      </motion.div>

      {/* Scanning Line Effect */}
      <motion.div
        className="absolute w-full h-1 bg-cyan-400/30 z-20 top-0"
        style={{ boxShadow: '0 0 10px rgba(34,211,238,0.5)' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  );
});

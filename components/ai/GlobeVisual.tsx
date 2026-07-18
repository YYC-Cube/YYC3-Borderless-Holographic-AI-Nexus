import { motion } from 'motion/react';
import React from 'react';
const globeImage = '/placeholder.jpg';

interface GlobeVisualProps {
  state: 'idle' | 'listening' | 'speaking';
}

export const GlobeVisual = React.memo(function GlobeVisual({ state }: GlobeVisualProps) {
  return (
    <div className="relative flex items-center justify-center">
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
        className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl"
        animate={{
          opacity: state === 'speaking' ? [0.2, 0.5, 0.2] : 0.2,
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
    </div>
  );
});

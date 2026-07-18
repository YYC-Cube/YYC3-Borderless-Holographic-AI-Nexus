import { motion } from 'motion/react';
import React from 'react';

export const VoiceVisualizer = React.memo(function VoiceVisualizer({ isListening }: { isListening: boolean }) {
  if (!isListening) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-cyan-400 rounded-full"
          animate={{
            height: ["8px", "24px", "8px"],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

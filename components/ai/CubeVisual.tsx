import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface CubeVisualProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'loading_tts';
  onClick?: () => void;
  analyserNode?: AnalyserNode | null; // Receive AnalyserNode for visualization
}

export const CubeVisual = React.memo(function CubeVisual({ state, onClick, analyserNode }: CubeVisualProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  // Motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [30, -30]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-30, 30]), { stiffness: 150, damping: 20 });

  const glowColors = {
    idle: 'rgba(6, 182, 212, 0.4)',      // Cyan
    listening: 'rgba(239, 68, 68, 0.6)',  // Red
    processing: 'rgba(168, 85, 247, 0.7)', // Purple
    speaking: 'rgba(34, 197, 94, 0.6)',    // Green
    loading_tts: 'rgba(234, 179, 8, 0.6)'  // Yellow
  };

  const coreColors = {
    idle: '#06b6d4',
    listening: '#ef4444',
    processing: '#a855f7',
    speaking: '#22c55e',
    loading_tts: '#eab308'
  };

  // --- Audio Visualization Loop ---
  useEffect(() => {
    if (!canvasRef.current || !analyserNode) {
      // Clear canvas if no audio
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, 300, 300);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use reduced FFT size for simpler visualization
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80; // Should match cube shadow/base size

      ctx.beginPath();

      // Draw circular frequency bars
      for (let i = 0; i < bufferLength; i++) {
        // Only use lower frequencies (bass/vocals) which look better
        if (i > 60) break;

        const barHeight = dataArray[i] / 2; // Scale down
        const angle = (i / 60) * Math.PI * 2;

        // Convert polar to cartesian
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        // Mirror it for symmetry
        const angle2 = angle + Math.PI;
        const x1_m = centerX + Math.cos(angle2) * radius;
        const y1_m = centerY + Math.sin(angle2) * radius;
        const x2_m = centerX + Math.cos(angle2) * (radius + barHeight);
        const y2_m = centerY + Math.sin(angle2) * (radius + barHeight);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.moveTo(x1_m, y1_m);
        ctx.lineTo(x2_m, y2_m);
      }

      ctx.strokeStyle = coreColors[state] || '#fff';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyserNode, state]);

  return (
    <motion.div
      className="relative w-72 h-72 flex items-center justify-center perspective-1000 cursor-grab active:cursor-grabbing"
      role="button"
      aria-label={`Cube visual core, state: ${state}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onTap={onClick}
      style={{ perspective: 1000 }}
    >
      {/* Visualizer Canvas Layer (Behind Cube) */}
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-60"
        style={{ filter: 'blur(4px)' }}
      />

      {/* Interactive Drag Area */}
      <motion.div
        className="relative w-32 h-32 preserve-3d"
        style={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
        }}
        animate={!isHovered ? {
          rotateX: state === 'idle' ? [15, 375] : [0, 360],
          rotateY: state === 'idle' ? [15, 375] : [0, -360],
          scale: state === 'listening' ? 1.1 : state === 'loading_tts' ? 0.9 : 1
        } : undefined}
        transition={{
          rotateX: { duration: 20, repeat: Infinity, ease: "linear" },
          rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 0.5 }
        }}
        drag
        dragElastic={0.1}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDrag={(event, info) => {
          x.set(info.offset.x);
          y.set(info.offset.y);
        }}
        onDragEnd={() => {
          x.set(0);
          y.set(0);
        }}
      >
        {/* Cube Faces */}
        {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => {
          const transforms = {
            front: 'translateZ(64px)',
            back: 'rotateY(180deg) translateZ(64px)',
            right: 'rotateY(90deg) translateZ(64px)',
            left: 'rotateY(-90deg) translateZ(64px)',
            top: 'rotateX(90deg) translateZ(64px)',
            bottom: 'rotateX(-90deg) translateZ(64px)',
          };

          return (
            <div
              key={face}
              className="absolute inset-0 border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center transition-all duration-500"
              style={{
                transform: transforms[face as keyof typeof transforms],
                boxShadow: `inset 0 0 20px ${glowColors[state] || glowColors.idle}`,
                borderColor: state === 'listening' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30">
                <div className="border-r border-b border-white/30"></div>
                <div className="border-b border-white/30"></div>
                <div className="border-r border-white/30"></div>
                <div></div>
              </div>

              {state === 'processing' && (
                <div className="absolute inset-0 bg-purple-500/20 animate-pulse"></div>
              )}
              {state === 'loading_tts' && (
                <div className="absolute inset-0 bg-yellow-500/20 animate-pulse"></div>
              )}
            </div>
          );
        })}

        {/* Internal Core (The "Soul") */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full blur-md animate-pulse transition-colors duration-500"
          style={{
            transform: 'translateZ(0px)',
            backgroundColor: coreColors[state] || coreColors.idle
          }}
        />
      </motion.div>

      {/* Dynamic Shadow (Fallback if no audio) */}
      {!analyserNode && (
        <motion.div
          className="absolute -bottom-24 w-40 h-10 blur-2xl rounded-[100%]"
          animate={{
            backgroundColor: glowColors[state] || glowColors.idle,
            scale: state === 'listening' ? 1.2 : 1,
            opacity: 0.4
          }}
        />
      )}
    </motion.div>
  );
});

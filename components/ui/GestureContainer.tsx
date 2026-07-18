import React from 'react';
import { motion, PanInfo } from 'motion/react';
import { ChevronUp } from 'lucide-react';

interface GestureContainerProps {
  children: React.ReactNode;
  onClose: () => void;
  onMenu?: () => void;
  className?: string;
}

export function GestureContainer({ children, onClose, onMenu, className = "" }: GestureContainerProps) {
  const handlePanEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;

    // Horizontal Swipe (Back)
    if (Math.abs(offset.x) > swipeThreshold && Math.abs(velocity.x) > 0.5) {
        onClose();
    }

    // Vertical Swipe Up (Switcher)
    if (offset.y < -swipeThreshold && Math.abs(velocity.y) > 0.5) {
        if (onMenu) onMenu();
    }
  };

  return (
    <motion.div 
      className={className}
      onPanEnd={handlePanEnd}
    >
       {children}
       {/* Gesture Hint - Absolute positioned at bottom */}
       <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center pointer-events-none z-50">
            <div className="flex flex-col items-center gap-1 opacity-30 animate-pulse">
                <ChevronUp className="w-4 h-4 text-white" />
                <div className="w-16 h-1 bg-white/20 rounded-full" />
            </div>
       </div>
    </motion.div>
  )
}

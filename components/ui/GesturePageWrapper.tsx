import { motion } from 'motion/react';
import React from 'react';
import { usePanelGestures } from '../ai/usePanelGestures';

interface GesturePageWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  onShowSwitcher?: () => void;
  className?: string;
}

export function GesturePageWrapper({ children, onClose, onShowSwitcher, className = '' }: GesturePageWrapperProps) {
  const { onTouchStart, onTouchEnd } = usePanelGestures({
    onClose,
    onShowSelector: onShowSwitcher
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed inset-0 z-50 overflow-hidden ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      {children}
    </motion.div>
  );
}

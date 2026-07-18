import { useRef } from 'react';

interface UsePanelGesturesProps {
  onClose: () => void;
  onShowSelector?: () => void;
  enableVertical?: boolean;
}

export function usePanelGestures({ onClose, onShowSelector }: UsePanelGesturesProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;

    // Horizontal Swipe (Back)
    if (Math.abs(deltaX) > 80 && Math.abs(deltaY) < 60) {
      onClose();
      return;
    }

    // Vertical Swipe Up (Page Selector)
    if (deltaY < -80 && Math.abs(deltaX) < 60) {
       if (onShowSelector) onShowSelector();
       return;
    }
    
    touchStartRef.current = null;
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}

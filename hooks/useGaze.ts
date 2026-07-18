import { useState, useRef, useCallback } from 'react';

interface GazeConfig {
    dwellTime?: number; // Time in ms to trigger gaze lock
    onGazeLock?: () => void;
    onGazeLost?: () => void;
}

export function useGaze(config: GazeConfig = {}) {
    const { dwellTime = 800, onGazeLock, onGazeLost } = config;
    const [isGazing, setIsGazing] = useState(false);
    const [progress, setProgress] = useState(0); // 0 to 1
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const frameRef = useRef<number | null>(null);

    const startGaze = useCallback(() => {
        startTimeRef.current = Date.now();
        setProgress(0);
        
        // Start animation loop for progress
        const animate = () => {
            if (!startTimeRef.current) return;
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min(elapsed / dwellTime, 1);
            setProgress(newProgress);

            if (newProgress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };
        frameRef.current = requestAnimationFrame(animate);

        timerRef.current = setTimeout(() => {
            setIsGazing(true);
            if (navigator.vibrate) navigator.vibrate(20);
            if (onGazeLock) onGazeLock();
        }, dwellTime);
    }, [dwellTime, onGazeLock]);

    const endGaze = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        
        setIsGazing(false);
        setProgress(0);
        startTimeRef.current = null;
        if (onGazeLost) onGazeLost();
    }, [onGazeLost]);

    // Return bindings to spread onto elements
    const gazeBindings = {
        onPointerEnter: startGaze,
        onPointerLeave: endGaze,
        onPointerDown: endGaze, // Interaction usually breaks gaze wait
        // Touch alternatives
        onTouchStart: startGaze,
        onTouchEnd: endGaze
    };

    return { isGazing, progress, gazeBindings };
}

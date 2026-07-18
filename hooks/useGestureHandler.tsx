import { Activity, CheckCircle, Moon, Sparkles, Sun } from "lucide-react";
import { PanInfo } from "motion/react";
import { useRef } from "react";
import { toast } from "sonner";
import type { PanelKey, UIState } from "./useUIState";

interface GestureHandlerState {
  textMode: boolean;
  showDebate: boolean;
  showConfig: boolean;
  showHistory: boolean;
  showOrbitalMenu: boolean;
  inspectingArtifact: UIState['inspectingArtifact'];
  showIntelligentCenter: boolean;
  showTaskPod: boolean;
  showMCPServer: boolean;
  showWorkflow: boolean;
  showAIGenerator: boolean;
  themeColor: "cyan" | "red";
}

interface GestureHandlerActions {
  setPanel: (panel: PanelKey, open: boolean) => void;
  setMenuPosition: (x: number, y: number) => void;
  setShowGuide: (show: boolean) => void;
  setTextMode: (mode: boolean) => void;
  setThemeColor: (color: "cyan" | "red") => void;
}

interface GestureHandlerCallbacks {
  startListening: () => void;
  stopListening: () => void;
}

export function useGestureHandler(
  state: GestureHandlerState,
  actions: GestureHandlerActions,
  callbacks: GestureHandlerCallbacks,
) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    textMode, showDebate, showConfig, showHistory, showOrbitalMenu,
    inspectingArtifact, showIntelligentCenter, showTaskPod, showMCPServer,
    showWorkflow, showAIGenerator, themeColor,
  } = state;

  const { setPanel, setMenuPosition, setShowGuide, setTextMode, setThemeColor } = actions;
  const { startListening } = callbacks;

  const isBlocked = () =>
    textMode || showDebate || showConfig || showHistory || showOrbitalMenu ||
    !!inspectingArtifact || showIntelligentCenter || showTaskPod ||
    showMCPServer || showWorkflow || showAIGenerator;

  const handleTouchStart = (e: React.PointerEvent) => {
    if (isBlocked()) return;

    longPressTimerRef.current = setTimeout(() => {
      startListening();
      if (navigator.vibrate) navigator.vibrate(50);
    }, 600);

    tapCountRef.current += 1;
    if (tapCountRef.current === 2) {
      clearTimeout(longPressTimerRef.current!);
      longPressTimerRef.current = null;

      setPanel("showOrbitalMenu", true);
      setMenuPosition(e.clientX, e.clientY);
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 300);
    }
  };

  const handleNativeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && !inspectingArtifact && !showIntelligentCenter && !showTaskPod) {
      e.preventDefault();
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      setPanel("showOrbitalMenu", true);
      setMenuPosition(centerX, centerY);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePanEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isBlocked()) return;

    const threshold = 60;
    const x = info.offset.x;
    const y = info.offset.y;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    const isDiagonal = absX > threshold && absY > threshold;

    if (isDiagonal) {
      setShowGuide(false);
      if (navigator.vibrate) navigator.vibrate([20, 20]);

      if (x > 0 && y > 0) {
        setPanel("showTaskPod", true);
        toast("PROTOCOL: TASK_POD", {
          icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        });
      } else if (x < 0 && y > 0) {
        setPanel("showDebate", true);
        toast("PROTOCOL: DEBATE_MATRIX", {
          icon: <Activity className="w-4 h-4 text-pink-400" />,
        });
      } else if (x > 0 && y < 0) {
        toast("SESSION REBOOT", {
          description: "Context cleared.",
          icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
        });
      } else if (x < 0 && y < 0) {
        const newTheme = themeColor === "cyan" ? "red" : "cyan";
        setThemeColor(newTheme);
        toast(`SYSTEM THEME: ${newTheme.toUpperCase()}`, {
          icon:
            newTheme === "cyan" ? (
              <Moon className="w-4 h-4 text-cyan-400" />
            ) : (
              <Sun className="w-4 h-4 text-red-400" />
            ),
        });
      }
      return;
    }

    if (absY > absX && absY > threshold) {
      if (y < 0) {
        setTextMode(true);
        setShowGuide(false);
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        setPanel("showHistory", true);
        setShowGuide(false);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    } else if (absX > absY && absX > threshold) {
      if (x < 0) {
        setPanel("showIntelligentCenter", true);
        setShowGuide(false);
        if (navigator.vibrate) navigator.vibrate(20);
      } else {
        setPanel("showConfig", true);
        setShowGuide(false);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    }
  };

  return {
    handleTouchStart,
    handleNativeTouchStart,
    handleTouchEnd,
    handlePanEnd,
  };
}

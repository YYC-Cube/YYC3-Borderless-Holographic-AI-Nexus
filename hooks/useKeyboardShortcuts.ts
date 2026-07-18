import { useEffect } from "react";
import type { PanelKey, UIState } from "./useUIState";

interface KeyboardShortcutState {
  showConfig: boolean;
  showHistory: boolean;
  showDebate: boolean;
  showIntelligentCenter: boolean;
  showTaskPod: boolean;
  showMCPServer: boolean;
  showWorkflow: boolean;
  showAIGenerator: boolean;
  showOrbitalMenu: boolean;
  showPageSwitcher: boolean;
  inspectingArtifact: UIState['inspectingArtifact'];
  textMode: boolean;
}

interface KeyboardShortcutActions {
  setInspectingArtifact: (value: UIState['inspectingArtifact']) => void;
  setPanel: (panel: PanelKey, open: boolean) => void;
  setTextMode: (mode: boolean) => void;
}

export function useKeyboardShortcuts(
  state: KeyboardShortcutState,
  actions: KeyboardShortcutActions,
) {
  useEffect(() => {
    const {
      showConfig, showHistory, showDebate, showIntelligentCenter,
      showTaskPod, showMCPServer, showWorkflow, showAIGenerator,
      showOrbitalMenu, showPageSwitcher, inspectingArtifact, textMode,
    } = state;

    const { setInspectingArtifact, setPanel, setTextMode } = actions;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isAnyPanelOpen =
        showConfig || showHistory || showDebate || showIntelligentCenter ||
        showTaskPod || showMCPServer || showWorkflow || showAIGenerator ||
        showOrbitalMenu || showPageSwitcher || inspectingArtifact;

      // ESC: Close all panels / close inspecting artifact
      if (e.key === "Escape") {
        if (inspectingArtifact) {
          setInspectingArtifact(null);
        } else if (isAnyPanelOpen) {
          setPanel("showConfig", false);
          setPanel("showHistory", false);
          setPanel("showDebate", false);
          setPanel("showIntelligentCenter", false);
          setPanel("showTaskPod", false);
          setPanel("showMCPServer", false);
          setPanel("showWorkflow", false);
          setPanel("showAIGenerator", false);
          setPanel("showOrbitalMenu", false);
          setPanel("showPageSwitcher", false);
        }
        return;
      }

      // Ctrl+K / Cmd+K: Toggle page switcher
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPanel("showPageSwitcher", !showPageSwitcher);
        return;
      }

      // Ctrl+, / Cmd+,: Open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setPanel("showConfig", true);
        return;
      }

      // Ctrl+H / Cmd+H: Open history
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault();
        setPanel("showHistory", true);
        return;
      }

      // Ctrl+Shift+T: Toggle terminal/text mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
        e.preventDefault();
        setTextMode(!textMode);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.showConfig,
    state.showHistory,
    state.showDebate,
    state.showIntelligentCenter,
    state.showTaskPod,
    state.showMCPServer,
    state.showWorkflow,
    state.showAIGenerator,
    state.showOrbitalMenu,
    state.showPageSwitcher,
    state.inspectingArtifact,
    state.textMode,
    actions.setInspectingArtifact,
    actions.setPanel,
    actions.setTextMode,
  ]);
}

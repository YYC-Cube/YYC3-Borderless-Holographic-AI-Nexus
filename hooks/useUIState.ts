import { useCallback, useReducer } from 'react';

// ============================================================
// UI State — unified reducer for panel & UI state management
// ============================================================

/** Available 3D visual themes for the main stage. */
export type VisualTheme = 'cube' | 'globe';

const VISUAL_THEME_KEY = 'yyc3_visual_theme';

function loadVisualTheme(): VisualTheme {
  if (typeof window === 'undefined') return 'cube';
  try {
    const v = window.localStorage.getItem(VISUAL_THEME_KEY);
    return v === 'globe' ? 'globe' : 'cube';
  } catch {
    return 'cube';
  }
}

export interface UIState {
  // Panel visibility (10 panels)
  showConfig: boolean;
  showHistory: boolean;
  showDebate: boolean;
  showOrbitalMenu: boolean;
  showIntelligentCenter: boolean;
  showTaskPod: boolean;
  showMCPServer: boolean;
  showWorkflow: boolean;
  showAIGenerator: boolean;
  showPageSwitcher: boolean;
  // UI state
  menuPosition: { x: number; y: number };
  showGuide: boolean;
  textMode: boolean;
  themeColor: 'cyan' | 'red';
  visualTheme: VisualTheme;
  inspectingArtifact: { type: 'image' | 'text'; content: string } | null;
  isDragging: boolean;
  pendingImage: string | null;
  isMessageVisible: boolean;
  debateStatus: 'idle' | 'processing' | 'speaking';
}

export type PanelKey = 'showConfig' | 'showHistory' | 'showDebate' | 'showOrbitalMenu' | 'showIntelligentCenter' | 'showTaskPod' | 'showMCPServer' | 'showWorkflow' | 'showAIGenerator' | 'showPageSwitcher';

export type UIAction =
  | { type: 'SET_PANEL'; panel: PanelKey; value: boolean }
  | { type: 'CLOSE_ALL_PANELS' }
  | { type: 'SET_MENU_POSITION'; x: number; y: number }
  | { type: 'SET_SHOW_GUIDE'; value: boolean }
  | { type: 'SET_TEXT_MODE'; value: boolean }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME_COLOR'; value: 'cyan' | 'red' }
  | { type: 'SET_VISUAL_THEME'; value: VisualTheme }
  | { type: 'SET_INSPECTING_ARTIFACT'; value: UIState['inspectingArtifact'] }
  | { type: 'SET_IS_DRAGGING'; value: boolean }
  | { type: 'SET_PENDING_IMAGE'; value: string | null }
  | { type: 'SET_IS_MESSAGE_VISIBLE'; value: boolean }
  | { type: 'SET_DEBATE_STATUS'; value: UIState['debateStatus'] };

export const initialState: UIState = {
  showConfig: false,
  showHistory: false,
  showDebate: false,
  showOrbitalMenu: false,
  showIntelligentCenter: false,
  showTaskPod: false,
  showMCPServer: false,
  showWorkflow: false,
  showAIGenerator: false,
  showPageSwitcher: false,
  menuPosition: { x: 0, y: 0 },
  showGuide: true,
  textMode: false,
  themeColor: 'cyan',
  visualTheme: loadVisualTheme(),
  inspectingArtifact: null,
  isDragging: false,
  pendingImage: null,
  isMessageVisible: true,
  debateStatus: 'idle',
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_PANEL':
      return { ...state, [action.panel]: action.value };

    case 'CLOSE_ALL_PANELS':
      return {
        ...state,
        showConfig: false,
        showHistory: false,
        showDebate: false,
        showOrbitalMenu: false,
        showIntelligentCenter: false,
        showTaskPod: false,
        showMCPServer: false,
        showWorkflow: false,
        showAIGenerator: false,
        showPageSwitcher: false,
      };

    case 'SET_MENU_POSITION':
      return { ...state, menuPosition: { x: action.x, y: action.y } };

    case 'SET_SHOW_GUIDE':
      return { ...state, showGuide: action.value };

    case 'SET_TEXT_MODE':
      return { ...state, textMode: action.value };

    case 'TOGGLE_THEME':
      return { ...state, themeColor: state.themeColor === 'cyan' ? 'red' : 'cyan' };

    case 'SET_THEME_COLOR':
      return { ...state, themeColor: action.value };

    case 'SET_VISUAL_THEME': {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(VISUAL_THEME_KEY, action.value);
        }
      } catch {
        /* localStorage unavailable; ignore */
      }
      return { ...state, visualTheme: action.value };
    }

    case 'SET_INSPECTING_ARTIFACT':
      return { ...state, inspectingArtifact: action.value };

    case 'SET_IS_DRAGGING':
      return { ...state, isDragging: action.value };

    case 'SET_PENDING_IMAGE':
      return { ...state, pendingImage: action.value };

    case 'SET_IS_MESSAGE_VISIBLE':
      return { ...state, isMessageVisible: action.value };

    case 'SET_DEBATE_STATUS':
      return { ...state, debateStatus: action.value };

    default:
      return state;
  }
}

export function useUIState() {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const closeAllPanels = useCallback(() => dispatch({ type: 'CLOSE_ALL_PANELS' }), []);
  const setPanel = useCallback((panel: PanelKey, value: boolean) => dispatch({ type: 'SET_PANEL', panel, value }), []);
  const setMenuPosition = useCallback((x: number, y: number) => dispatch({ type: 'SET_MENU_POSITION', x, y }), []);
  const setShowGuide = useCallback((value: boolean) => dispatch({ type: 'SET_SHOW_GUIDE', value }), []);
  const setTextMode = useCallback((value: boolean) => dispatch({ type: 'SET_TEXT_MODE', value }), []);
  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const setThemeColor = useCallback((value: 'cyan' | 'red') => dispatch({ type: 'SET_THEME_COLOR', value }), []);
  const setVisualTheme = useCallback((value: VisualTheme) => dispatch({ type: 'SET_VISUAL_THEME', value }), []);
  const setInspectingArtifact = useCallback((value: UIState['inspectingArtifact']) => dispatch({ type: 'SET_INSPECTING_ARTIFACT', value }), []);
  const setIsDragging = useCallback((value: boolean) => dispatch({ type: 'SET_IS_DRAGGING', value }), []);
  const setPendingImage = useCallback((value: string | null) => dispatch({ type: 'SET_PENDING_IMAGE', value }), []);
  const setIsMessageVisible = useCallback((value: boolean) => dispatch({ type: 'SET_IS_MESSAGE_VISIBLE', value }), []);
  const setDebateStatus = useCallback((value: UIState['debateStatus']) => dispatch({ type: 'SET_DEBATE_STATUS', value }), []);

  const isAnyPanelOpen = state.showConfig || state.showHistory || state.showDebate ||
    state.showIntelligentCenter || state.showTaskPod || state.showMCPServer ||
    state.showWorkflow || state.showAIGenerator || state.showOrbitalMenu || state.showPageSwitcher;

  return {
    state,
    dispatch,
    closeAllPanels,
    setPanel,
    setMenuPosition,
    setShowGuide,
    setTextMode,
    toggleTheme,
    setThemeColor,
    setVisualTheme,
    setInspectingArtifact,
    setIsDragging,
    setPendingImage,
    setIsMessageVisible,
    setDebateStatus,
    isAnyPanelOpen,
  };
}

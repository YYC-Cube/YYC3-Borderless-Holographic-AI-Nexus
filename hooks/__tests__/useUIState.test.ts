import { beforeEach, describe, expect, it } from 'vitest';

import { initialState, uiReducer, type UIState } from '@/hooks/useUIState';

/**
 * P3-D2: tests for the UIState reducer (pure function).
 *
 * The reducer is the contract every UI action must respect. Testing it as a
 * pure function keeps the tests fast (no React render tree), deterministic
 * (no hook closure stale-state gotchas), and dependency-free (no
 * @testing-library/react install needed).
 *
 * Coverage focus: the P2-A visualTheme feature end-to-end — default value,
 * localStorage hydration side effect, transitions, and isolation from the
 * pre-existing themeColor state — plus regression checks on the unchanged
 * panel/theme primitives.
 */
describe('uiReducer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe('initialState', () => {
    it('should default visualTheme to "cube"', () => {
      // loadVisualTheme() reads localStorage at module load time, which
      // happens before this test runs. We assert on the exported snapshot
      // to lock the default; the hydration path is covered separately.
      expect(initialState.visualTheme).toBe('cube');
    });

    it('should start with all panels closed and cyan theme', () => {
      const expectedClosed: (keyof UIState)[] = [
        'showConfig',
        'showHistory',
        'showDebate',
        'showIntelligentCenter',
        'showTaskPod',
        'showMCPServer',
        'showWorkflow',
        'showAIGenerator',
      ];
      for (const key of expectedClosed) {
        expect(initialState[key]).toBe(false);
      }
      expect(initialState.themeColor).toBe('cyan');
    });
  });

  describe('SET_VISUAL_THEME', () => {
    it('should transition from cube to globe', () => {
      const next = uiReducer(initialState, { type: 'SET_VISUAL_THEME', value: 'globe' });
      expect(next.visualTheme).toBe('globe');
    });

    it('should transition back from globe to cube', () => {
      const globe = uiReducer(initialState, { type: 'SET_VISUAL_THEME', value: 'globe' });
      const cube = uiReducer(globe, { type: 'SET_VISUAL_THEME', value: 'cube' });
      expect(cube.visualTheme).toBe('cube');
    });

    it('should persist the value to localStorage under the canonical key', () => {
      uiReducer(initialState, { type: 'SET_VISUAL_THEME', value: 'globe' });
      expect(window.localStorage.getItem('yyc3_visual_theme')).toBe('globe');
    });

    it('should overwrite the stored value when switching back', () => {
      const s1 = uiReducer(initialState, { type: 'SET_VISUAL_THEME', value: 'globe' });
      uiReducer(s1, { type: 'SET_VISUAL_THEME', value: 'cube' });
      expect(window.localStorage.getItem('yyc3_visual_theme')).toBe('cube');
    });
  });

  describe('regression — pre-existing reducer behavior', () => {
    it('should toggle panel visibility via SET_PANEL', () => {
      const opened = uiReducer(initialState, { type: 'SET_PANEL', panel: 'showWorkflow', value: true });
      expect(opened.showWorkflow).toBe(true);
      expect(opened.showConfig).toBe(false);
    });

    it('should close every launchable panel via CLOSE_ALL_PANELS', () => {
      const opened = uiReducer(initialState, { type: 'SET_PANEL', panel: 'showTaskPod', value: true });
      const closed = uiReducer(opened, { type: 'CLOSE_ALL_PANELS' });
      expect(closed.showTaskPod).toBe(false);
      expect(closed.showWorkflow).toBe(false);
    });

    it('should toggle themeColor (cyan/red) via TOGGLE_THEME', () => {
      const red = uiReducer(initialState, { type: 'TOGGLE_THEME' });
      expect(red.themeColor).toBe('red');
      const cyanAgain = uiReducer(red, { type: 'TOGGLE_THEME' });
      expect(cyanAgain.themeColor).toBe('cyan');
    });

    it('should not let SET_VISUAL_THEME disturb panel state or themeColor', () => {
      const opened = uiReducer(initialState, { type: 'SET_PANEL', panel: 'showConfig', value: true });
      const themed = uiReducer(opened, { type: 'SET_PANEL', panel: 'showConfig', value: true });
      const afterTheme = uiReducer(themed, { type: 'SET_VISUAL_THEME', value: 'globe' });
      expect(afterTheme.showConfig).toBe(true);
      expect(afterTheme.themeColor).toBe('cyan');
      expect(afterTheme.visualTheme).toBe('globe');
    });

    it('should return the same state reference for unknown actions', () => {
      // Reducer must be total: unknown action types must not corrupt state.
      // Cast to satisfy the discriminated-union type for this negative test.
      const before = initialState;
      const after = uiReducer(before, { type: 'UNKNOWN' } as unknown as Parameters<typeof uiReducer>[1]);
      expect(after).toBe(before);
    });
  });
});

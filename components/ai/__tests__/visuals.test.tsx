import type { ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CubeVisual } from '@/components/ai/CubeVisual';
import { GlobeVisual } from '@/components/ai/GlobeVisual';

/**
 * P3-D3 + P3-C: visual theme compatibility & accessibility contract.
 *
 * The P2-A feature swaps <CubeVisual /> and <GlobeVisual /> at runtime based
 * on the user's visualTheme preference. This requires both components to
 * honor the same props contract, so the main stage can stay agnostic.
 *
 * These tests lock that contract:
 *   1. Both components accept the same prop shape (state + onClick + analyserNode).
 *   2. Both render an accessible role="button" with a state-aware aria-label.
 *   3. Both respond to every VisualState variant without crashing.
 *
 * We use react-dom/server's renderToStaticMarkup + DOMParser for querying.
 * jsdom provides document/window globals via vitest.config.ts.
 */

// --- Minimal render shim -----------------------------------------------------
// Parse the SSR markup into a DOM node we can query. This avoids requiring
// @testing-library/react as a new runtime dependency.
function renderToDOM(ui: React.ReactElement): { container: HTMLElement } {
  const html = renderToStaticMarkup(ui);
  const container = document.createElement('div');
  container.innerHTML = html;
  return { container };
}

function queryByRole(container: HTMLElement, role: string): Element | null {
  return container.querySelector(`[role="${role}"]`);
}

// --- Tests -------------------------------------------------------------------

type VisualState = 'idle' | 'listening' | 'processing' | 'speaking' | 'loading_tts';

const ALL_STATES: VisualState[] = ['idle', 'listening', 'processing', 'speaking', 'loading_tts'];

describe('Visual theme components', () => {
  describe('props contract (CubeVisual ≡ GlobeVisual)', () => {
    // Type-level check: both components must accept the exact same prop shape.
    // If this assignment fails to compile, the swap in ResponsiveAIAssistant
    // will throw at runtime.
    type CommonProps = {
      state: VisualState;
      onClick?: () => void;
      analyserNode?: AnalyserNode | null;
    };
    const _typeCheckCube: ComponentType<CommonProps> = CubeVisual;
    const _typeCheckGlobe: ComponentType<CommonProps> = GlobeVisual;
    // suppress "unused var" lint without disabling it globally.
    void _typeCheckCube;
    void _typeCheckGlobe;

    it('should both be defined and memoized', () => {
      expect(CubeVisual).toBeDefined();
      expect(GlobeVisual).toBeDefined();
      // React.memo wraps the component in a typeof check; we just ensure the
      // shape is a function/component.
      expect(typeof CubeVisual).toBe('object');
      expect(typeof GlobeVisual).toBe('object');
    });

    for (const state of ALL_STATES) {
      it(`CubeVisual should render without crashing for state="${state}"`, () => {
        const { container } = renderToDOM(<CubeVisual state={state} />);
        expect(container.firstChild).toBeTruthy();
      });

      it(`GlobeVisual should render without crashing for state="${state}"`, () => {
        const { container } = renderToDOM(<GlobeVisual state={state} />);
        expect(container.firstChild).toBeTruthy();
      });
    }
  });

  describe('accessibility (P3-C)', () => {
    it('CubeVisual should expose role="button" with state-aware aria-label', () => {
      const { container } = renderToDOM(<CubeVisual state="listening" />);
      const btn = queryByRole(container, 'button');
      expect(btn).not.toBeNull();
      expect(btn?.getAttribute('aria-label')).toContain('listening');
    });

    it('GlobeVisual should expose role="button" with state-aware aria-label', () => {
      const { container } = renderToDOM(<GlobeVisual state="processing" />);
      const btn = queryByRole(container, 'button');
      expect(btn).not.toBeNull();
      expect(btn?.getAttribute('aria-label')).toContain('processing');
      expect(btn?.getAttribute('aria-label')).toContain('Globe');
    });

    it('aria-label should change as the state prop changes (CubeVisual)', () => {
      const idle = renderToDOM(<CubeVisual state="idle" />);
      const speaking = renderToDOM(<CubeVisual state="speaking" />);
      const idleLabel = queryByRole(idle.container, 'button')?.getAttribute('aria-label');
      const speakingLabel = queryByRole(speaking.container, 'button')?.getAttribute('aria-label');
      expect(idleLabel).not.toBe(speakingLabel);
    });
  });
});

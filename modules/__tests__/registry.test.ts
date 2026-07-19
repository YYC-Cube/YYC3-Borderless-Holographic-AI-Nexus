import { describe, expect, it } from 'vitest';

import {
  MODULE_REGISTRY,
  MODULE_INDEX,
  LAUNCHABLE_MODULES,
  getModule,
} from '@/modules/registry';

describe('Module Registry', () => {
  describe('MODULE_REGISTRY', () => {
    it('should expose a stable, ordered list of modules', () => {
      // PageSwitcher relies on this ordering for its grid layout.
      expect(MODULE_REGISTRY.length).toBeGreaterThanOrEqual(6);
      expect(MODULE_REGISTRY[0].id).toBe('home');
    });

    it('should require every entry to have id / labelKey / icon / color', () => {
      for (const mod of MODULE_REGISTRY) {
        expect(mod.id).toBeTruthy();
        expect(mod.labelKey).toMatch(/^modules\./);
        expect(mod.icon).toBeDefined();
        expect(mod.color).toMatch(/^text-/);
      }
    });

    it('should ensure module ids are unique', () => {
      const ids = MODULE_REGISTRY.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('MODULE_INDEX', () => {
    it('should be an O(1) lookup keyed by module id', () => {
      expect(MODULE_INDEX.get('home')).toBe(MODULE_REGISTRY[0]);
      expect(MODULE_INDEX.size).toBe(MODULE_REGISTRY.length);
    });

    it('should return undefined for unknown ids', () => {
      expect(MODULE_INDEX.get('does-not-exist')).toBeUndefined();
    });
  });

  describe('LAUNCHABLE_MODULES', () => {
    it('should exclude synthetic "home" entry (null panelKey)', () => {
      // P2-B contract: home is a close-all target, not a launchable panel.
      expect(LAUNCHABLE_MODULES.some(m => m.id === 'home')).toBe(false);
      for (const mod of LAUNCHABLE_MODULES) {
        expect(mod.panelKey).not.toBeNull();
      }
    });

    it('should include at least the 5 launchable panels wired through UIState', () => {
      const panelKeys = LAUNCHABLE_MODULES.map(m => m.panelKey);
      expect(panelKeys).toContain('showTaskPod');
      expect(panelKeys).toContain('showMCPServer');
      expect(panelKeys).toContain('showWorkflow');
      expect(panelKeys).toContain('showAIGenerator');
      expect(panelKeys).toContain('showIntelligentCenter');
    });

    it('should be a strict subset of MODULE_REGISTRY', () => {
      // Every launchable module must also appear in the master registry.
      for (const mod of LAUNCHABLE_MODULES) {
        expect(MODULE_REGISTRY).toContain(mod);
      }
    });
  });

  describe('getModule()', () => {
    it('should look up a known module by id', () => {
      const tasks = getModule('tasks');
      expect(tasks?.id).toBe('tasks');
      expect(tasks?.panelKey).toBe('showTaskPod');
    });

    it('should return undefined for unknown ids (fail-safe)', () => {
      // Critical for handleSwitchPage: unknown id must not throw.
      expect(getModule('malicious-id')).toBeUndefined();
      expect(getModule('')).toBeUndefined();
    });
  });
});

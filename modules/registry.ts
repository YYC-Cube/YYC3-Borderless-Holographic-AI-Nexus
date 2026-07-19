/**
 * P2-B: Module Registry — single source of truth for navigable modules.
 *
 * Before this file existed, adding a new business panel required editing 5
 * places in parallel:
 *   1. UIState panel key
 *   2. PageSwitcher hardcoded pages array
 *   3. IntelligentCenter launch handlers
 *   4. ResponsiveAIAssistant.handleSwitchPage switch statement
 *   5. ResponsiveAIAssistant.getCurrentPageId cascade
 *
 * With the registry, adding a module is a single entry below. Consumers
 * derive everything else (page list, switch logic, current page) from it.
 *
 * Five Standards served: 标准化 (canonical shape) + 规范化 (one source) +
 * 可视化 (icon/color already attached) + 自动化 (consumers auto-update) +
 * 智能化 (panelKey mapping enables generic switching).
 */
import type { PanelKey } from '@/hooks/useUIState';
import { CheckCircle, Cpu, Database, LayoutGrid, Network, Shield, type LucideIcon } from 'lucide-react';

export interface ModuleEntry {
  /** Stable id used by PageSwitcher.onSwitch and IntelligentCenter.onLaunchModule. */
  id: string;
  /** i18n key under `modules.<id>` (label + description). */
  labelKey: string;
  /** Icon shown in PageSwitcher / launcher grids. */
  icon: LucideIcon;
  /** Tailwind text-color class for icon tinting. */
  color: string;
  /** Corresponding UIState panel key (null for synthetic entries like "home"). */
  panelKey: PanelKey | null;
}

/**
 * Canonical ordered list of modules surfaced through PageSwitcher.
 * The first entry ("home") is a synthetic close-all target and has no panel.
 */
export const MODULE_REGISTRY: readonly ModuleEntry[] = [
  {
    id: 'home',
    labelKey: 'modules.home.label',
    icon: LayoutGrid,
    color: 'text-cyan-400',
    panelKey: null,
  },
  {
    id: 'tasks',
    labelKey: 'modules.tasks.label',
    icon: CheckCircle,
    color: 'text-emerald-400',
    panelKey: 'showTaskPod',
  },
  {
    id: 'mcp',
    labelKey: 'modules.mcp.label',
    icon: Database,
    color: 'text-orange-400',
    panelKey: 'showMCPServer',
  },
  {
    id: 'workflow',
    labelKey: 'modules.workflow.label',
    icon: Shield,
    color: 'text-blue-400',
    panelKey: 'showWorkflow',
  },
  {
    id: 'ai_gen',
    labelKey: 'modules.ai_gen.label',
    icon: Network,
    color: 'text-yellow-400',
    panelKey: 'showAIGenerator',
  },
  {
    id: 'intelligent',
    labelKey: 'modules.intelligent.label',
    icon: Cpu,
    color: 'text-purple-400',
    panelKey: 'showIntelligentCenter',
  },
] as const;

/** Map of module id -> entry, for O(1) lookup in switch handlers. */
export const MODULE_INDEX: ReadonlyMap<string, ModuleEntry> = new Map(
  MODULE_REGISTRY.map(m => [m.id, m])
);

/** Modules that actually open a panel (excludes synthetic entries like "home"). */
export const LAUNCHABLE_MODULES: readonly (ModuleEntry & { panelKey: PanelKey })[] =
  MODULE_REGISTRY.filter(
    (m): m is ModuleEntry & { panelKey: PanelKey } => m.panelKey !== null
  );

/** Look up a module by id; returns undefined for unknown ids. */
export function getModule(id: string): ModuleEntry | undefined {
  return MODULE_INDEX.get(id);
}

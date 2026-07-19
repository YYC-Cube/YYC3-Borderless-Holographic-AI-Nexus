import { DAGEngine, WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/utils/dag-engine';
import { describe, expect, it } from 'vitest';

function buildGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowGraph {
  return { nodes, edges };
}

describe('DAGEngine', () => {
  describe('validate()', () => {
    it('should validate a simple linear DAG', () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'llm_process', label: 'B', config: {} },
          { id: 'c', type: 'output', label: 'C', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(true);
    });

    it('should reject an empty graph', () => {
      const graph = buildGraph([], []);
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should detect cycles in the graph', () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'llm_process', label: 'B', config: {} },
          { id: 'c', type: 'output', label: 'C', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
          { id: 'e3', source: 'c', target: 'a' }, // Cycle
        ]
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cycle');
    });

    it('should allow audio_synth nodes', () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'audio_synth', label: 'Voice', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(true);
    });

    it('should validate a diamond-shaped DAG', () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'llm_process', label: 'B', config: {} },
          { id: 'c', type: 'llm_process', label: 'C', config: {} },
          { id: 'd', type: 'output', label: 'D', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'a', target: 'c' },
          { id: 'e3', source: 'b', target: 'd' },
          { id: 'e4', source: 'c', target: 'd' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(true);
    });

    it('should validate a single-node graph', () => {
      const graph = buildGraph(
        [{ id: 'a', type: 'output', label: 'A', config: {} }],
        []
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(true);
    });

    it('should detect self-loop', () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'output', label: 'B', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'b' }, // Self-loop
        ]
      );
      const engine = new DAGEngine(graph);
      const result = engine.validate();
      expect(result.valid).toBe(false);
    });
  });

  describe('execute()', () => {
    it('should execute a simple linear workflow', async () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: { value: 'test' } },
          { id: 'b', type: 'output', label: 'B', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = await engine.execute();
      expect(result.success).toBe(true);
      expect(result.logs.length).toBeGreaterThan(0);
      // Check that each node has a completed log entry
      const nodeIds = ['a', 'b'];
      const completedLogs = result.logs.filter(l => l.status === 'completed');
      for (const id of nodeIds) {
        expect(completedLogs.some(l => l.nodeId === id)).toBe(true);
      }
    });

    it('should execute a workflow containing audio_synth node', async () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: { value: 'hello' } },
          { id: 'b', type: 'audio_synth', label: 'Voice', config: {} },
          { id: 'c', type: 'output', label: 'C', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = await engine.execute();
      expect(result.success).toBe(true);
      // audio_synth node should have produced an audio output
      const voiceLog = result.logs.find(l => l.nodeId === 'b' && l.status === 'completed');
      expect(voiceLog?.output).toContain('data:audio/mp3');
    });

    it('should fail on cycle detection before execution', async () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'output', label: 'B', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'a' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = await engine.execute();
      expect(result.success).toBe(false);
    });

    it('should execute in topological order', async () => {
      const graph = buildGraph(
        [
          { id: 'a', type: 'text_input', label: 'A', config: {} },
          { id: 'b', type: 'llm_process', label: 'B', config: {} },
          { id: 'c', type: 'output', label: 'C', config: {} },
        ],
        [
          { id: 'e1', source: 'a', target: 'b' },
          { id: 'e2', source: 'b', target: 'c' },
        ]
      );
      const engine = new DAGEngine(graph);
      const result = await engine.execute();
      expect(result.success).toBe(true);

      // Get node execution order from logs
      const nodeLogs = result.logs.filter(l => l.nodeId !== 'system');
      const order = nodeLogs.map(l => l.nodeId);
      const aIdx = order.indexOf('a');
      const bIdx = order.indexOf('b');
      const cIdx = order.indexOf('c');
      expect(aIdx).toBeLessThan(bIdx);
      expect(bIdx).toBeLessThan(cIdx);
    });
  });
});

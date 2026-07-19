export type NodeType = 'text_input' | 'llm_process' | 'image_gen' | 'audio_synth' | 'output';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionLog {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: unknown;
  error?: string;
  timestamp: number;
}

export class DAGEngine {
  private graph: WorkflowGraph;
  private logs: ExecutionLog[] = [];
  private executionOrder: string[] = [];
  private nodeOutputs: Record<string, unknown> = {};

  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }

  /**
   * Validates the DAG structure.
   * Checks for cycles and invalid node types.
   */
  validate(): { valid: boolean; error?: string } {
    if (!this.graph.nodes.length) {
      return { valid: false, error: 'Graph is empty' };
    }

    // Detect Cycles using DFS
    try {
      this.executionOrder = this.topologicalSort();
    } catch (_e) {
      return { valid: false, error: 'Cycle detected in workflow graph' };
    }

    return { valid: true };
  }

  /**
   * Executes the workflow.
   */
  async execute(): Promise<{ success: boolean; logs: ExecutionLog[] }> {
    const validation = this.validate();
    if (!validation.valid) {
      this.addLog('system', 'failed', undefined, validation.error);
      return { success: false, logs: this.logs };
    }

    this.addLog('system', 'running', 'Execution started');

    for (const nodeId of this.executionOrder) {
      const node = this.graph.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      this.addLog(nodeId, 'running');

      try {
        // Get inputs from previous nodes
        const inputs = this.getNodeInputs(nodeId);

        // Execute Logic
        const output = await this.executeNodeLogic(node, inputs);

        this.nodeOutputs[nodeId] = output;
        this.addLog(nodeId, 'completed', output);
      } catch (error) {
        this.addLog(nodeId, 'failed', undefined, String(error));
        return { success: false, logs: this.logs };
      }
    }

    this.addLog('system', 'completed', 'Workflow finished successfully');
    return { success: true, logs: this.logs };
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const _visit = (nodeId: string) => {
      if (temp.has(nodeId)) throw new Error('Cycle detected');
      if (visited.has(nodeId)) return;

      temp.add(nodeId);

      const outgoingEdges = this.graph.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        _visit(edge.target);
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      order.unshift(nodeId); // Post-order traversal reversed = topological
    };

    // Note: Standard TopSort logic might need adjustment depending on execution direction requirements
    // Usually, we want to execute dependencies first. The above logic gives dependencies LAST.
    // So we need to reverse the logic: Visit dependencies first.

    // Let's re-implement strictly: Find nodes with 0 in-degrees
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};

    this.graph.nodes.forEach(n => {
      inDegree[n.id] = 0;
      adj[n.id] = [];
    });

    this.graph.edges.forEach(e => {
      adj[e.source].push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });

    const queue = this.graph.nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    const result: string[] = [];

    while (queue.length > 0) {
      const u = queue.shift()!;
      result.push(u);

      for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      }
    }

    if (result.length !== this.graph.nodes.length) {
      throw new Error('Cycle detected');
    }

    return result;
  }

  private getNodeInputs(nodeId: string): Record<string, unknown> {
    const incomingEdges = this.graph.edges.filter(e => e.target === nodeId);
    const inputs: Record<string, unknown> = {};

    incomingEdges.forEach(e => {
      // In a real system, we'd map specific ports. Here we just merge previous outputs.
      inputs[e.source] = this.nodeOutputs[e.source];
    });

    return inputs;
  }

  private async executeNodeLogic(node: WorkflowNode, inputs: Record<string, unknown>): Promise<unknown> {
    // Mock Execution Delay
    await new Promise(r => setTimeout(r, 500));

    switch (node.type) {
      case 'text_input':
        return node.config.value;
      case 'llm_process':
        // In real app, call LLM API here
        return `Processed by LLM: ${JSON.stringify(inputs)}`;
      case 'image_gen':
        return 'https://example.com/generated-image.png';
      case 'audio_synth':
        // Audio synthesis output (URL placeholder — real TTS handled by generation.ts)
        return `data:audio/mp3;synthesized-from-${Object.keys(inputs).length}-inputs`;
      case 'output':
        return inputs;
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  private addLog(nodeId: string, status: ExecutionLog['status'], output?: unknown, error?: string) {
    this.logs.push({
      nodeId,
      status,
      output,
      error,
      timestamp: Date.now()
    });
  }
}

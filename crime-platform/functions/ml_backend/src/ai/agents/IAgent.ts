import { Citation } from '../types';
import { ToolResult } from '../tools/ITool';

export interface AgentResult {
  success: boolean;
  agent: string;
  summary: any;
  toolExecutions: ToolResult[];
  citations: Citation[];
  confidence?: number;
  metadata: {
    executionTimeMs: number;
  };
}

export interface IAgent {
  readonly name: string;
  readonly description: string;

  /**
   * Executes a specific agent skill with the provided arguments.
   */
  execute(skill: string, args: Record<string, any>): Promise<AgentResult>;
}

import { Citation } from '../types';

export interface ToolResult {
  success: boolean;
  tool: string;
  data: unknown;
  citations: Citation[];
  confidence?: number;
  metadata: {
    executionTimeMs: number;
    source: string;
    repository: string;
  };
}

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly parametersSchema: Record<string, any>;

  /**
   * Executes the tool with the provided arguments.
   */
  execute(args: Record<string, any>): Promise<ToolResult>;
}

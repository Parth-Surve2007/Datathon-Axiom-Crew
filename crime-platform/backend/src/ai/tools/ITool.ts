export interface ToolExecutionResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface ITool {
  readonly name: string;
  readonly description: string;
  readonly parametersSchema: Record<string, any>;

  /**
   * Executes the tool with the provided arguments.
   */
  execute(args: Record<string, any>): Promise<ToolExecutionResult>;
}

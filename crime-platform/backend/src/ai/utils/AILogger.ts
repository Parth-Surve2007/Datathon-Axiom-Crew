import logger from '../../config/logger';

export class AILogger {
  static logQuery(sessionId: string, userId: string, intent: string, latencyMs: number) {
    logger.info({
      type: 'ai_query',
      sessionId,
      userId,
      intent,
      latencyMs,
    }, 'AI Query Executed');
  }

  static logAgentExecution(agentName: string, skill: string, executionTimeMs: number, toolCalls: string[], success: boolean) {
    logger.info({
      type: 'ai_agent_execution',
      agentName,
      skill,
      executionTimeMs,
      toolCalls,
      success
    }, 'AI Agent Executed');
  }

  static logToolExecution(toolName: string, latencyMs: number, args: any, success: boolean, sessionId?: string) {
    logger.info({
      type: 'ai_tool_execution',
      toolName,
      latencyMs,
      args,
      success,
      sessionId
    }, 'AI Tool Executed');
  }

  static logProviderMetrics(providerName: string, latencyMs: number, usage: any) {
    logger.info({
      type: 'ai_provider_metrics',
      providerName,
      latencyMs,
      usage,
    }, 'AI Provider Metrics');
  }

  static logError(sessionId: string, error: Error, context?: any) {
    logger.error({
      type: 'ai_error',
      sessionId,
      error: error.message,
      stack: error.stack,
      context,
    }, 'AI Execution Error');
  }
}

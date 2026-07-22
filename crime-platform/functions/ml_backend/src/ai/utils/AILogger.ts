import { logger } from '../../config/logger';

export class AILogger {
  static logQuery(sessionId: string, userId: string, intent: string, latencyMs: number) {
    try {
      logger.info({
        type: 'ai_query',
        sessionId,
        userId,
        intent,
        latencyMs,
      }, 'AI Query Executed');
    } catch (e) {
      console.error('Fallback log: AI Query Executed', { sessionId, userId, intent });
    }
  }

  static logAgentExecution(agentName: string, skill: string, executionTimeMs: number, toolCalls: string[], success: boolean) {
    try {
      logger.info({
        type: 'ai_agent_execution',
        agentName,
        skill,
        executionTimeMs,
        toolCalls,
        success
      }, 'AI Agent Executed');
    } catch (e) {
      console.error('Fallback log: AI Agent Executed', { agentName, skill });
    }
  }

  static logToolExecution(toolName: string, latencyMs: number, args: any, success: boolean, sessionId?: string) {
    try {
      logger.info({
        type: 'ai_tool_execution',
        toolName,
        latencyMs,
        args,
        success,
        sessionId
      }, 'AI Tool Executed');
    } catch (e) {
      console.error('Fallback log: AI Tool Executed', { toolName, success });
    }
  }

  static logProviderMetrics(providerName: string, latencyMs: number, usage: any) {
    try {
      logger.info({
        type: 'ai_provider_metrics',
        providerName,
        latencyMs,
        usage,
      }, 'AI Provider Metrics');
    } catch (e) {
      console.error('Fallback log: AI Provider Metrics', { providerName });
    }
  }

  static logError(sessionId: string, error: any, context?: any) {
    try {
      logger.error({
        type: 'ai_error',
        sessionId,
        error: error?.message || String(error),
        stack: error?.stack,
        context,
      }, 'AI Execution Error');
    } catch (logErr) {
      console.error('Fallback log: AI Execution Error. Logger crashed.', logErr, error);
    }
  }
}

import { ExecutionContext, RetrievalResult, ConversationSession } from '../types';

export class ContextBuilder {
  /**
   * Assembles the execution context combining user, session, and retrieved evidence.
   */
  static build(
    sessionId: string,
    userId: string,
    permissions: string[],
    retrievedData: RetrievalResult[] = []
  ): ExecutionContext {
    return {
      sessionId,
      userId,
      permissions,
      retrievedContext: retrievedData,
      metadata: {
        timestamp: new Date().toISOString(),
      }
    };
  }

  /**
   * Formats the retrieved context into a single evidence string.
   */
  static formatEvidence(context: ExecutionContext): string {
    if (!context.retrievedContext || context.retrievedContext.length === 0) {
      return "No additional evidence provided.";
    }

    return context.retrievedContext
      .map(
        (res, idx) =>
          `[Evidence ${idx + 1}] (Source: ${res.sourceType}, Score: ${res.score.toFixed(2)})
${res.content}`
      )
      .join('\n\n');
  }
}

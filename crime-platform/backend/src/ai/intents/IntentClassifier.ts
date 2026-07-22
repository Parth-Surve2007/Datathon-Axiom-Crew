import { IntentContext } from '../types';

export class IntentClassifier {
  /**
   * Statically or dynamically classifies the user's intent.
   * In a full implementation, this could call a smaller/faster LLM or use Regex/NLP.
   */
  static async classify(userInput: string): Promise<IntentContext> {
    const text = userInput.toLowerCase();
    
    // Naive heuristic classification for infrastructure stub
    if (text.includes('graph') || text.includes('syndicate') || text.includes('network')) {
      return {
        primaryIntent: 'network',
        confidence: 0.85,
        entities: {},
        requiresRetrieval: true,
        targetTools: ['GraphSearch'],
      };
    }

    if (text.includes('analytics') || text.includes('trend') || text.includes('chart')) {
      return {
        primaryIntent: 'analytics',
        confidence: 0.9,
        entities: {},
        requiresRetrieval: true,
        targetTools: ['AnalyticsAggregator'],
      };
    }

    // Default to general investigation search
    return {
      primaryIntent: 'investigation',
      confidence: 0.7,
      entities: {},
      requiresRetrieval: true,
      targetTools: ['FIRSearch'],
    };
  }
}

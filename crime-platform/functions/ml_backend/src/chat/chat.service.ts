import { BaseService } from '@services/base.service';
import { aiConfig } from '@config/index';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  sessionId: string;
  userId: string;
  history: ChatMessage[];
}

/**
 * ChatService — Conversational AI orchestrator.
 *
 * Phase 2:
 * - Connect to Gemini API (primary) or OpenAI (fallback)
 * - Implement intent classification (query FIR / analytics / graph / report)
 * - RAG over Catalyst Data Store query results
 * - Stream responses back to client
 */
export class ChatService extends BaseService {
  constructor() {
    super('ChatService');
    this.log.info({ model: aiConfig.geminiModel }, 'AI service configured');
  }

  async processMessage(
    _context: ChatContext,
    _userMessage: string,
  ): Promise<string> {
    this.log.warn('processMessage: not yet implemented — connect Gemini API in Phase 2');
    return 'AI service not yet connected. Coming in Phase 2.';
  }
}

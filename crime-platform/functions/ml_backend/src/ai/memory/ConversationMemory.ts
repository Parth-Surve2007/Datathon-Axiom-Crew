import { IConversationRepository } from './IConversationRepository';
import { ChatMessage, ConversationSession } from '../types';

export class ConversationMemory {
  private repository: IConversationRepository;

  constructor(repository: IConversationRepository) {
    this.repository = repository;
  }

  async getOrCreateSession(userId: string, sessionId?: string): Promise<ConversationSession> {
    if (sessionId) {
      const session = await this.repository.getSession(sessionId);
      if (session && session.userId === userId) {
        return session;
      }
    }
    return this.repository.createSession(userId);
  }

  async getHistory(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    return this.repository.getMessages(sessionId, limit);
  }

  async addInteraction(sessionId: string, userMessage: ChatMessage, aiMessage: ChatMessage): Promise<void> {
    await this.repository.addMessage(sessionId, userMessage);
    await this.repository.addMessage(sessionId, aiMessage);
  }

  async exportConversation(sessionId: string): Promise<string> {
    const messages = await this.getHistory(sessionId, 1000);
    return messages
      .map(m => `[${m.timestamp.toISOString()}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
  }

  async clearSession(sessionId: string): Promise<boolean> {
    return this.repository.deleteSession(sessionId);
  }
}

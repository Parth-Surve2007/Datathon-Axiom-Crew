import { ChatMessage, ConversationSession } from '../types';
import { IConversationRepository } from './IConversationRepository';

/**
 * In-memory implementation of IConversationRepository for development.
 * All data is lost on server restart.
 */
export class InMemoryConversationRepository implements IConversationRepository {
  private sessions = new Map<string, ConversationSession>();
  private messages = new Map<string, ChatMessage[]>();

  async createSession(userId: string, metadata?: Record<string, any>): Promise<ConversationSession> {
    const session: ConversationSession = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: metadata ?? {},
    };
    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);
    return session;
  }

  async getSession(sessionId: string): Promise<ConversationSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    if (!this.messages.has(sessionId)) {
      this.messages.set(sessionId, []);
    }
    this.messages.get(sessionId)!.push(message);
  }

  async getMessages(sessionId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    const msgs = this.messages.get(sessionId) ?? [];
    return msgs.slice(offset, offset + limit);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const existed = this.sessions.has(sessionId);
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
    return existed;
  }
}

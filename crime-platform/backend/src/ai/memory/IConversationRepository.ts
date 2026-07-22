import { ChatMessage, ConversationSession } from '../types';

export interface IConversationRepository {
  createSession(userId: string, metadata?: Record<string, any>): Promise<ConversationSession>;
  getSession(sessionId: string): Promise<ConversationSession | null>;
  addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  getMessages(sessionId: string, limit?: number, offset?: number): Promise<ChatMessage[]>;
  deleteSession(sessionId: string): Promise<boolean>;
}

import { AIOrchestrator } from '../../ai/orchestrator/AIOrchestrator';
import { GeminiProvider } from '../../ai/providers/GeminiProvider';
import { SearchRetriever } from '../../ai/retrieval/SearchRetriever';
import { ToolRegistry } from '../../ai/tools/ToolRegistry';
import { ConversationMemory } from '../../ai/memory/ConversationMemory';
import { IConversationRepository } from '../../ai/memory/IConversationRepository';

// Stub repository for testing
class MockRepo implements IConversationRepository {
  async createSession() { return { id: 's1', userId: 'u1', createdAt: new Date(), updatedAt: new Date() }; }
  async getSession() { return { id: 's1', userId: 'u1', createdAt: new Date(), updatedAt: new Date() }; }
  async addMessage() {}
  async getMessages() { return []; }
  async deleteSession() { return true; }
}

describe('AIOrchestrator', () => {
  it('should process a full request successfully', async () => {
    const provider = new GeminiProvider({ model: 'gemini-1.5-pro' });
    const retriever = new SearchRetriever();
    const registry = new ToolRegistry();
    const memory = new ConversationMemory(new MockRepo());
    
    const orchestrator = new AIOrchestrator(provider, retriever, registry, memory);

    const response = await orchestrator.processRequest('s1', 'u1', 'Find cases related to theft in sector 4');
    
    expect(response).toBeDefined();
    expect(response.text).toContain('Simulated response');
    expect(response.messageId).toBeDefined();
  });
});

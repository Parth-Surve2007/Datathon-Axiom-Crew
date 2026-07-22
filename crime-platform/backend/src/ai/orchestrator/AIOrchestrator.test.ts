import { AIOrchestrator } from './AIOrchestrator';
import { BaseProvider } from '../providers/BaseProvider';
import { IRetriever } from '../retrieval/IRetriever';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ConversationMemory } from '../memory/ConversationMemory';
import { ITool, ToolExecutionResult } from '../tools/ITool';

class MockProvider extends BaseProvider {
  generateCallCount = 0;

  async generate(request: any) {
    this.generateCallCount++;
    if (this.generateCallCount === 1) {
      return {
        text: '',
        tool_calls: [{
          id: 'call_1',
          type: 'function',
          function: { name: 'mock_tool', arguments: '{"arg":"val"}' }
        }],
        usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }
      };
    }
    return {
      text: 'Final response after tool call.',
      usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 }
    };
  }

  async *generateStream(request: any): AsyncIterableIterator<string> {
    yield 'Stream';
  }

  async embed(text: string) { return [1, 2, 3]; }
}

class MockRetriever implements IRetriever {
  async retrieve() { return []; }
}

class MockMemory extends ConversationMemory {
  constructor() { super(); }
  async getHistory() { return []; }
  async addInteraction() { return; }
}

class MockTool implements ITool {
  name = 'mock_tool';
  description = 'Mock tool';
  parametersSchema = {};
  async execute(args: any): Promise<ToolExecutionResult> {
    return { success: true, data: { result: 'mocked' } };
  }
}

describe('AIOrchestrator', () => {
  it('should handle tool calling loop correctly', async () => {
    const provider = new MockProvider({ model: 'mock' });
    const registry = new ToolRegistry();
    registry.register(new MockTool());
    const memory = new MockMemory();
    const retriever = new MockRetriever();

    const orchestrator = new AIOrchestrator(provider, retriever, registry, memory);

    const response = await orchestrator.processRequest('session-1', 'user-1', 'Use the tool');

    expect(provider.generateCallCount).toBe(2);
    expect(response.text).toBe('Final response after tool call.');
  });
});

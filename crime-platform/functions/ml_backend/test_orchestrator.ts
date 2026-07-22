import { AIOrchestrator } from './src/ai/orchestrator/AIOrchestrator';

const stubProvider = {
  generate: async ({ messages }: any) => {
    return { text: "hello", usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 } };
  }
} as any;
const stubRetriever = { retrieve: async () => [] } as any;
const stubToolRegistry = { getAllTools: () => [], getTool: () => null } as any;
const stubMemory = { getHistory: async () => [], addInteraction: async () => {} } as any;

const orchestrator = new AIOrchestrator(stubProvider, stubRetriever, stubToolRegistry, stubMemory);

async function run() {
  try {
    await orchestrator.processRequest('test-session', 'test-user', 'hello');
    console.log("Success!");
  } catch (err) {
    console.error("ORIGINAL EXCEPTION:", err);
  }
}
run();

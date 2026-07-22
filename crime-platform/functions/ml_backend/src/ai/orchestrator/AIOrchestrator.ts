import { BaseProvider } from '../providers/BaseProvider';
import { IRetriever } from '../retrieval/IRetriever';
import { IntentClassifier } from '../intents/IntentClassifier';
import { ContextBuilder } from '../context/ContextBuilder';
import { PromptBuilder } from '../prompts/PromptBuilder';
import { CitationEngine } from '../citations/CitationEngine';
import { AILogger } from '../utils/AILogger';
import { AIResponse, ChatMessage } from '../types';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ConversationMemory } from '../memory/ConversationMemory';

export class AIOrchestrator {
  constructor(
    private provider: BaseProvider,
    private retriever: IRetriever,
    private toolRegistry: ToolRegistry,
    private memory: ConversationMemory
  ) {}

  /**
   * Executes a complete AI request pipeline:
   * 1. Intent Detection
   * 2. Evidence Retrieval
   * 3. Context & Prompt Assembly
   * 4. LLM Generation
   * 5. Citation & Memory Update
   */
  async processRequest(
    sessionId: string,
    userId: string,
    userMessageText: string
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // 1. Intent Classification
      const intent = await IntentClassifier.classify(userMessageText);

      // 2. Evidence Retrieval (if required)
      let evidence: any[] = [];
      if (intent.requiresRetrieval) {
        evidence = await this.retriever.retrieve({ text: userMessageText, limit: 5 });
      }

      // 3. Context & Prompt Assembly
      const context = ContextBuilder.build(sessionId, userId, [], evidence);
      context.intent = intent;
      const systemPrompt = PromptBuilder.buildSystemPrompt(intent.primaryIntent, context);
      
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessageText,
        timestamp: new Date()
      };

      // Retrieve recent conversation history
      const history = await this.memory.getHistory(sessionId, 10);
      const messages = [systemPrompt, ...history, userMessage];

      // 4. LLM Generation and Tool Calling Loop
      const tools = this.toolRegistry.getAllTools().map(t => ({
        type: 'function',
        function: { name: t.name, description: t.description, parameters: t.parametersSchema }
      }));

      let response = await this.provider.generate({ messages, tools });
      
      let loopCount = 0;
      const MAX_LOOPS = 5;

      while (response.tool_calls && response.tool_calls.length > 0 && loopCount < MAX_LOOPS) {
        loopCount++;
        
        // Add assistant's tool call message to history
        const toolCallMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.text || '',
          timestamp: new Date(),
          tool_calls: response.tool_calls
        };
        messages.push(toolCallMessage);

        for (const toolCall of response.tool_calls) {
          const tool = this.toolRegistry.getTool(toolCall.function.name);
          let toolResultContent = '';
          let success = false;
          let args = {};
          
          if (tool) {
            const startTimeTool = Date.now();
            try {
              args = JSON.parse(toolCall.function.arguments || '{}');
              const result = await tool.execute(args);
              success = result.success;
              toolResultContent = JSON.stringify(result);
              AILogger.logToolExecution(tool.name, Date.now() - startTimeTool, args, success, sessionId);
            } catch (err: any) {
              toolResultContent = JSON.stringify({ success: false, error: err.message });
              AILogger.logError(sessionId, err, { toolName: tool.name, args });
            }
          } else {
            toolResultContent = JSON.stringify({ success: false, error: `Tool ${toolCall.function.name} not found.` });
          }

          // Add tool result to messages
          messages.push({
            id: crypto.randomUUID(),
            role: 'tool',
            content: toolResultContent,
            timestamp: new Date(),
            tool_call_id: toolCall.id,
            name: toolCall.function.name
          });
        }

        // Call LLM again with tool results
        response = await this.provider.generate({ messages, tools });
      }

      // 5. Citation Generation
      const citations = CitationEngine.generateCitations(response.text, evidence);

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        metadata: { citations, usage: response.usage }
      };

      // Update memory
      await this.memory.addInteraction(sessionId, userMessage, aiMessage);

      // Log success
      AILogger.logQuery(sessionId, userId, intent.primaryIntent, Date.now() - startTime);

      return {
        messageId: aiMessage.id,
        text: response.text,
        citations,
        usage: response.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };
    } catch (error: any) {
      try {
        AILogger.logError(sessionId, error, { userMessageText });
      } catch (logErr) {
        console.error('Failed to log error', logErr);
      }
      throw error;
    }
  }

  /**
   * Streams the AI response using Server-Sent Events (SSE) pattern.
   * Returns an async iterator that yields chunks of text.
   */
  async *processStream(
    sessionId: string,
    userId: string,
    userMessageText: string
  ): AsyncIterableIterator<string> {
    // Intent and Context gathering (simplified for stream example)
    const intent = await IntentClassifier.classify(userMessageText);
    const evidence = intent.requiresRetrieval ? await this.retriever.retrieve({ text: userMessageText }) : [];
    const context = ContextBuilder.build(sessionId, userId, [], evidence);
    const systemPrompt = PromptBuilder.buildSystemPrompt(intent.primaryIntent, context);
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date()
    };
    const history = await this.memory.getHistory(sessionId, 10);
    const messages = [systemPrompt, ...history, userMessage];

    const tools = this.toolRegistry.getAllTools().map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.parametersSchema }
    }));

    const stream = this.provider.generateStream({ messages, stream: true, tools });
    let fullResponseText = "";

    for await (const chunk of stream) {
      fullResponseText += chunk;
      yield chunk;
    }

    // Post-stream memory recording
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: fullResponseText,
      timestamp: new Date()
    };
    await this.memory.addInteraction(sessionId, userMessage, aiMessage);
  }
}

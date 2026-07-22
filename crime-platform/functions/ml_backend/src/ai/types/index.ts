import { z } from 'zod';

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export interface ToolCallFunction {
  name: string;
  arguments: string; // JSON string
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string; // name of the tool if role is 'tool'
  metadata?: Record<string, any>;
}

export interface Citation {
  id: string;
  sourceId: string;
  sourceType: 'FIR' | 'Report' | 'Analytics' | 'GraphNode';
  snippet: string;
  confidence: number;
  reasoning: string;
}

export interface RetrievalResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  sourceType: string;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface GenerateRequest {
  messages: ChatMessage[];
  config?: Partial<ProviderConfig>;
  stream?: boolean;
  tools?: any[]; // OpenAI-style tool schema
  tool_choice?: 'auto' | 'none' | any;
}

export interface GenerateResponse {
  text: string;
  usage?: TokenUsage;
  citations?: Citation[];
  tool_calls?: ToolCall[];
  metadata?: Record<string, any>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IntentContext {
  primaryIntent: string;
  confidence: number;
  entities: Record<string, any>;
  requiresRetrieval: boolean;
  targetTools: string[];
}

export interface ExecutionContext {
  sessionId: string;
  userId: string;
  permissions: string[];
  intent?: IntentContext;
  retrievedContext?: RetrievalResult[];
  metadata?: Record<string, any>;
}

export interface AIResponse {
  messageId: string;
  text: string;
  citations: Citation[];
  usage: TokenUsage;
  metadata?: Record<string, any>;
}

// Zod schemas for external API validation
export const ChatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
  stream: z.boolean().optional().default(false),
  metadata: z.record(z.any()).optional(),
});
export type ChatRequestDTO = z.infer<typeof ChatRequestSchema>;

export const ChatHistoryRequestSchema = z.object({
  sessionId: z.string(),
  limit: z.number().int().positive().optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});
export type ChatHistoryRequestDTO = z.infer<typeof ChatHistoryRequestSchema>;

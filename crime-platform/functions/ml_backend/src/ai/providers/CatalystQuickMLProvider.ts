import { BaseProvider } from './BaseProvider';
import { GenerateRequest, GenerateResponse, ToolCall } from '../types';
import { AILogger } from '../utils/AILogger';
import { ZohoOAuthTokenManager } from './ZohoOAuthTokenManager';

interface CatalystInternalRequest {
  model: string;
  messages: any[];
  temperature?: number;
  max_tokens?: number;
  stream: boolean;
  chat_template_kwargs?: {
    enable_thinking: boolean;
  };
  tools?: any[];
  tool_choice?: 'auto' | 'none' | any;
}

interface CatalystInternalResponse {
  response?: string;
  output?: string;
  text?: string;
  content?: string;
  result?: string | { response?: string; output?: string; text?: string; content?: string };
  choices?: Array<{
    message?: {
      content?: string;
      tool_calls?: ToolCall[];
      reasoning?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export class CatalystQuickMLProvider extends BaseProvider {
  private readonly DEFAULT_TIMEOUT_MS = 300000;
  private readonly MAX_RETRIES = 1;
  private readonly DEFAULT_MODEL = process.env.CATALYST_MODEL_ID || 'quickml-default-model';
  private readonly tokenManager = new ZohoOAuthTokenManager();

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const startTime = Date.now();
    let attempt = 0;
    
    const internalRequest = this.serializeRequest(request);

    while (attempt < this.MAX_RETRIES) {
      attempt++;
      try {
        const internalResponse = await this.executeTransport(internalRequest);
        const generateResponse = this.deserializeResponse(internalResponse);
        
        const latencyMs = Date.now() - startTime;
        AILogger.logQuery(
          'system',
          'system',
          'Catalyst_Generate',
          latencyMs
        );

        return generateResponse;
      } catch (error: any) {
        if (this.shouldRetry(error) && attempt < this.MAX_RETRIES) {
          const backoff = Math.pow(2, attempt) * 500;
          AILogger.logError('catalyst-retry', error, { attempt, backoff });
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
        
        AILogger.logError('catalyst-failure', error, { attempt });
        throw this.mapCatalystError(error);
      }
    }

    throw new Error('CatalystQuickMLProvider: Exhausted retries without a successful response.');
  }

  async *generateStream(request: GenerateRequest): AsyncIterableIterator<string> {
    throw new Error('NotImplementedError: CatalystQuickMLProvider.generateStream requires official API verification.');
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('NotImplementedError: CatalystQuickMLProvider.embed requires official API verification.');
  }

  // --- Extension Points ---

  private serializeRequest(request: GenerateRequest): CatalystInternalRequest {
    const messages = request.messages.map(m => {
      const msg: any = { role: m.role, content: m.content || '' };
      if (m.tool_calls) {
        msg.tool_calls = m.tool_calls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }));
      }
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      if (m.name) msg.name = m.name;
      return msg;
    });

    return {
      model: request.config?.model || this.DEFAULT_MODEL,
      messages,
      temperature: request.config?.temperature,
      max_tokens: request.config?.maxTokens,
      stream: request.stream || false,
      chat_template_kwargs: {
        enable_thinking: process.env.CATALYST_ENABLE_THINKING !== 'false'
      },
      tools: request.tools,
      tool_choice: request.tool_choice || (request.tools?.length ? 'auto' : undefined)
    };
  }

  private deserializeResponse(response: CatalystInternalResponse): GenerateResponse {
    const directText = this.extractDirectText(response);
    if (directText) {
      return {
        text: directText,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens || 0,
          completionTokens: response.usage.completion_tokens || 0,
          totalTokens: response.usage.total_tokens || 0
        } : undefined
      };
    }

    const choice = response.choices?.[0];
    if (!choice) {
      throw new Error('Catalyst response did not match a supported QuickML LLM response shape.');
    }

    const msg = choice.message;
    
    return {
      text: msg?.content || '',
      tool_calls: msg?.tool_calls,
      metadata: {
        reasoning: msg?.reasoning,
        finishReason: choice.finish_reason
      },
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens || 0,
        completionTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0
      } : undefined
    };
  }

  private async executeTransport(internalReq: CatalystInternalRequest): Promise<CatalystInternalResponse> {
    const orgId = process.env.CATALYST_ORG_ID;
    const deploymentUrl = process.env.CATALYST_QUICKML_ENDPOINT_URL || process.env.CATALYST_QUICKML_DEPLOYMENT_URL;
    const endpointKey = process.env.CATALYST_QUICKML_ENDPOINT_KEY;
    const environment = this.toCatalystEnvironmentHeader(process.env.CATALYST_ENVIRONMENT || 'production');

    if (!orgId || !deploymentUrl) {
      throw new Error('Catalyst QuickML configuration missing (CATALYST_ORG_ID or CATALYST_QUICKML_ENDPOINT_URL).');
    }

    const token = await this.tokenManager.getAccessToken();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT_MS);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Zoho-oauthtoken ${token}`,
        'CATALYST-ORG': orgId,
        'Environment': environment
      };
      if (endpointKey) {
        headers['X-QUICKML-ENDPOINT-KEY'] = endpointKey;
      }

      let res = await fetch(deploymentUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(internalReq),
        signal: controller.signal as any
      });

      if (res.status === 401) {
        headers.Authorization = `Zoho-oauthtoken ${await this.tokenManager.getAccessToken(true)}`;
        res = await fetch(deploymentUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(internalReq),
          signal: controller.signal as any
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw { status: res.status, message: errorText }; 
      }

      return await res.json() as CatalystInternalResponse;
    } catch (err: any) {
       // Catch node-fetch abort errors or network failures
       if (err.name === 'AbortError') {
         throw { status: 504, message: 'Gateway Timeout' };
       }
       throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // --- Resilience & Utilities ---

  private shouldRetry(error: any): boolean {
    if (error.name === 'NotImplementedError') return false;
    
    const retryableStatuses = [429, 500, 502, 503, 504];
    if (error.status && retryableStatuses.includes(error.status)) {
      return true;
    }
    
    if (error.message && (error.message.includes('timeout') || error.message.includes('ECONNRESET'))) {
      return true;
    }
    
    return false;
  }

  private mapCatalystError(error: any): Error {
    if (error.name === 'NotImplementedError') return error;

    if (error.status === 401 || error.status === 403) {
      return new Error(`AuthenticationError: Catalyst API rejected credentials. ${error.message}`);
    }
    if (error.status === 429) {
      return new Error(`RateLimitError: Catalyst API rate limit exceeded. ${error.message}`);
    }
    if (error.status === 504) {
      return new Error(`TimeoutError: Catalyst API request timed out.`);
    }
    return new Error(`ProviderError: Catalyst API request failed. ${error.message}`);
  }

  private extractDirectText(response: CatalystInternalResponse): string | undefined {
    if (typeof response.response === 'string') return response.response;
    if (typeof response.output === 'string') return response.output;
    if (typeof response.text === 'string') return response.text;
    if (typeof response.content === 'string') return response.content;
    if (typeof response.result === 'string') return response.result;
    if (response.result && typeof response.result === 'object') {
      return response.result.response || response.result.output || response.result.text || response.result.content;
    }
    return undefined;
  }

  private toCatalystEnvironmentHeader(value: string): string {
    return value.toLowerCase() === 'development' ? 'Development' : 'Production';
  }
}

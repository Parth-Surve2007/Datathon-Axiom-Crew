import { GenerateRequest, GenerateResponse, ProviderConfig } from '../types';

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  /**
   * Generates a complete text response based on the conversation history.
   */
  abstract generate(request: GenerateRequest): Promise<GenerateResponse>;

  /**
   * Generates a stream of responses (Server-Sent Events payload compatible).
   */
  abstract generateStream(request: GenerateRequest): AsyncIterableIterator<string>;

  /**
   * Generates embeddings for the provided text.
   */
  abstract embed(text: string): Promise<number[]>;
}

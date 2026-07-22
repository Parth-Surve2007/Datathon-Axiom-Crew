import { BaseProvider } from './BaseProvider';
import { GeminiProvider } from './GeminiProvider';
import { CatalystQuickMLProvider } from './CatalystQuickMLProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { ProviderConfig } from '../types';

export type ProviderType = 'gemini' | 'catalyst' | 'openai';

export class ProviderFactory {
  static create(type: ProviderType, config: ProviderConfig): BaseProvider {
    switch (type) {
      case 'gemini':
        return new GeminiProvider(config);
      case 'catalyst':
        return new CatalystQuickMLProvider(config);
      case 'openai':
        return new OpenAIProvider(config);
      default:
        throw new Error(`Unsupported AI Provider type: ${type}`);
    }
  }
}

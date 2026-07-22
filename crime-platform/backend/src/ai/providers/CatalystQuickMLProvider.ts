import { BaseProvider } from './BaseProvider';
import { GenerateRequest, GenerateResponse } from '../types';

export class CatalystQuickMLProvider extends BaseProvider {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    throw new Error('NotImplementedError: CatalystQuickMLProvider.generate is a stub.');
  }

  async *generateStream(request: GenerateRequest): AsyncIterableIterator<string> {
    throw new Error('NotImplementedError: CatalystQuickMLProvider.generateStream is a stub.');
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('NotImplementedError: CatalystQuickMLProvider.embed is a stub.');
  }
}

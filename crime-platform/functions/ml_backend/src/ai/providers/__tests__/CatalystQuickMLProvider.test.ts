import { CatalystQuickMLProvider } from '../CatalystQuickMLProvider';
import { GenerateRequest } from '../../types';

describe('CatalystQuickMLProvider', () => {
  let provider: CatalystQuickMLProvider;
  
  beforeEach(() => {
    provider = new CatalystQuickMLProvider();
    jest.clearAllMocks();
    
    // Set environment variables required by the transport logic
    process.env.CATALYST_PROJECT_ID = 'test-proj-id';
    process.env.CATALYST_ORG_ID = 'test-org-id';
    process.env.CATALYST_ACCESS_TOKEN = 'test-token';
  });

  afterEach(() => {
    delete process.env.CATALYST_PROJECT_ID;
    delete process.env.CATALYST_ORG_ID;
    delete process.env.CATALYST_ACCESS_TOKEN;
  });

  it('should serialize request correctly', () => {
    const mockRequest: GenerateRequest = {
      prompt: 'Hello',
      history: [],
      messages: [{ id: '1', role: 'user', content: 'Hello Catalyst', timestamp: new Date() }],
      config: { model: 'glm-4', temperature: 0.7 }
    };

    const providerAny = provider as any;
    const internalReq = providerAny.serializeRequest(mockRequest);
    
    expect(internalReq.model).toBe('glm-4');
    expect(internalReq.temperature).toBe(0.7);
    expect(internalReq.messages).toEqual([{ role: 'user', content: 'Hello Catalyst' }]);
  });

  it('should retry on transient network errors and then fail', async () => {
    const providerAny = provider as any;
    
    // Mock the fetch call via overriding executeTransport for test isolation
    providerAny.executeTransport = jest.fn().mockRejectedValue({ status: 500, message: 'Internal Server Error' });
    
    const mockRequest: GenerateRequest = { prompt: 'Retry test', history: [], messages: [] };
    
    await expect(provider.generate(mockRequest)).rejects.toThrow(/ProviderError/);
    
    // It should have tried 3 times (the MAX_RETRIES)
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(3);
  });

  it('should not retry on AuthenticationError (401)', async () => {
    const providerAny = provider as any;
    
    // Mock transport to fail with 401
    providerAny.executeTransport = jest.fn().mockRejectedValue({ status: 401, message: 'Invalid credentials' });
    
    const mockRequest: GenerateRequest = { prompt: 'Auth test', history: [], messages: [] };
    
    await expect(provider.generate(mockRequest)).rejects.toThrow(/AuthenticationError/);
    
    // Should have only tried once because 401 is not in retryableStatuses
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(1);
  });

  it('should successfully map response if transport succeeds', async () => {
    const providerAny = provider as any;
    
    const mockCatalystResponse = {
      choices: [{
        message: { content: 'Hello back', reasoning: 'Thought process' },
        finish_reason: 'stop'
      }],
      usage: { total_tokens: 10 }
    };

    // Mock transport success
    providerAny.executeTransport = jest.fn().mockResolvedValue(mockCatalystResponse);
    
    const mockRequest: GenerateRequest = { prompt: 'Success test', history: [], messages: [] };
    
    const response = await provider.generate(mockRequest);
    
    expect(response.text).toBe('Hello back');
    expect(response.metadata?.reasoning).toBe('Thought process');
    expect(response.usage?.totalTokens).toBe(10);
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(1);
  });
});

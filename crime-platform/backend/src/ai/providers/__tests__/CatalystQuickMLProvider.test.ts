import { CatalystQuickMLProvider } from '../CatalystQuickMLProvider';
import { GenerateRequest } from '../../types';

describe('CatalystQuickMLProvider', () => {
  let provider: CatalystQuickMLProvider;
  
  beforeEach(() => {
    provider = new CatalystQuickMLProvider();
    jest.clearAllMocks();
  });

  it('should throw NotImplementedError on generate due to missing serialization details', async () => {
    const mockRequest: GenerateRequest = {
      prompt: 'Hello',
      history: []
    };

    await expect(provider.generate(mockRequest)).rejects.toThrow(/NotImplementedError: serializeRequest/);
  });

  it('should retry on transient network errors and then fail', async () => {
    // We need to bypass serializeRequest to test the retry loop
    const providerAny = provider as any;
    providerAny.serializeRequest = jest.fn().mockReturnValue({ modelName: 'test', payload: {} });
    
    // Mock the transport to consistently fail with a 500 error
    providerAny.executeTransport = jest.fn().mockRejectedValue({ status: 500, message: 'Internal Server Error' });
    
    const mockRequest: GenerateRequest = { prompt: 'Retry test', history: [] };
    
    await expect(provider.generate(mockRequest)).rejects.toThrow(/ProviderError/);
    
    // It should have tried 3 times (the MAX_RETRIES)
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(3);
  });

  it('should not retry on AuthenticationError (401)', async () => {
    const providerAny = provider as any;
    providerAny.serializeRequest = jest.fn().mockReturnValue({ modelName: 'test', payload: {} });
    
    // Mock transport to fail with 401
    providerAny.executeTransport = jest.fn().mockRejectedValue({ status: 401, message: 'Invalid credentials' });
    
    const mockRequest: GenerateRequest = { prompt: 'Auth test', history: [] };
    
    await expect(provider.generate(mockRequest)).rejects.toThrow(/AuthenticationError/);
    
    // Should have only tried once because 401 is not in retryableStatuses
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(1);
  });

  it('should successfully map response if transport succeeds', async () => {
    const providerAny = provider as any;
    providerAny.serializeRequest = jest.fn().mockReturnValue({ modelName: 'test', payload: {} });
    
    // Mock transport success
    providerAny.executeTransport = jest.fn().mockResolvedValue({ rawResponse: 'success' });
    
    // Mock deserializeResponse success
    const expectedResponse = { text: 'Hello back', finishReason: 'stop', usage: { totalTokens: 10 } };
    providerAny.deserializeResponse = jest.fn().mockReturnValue(expectedResponse);
    
    const mockRequest: GenerateRequest = { prompt: 'Success test', history: [] };
    
    const response = await provider.generate(mockRequest);
    
    expect(response).toEqual(expectedResponse);
    expect(providerAny.executeTransport).toHaveBeenCalledTimes(1);
    expect(providerAny.deserializeResponse).toHaveBeenCalledWith({ rawResponse: 'success' });
  });
});

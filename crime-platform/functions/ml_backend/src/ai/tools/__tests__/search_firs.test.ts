import { SearchFirsTool } from '../search_firs';
import { firService } from '../../../services/fir.service';

jest.mock('../../../services/fir.service', () => ({
  firService: {
    searchFirs: jest.fn()
  }
}));

describe('SearchFirsTool', () => {
  let tool: SearchFirsTool;

  beforeEach(() => {
    tool = new SearchFirsTool();
    jest.clearAllMocks();
  });

  it('should return successful ToolResult on successful search', async () => {
    const mockData = { data: [{ fir_number: '123' }] };
    (firService.searchFirs as jest.Mock).mockResolvedValue(mockData);

    const result = await tool.execute({ query: 'robbery', limit: 10 });

    expect(firService.searchFirs).toHaveBeenCalledWith(expect.objectContaining({
      query: 'robbery',
      limit: 10
    }));

    expect(result.success).toBe(true);
    expect(result.tool).toBe('search_firs');
    expect(result.data).toEqual(mockData);
    expect(result.metadata).toBeDefined();
    expect(result.metadata.source).toBe('firService');
    expect(result.metadata.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should return failure ToolResult on service error', async () => {
    (firService.searchFirs as jest.Mock).mockRejectedValue(new Error('DB Timeout'));

    const result = await tool.execute({ query: 'robbery' });

    expect(result.success).toBe(false);
    expect(result.tool).toBe('search_firs');
    expect(result.data).toEqual({ error: 'DB Timeout' });
    expect(result.metadata).toBeDefined();
  });
});

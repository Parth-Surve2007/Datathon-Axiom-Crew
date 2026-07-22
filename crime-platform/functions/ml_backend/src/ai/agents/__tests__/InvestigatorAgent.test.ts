import { InvestigatorAgent } from '../InvestigatorAgent';
import { ToolRegistry } from '../../tools/ToolRegistry';
import { ITool, ToolResult } from '../../tools/ITool';
import { AILogger } from '../../utils/AILogger';

// Mock AILogger
jest.mock('../../utils/AILogger', () => ({
  AILogger: {
    logAgentExecution: jest.fn(),
    logError: jest.fn()
  }
}));

class MockTool implements ITool {
  constructor(
    public name: string,
    public description: string,
    public parametersSchema: Record<string, any>,
    public executeMock: jest.Mock
  ) {}

  async execute(args: Record<string, any>): Promise<ToolResult> {
    return this.executeMock(args);
  }
}

describe('InvestigatorAgent', () => {
  let toolRegistry: ToolRegistry;
  let agent: InvestigatorAgent;

  beforeEach(() => {
    toolRegistry = new ToolRegistry();
    agent = new InvestigatorAgent(toolRegistry);
    jest.clearAllMocks();
  });

  it('should successfully execute investigation_brief', async () => {
    const mockCaseData = {
      fir: { fir_number: '123', status: 'Open', priority: 'High' },
      evidence: [{ type: 'person' }]
    };

    const getCaseDetailsMock = jest.fn().mockResolvedValue({
      success: true,
      tool: 'get_case_details',
      data: mockCaseData,
      citations: [],
      metadata: { executionTimeMs: 10, source: 'mock', repository: 'mock' }
    });

    toolRegistry.register(new MockTool('get_case_details', 'mock', {}, getCaseDetailsMock));

    const result = await agent.execute('investigation_brief', { caseId: '123' });

    expect(getCaseDetailsMock).toHaveBeenCalledWith({ case_id: '123' });
    expect(result.success).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.title).toBe('Case Summary: 123');
    expect(result.summary.riskFlags).toEqual([{ type: 'PRIORITY_FLAG', level: 'HIGH' }]);
    expect(result.toolExecutions.length).toBe(1);
    expect(AILogger.logAgentExecution).toHaveBeenCalledWith(
      'InvestigatorAgent',
      'investigation_brief',
      expect.any(Number),
      ['get_case_details'],
      true
    );
  });

  it('should handle tool failure gracefully', async () => {
    const getCaseDetailsMock = jest.fn().mockResolvedValue({
      success: false,
      tool: 'get_case_details',
      data: { error: 'DB Error' },
      citations: [],
      metadata: { executionTimeMs: 10, source: 'mock', repository: 'mock' }
    });

    toolRegistry.register(new MockTool('get_case_details', 'mock', {}, getCaseDetailsMock));

    const result = await agent.execute('investigation_brief', { caseId: '123' });

    expect(result.success).toBe(false);
    expect(result.summary.error).toContain('failed');
    expect(AILogger.logAgentExecution).toHaveBeenCalledWith(
      'InvestigatorAgent',
      'investigation_brief',
      expect.any(Number),
      ['get_case_details'],
      false
    );
    expect(AILogger.logError).toHaveBeenCalled();
  });

  it('should fail if skill is unknown', async () => {
    const result = await agent.execute('unknown_skill', {});
    expect(result.success).toBe(false);
    expect(result.summary.error).toContain('not recognized');
  });
});

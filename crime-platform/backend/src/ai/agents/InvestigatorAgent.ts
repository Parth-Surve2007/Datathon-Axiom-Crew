import { IAgent, AgentResult } from './IAgent';
import { ToolRegistry } from '../tools/ToolRegistry';
import { ToolResult } from '../tools/ITool';
import { AILogger } from '../utils/AILogger';

export class InvestigatorAgent implements IAgent {
  readonly name = 'InvestigatorAgent';
  readonly description = 'Orchestrates tools to generate higher-level investigative insights programmatically.';

  constructor(private toolRegistry: ToolRegistry) {}

  async execute(skill: string, args: Record<string, any>): Promise<AgentResult> {
    const startTime = Date.now();
    const toolExecutions: ToolResult[] = [];
    const toolCallNames: string[] = [];

    try {
      let summary: any;

      switch (skill) {
        case 'investigation_brief':
          summary = await this.investigationBrief(args, toolExecutions, toolCallNames);
          break;
        case 'find_repeat_offenders':
          summary = await this.findRepeatOffenders(args, toolExecutions, toolCallNames);
          break;
        case 'district_crime_report':
          summary = await this.districtCrimeReport(args, toolExecutions, toolCallNames);
          break;
        case 'network_analysis':
          summary = await this.networkAnalysis(args, toolExecutions, toolCallNames);
          break;
        default:
          throw new Error(`Skill ${skill} not recognized by ${this.name}.`);
      }

      const executionTimeMs = Date.now() - startTime;
      AILogger.logAgentExecution(this.name, skill, executionTimeMs, toolCallNames, true);

      return {
        success: true,
        agent: this.name,
        summary,
        toolExecutions,
        citations: [],
        metadata: { executionTimeMs }
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      AILogger.logAgentExecution(this.name, skill, executionTimeMs, toolCallNames, false);
      AILogger.logError('agent-execution', error, { agent: this.name, skill });

      return {
        success: false,
        agent: this.name,
        summary: { error: error.message },
        toolExecutions,
        citations: [],
        metadata: { executionTimeMs }
      };
    }
  }

  private async callTool(name: string, args: any, toolExecutions: ToolResult[], toolCallNames: string[]): Promise<any> {
    const tool = this.toolRegistry.getTool(name);
    if (!tool) throw new Error(`Tool ${name} not found in registry.`);
    
    toolCallNames.push(name);
    const result = await tool.execute(args);
    toolExecutions.push(result);
    
    if (!result.success) {
      throw new Error(`Tool ${name} failed: ${JSON.stringify(result.data)}`);
    }
    
    return result.data;
  }

  private async investigationBrief(args: Record<string, any>, executions: ToolResult[], names: string[]) {
    const caseId = args.caseId;
    if (!caseId) throw new Error("Missing caseId argument");

    const caseData = await this.callTool('get_case_details', { case_id: caseId }, executions, names);
    
    // Deterministic summary extraction
    const fir = caseData.fir || {};
    return {
      title: `Case Summary: ${fir.fir_number || caseId}`,
      status: fir.status || 'Unknown',
      persons: caseData.evidence?.filter((e: any) => e.type === 'person') || [],
      timeline: caseData.timeline || [],
      evidenceSummary: { count: caseData.evidence?.length || 0 },
      openTasks: [], // Placeholder for programmatic task extraction
      riskFlags: fir.priority === 'High' ? [{ type: 'PRIORITY_FLAG', level: 'HIGH' }] : []
    };
  }

  private async findRepeatOffenders(args: Record<string, any>, executions: ToolResult[], names: string[]) {
    const filters = args.filters || {};
    
    // 1. Search for FIRs matching filters
    const firSearch = await this.callTool('search_firs', { ...filters }, executions, names);
    
    // 2. We could extract persons, but for deterministic simulation, just take a mock ID from first FIR
    const firstFir = (firSearch.data || [])[0];
    const suspectId = firstFir?.suspect_id || 'UnknownSuspect';

    // 3. Find associates for this mock suspect
    const associatesData = await this.callTool('find_associates', { suspect_name: suspectId }, executions, names);

    return {
      repeatOffenders: associatesData.associates || [],
      frequency: associatesData.sharedFirs?.length || 0,
      linkedFirs: associatesData.sharedFirs || [],
      relationshipStrength: associatesData.relationshipStrength || 'Unknown'
    };
  }

  private async districtCrimeReport(args: Record<string, any>, executions: ToolResult[], names: string[]) {
    const district = args.district;
    if (!district) throw new Error("Missing district argument");

    const stats = await this.callTool('crime_statistics', { region: district }, executions, names);
    const firs = await this.callTool('search_firs', { district, limit: 5 }, executions, names);

    return {
      crimeSummary: {
        totalCases: stats.totals?.totalCases || 0,
        resolvedCases: stats.totals?.resolvedCases || 0
      },
      topCrimes: stats.charts?.distribution || [],
      recentFirs: firs.data || [],
      trend: stats.trend || 'Unknown',
      recommendations: [] // Placeholder for future rules-engine based recommendations
    };
  }

  private async networkAnalysis(args: Record<string, any>, executions: ToolResult[], names: string[]) {
    const personId = args.personId;
    if (!personId) throw new Error("Missing personId argument");

    const associatesData = await this.callTool('find_associates', { suspect_name: personId }, executions, names);

    return {
      networkSummary: {
        directConnectionsCount: associatesData.associates?.length || 0
      },
      keyAssociates: associatesData.associates || [],
      relationshipStrength: associatesData.relationshipStrength || 'Unknown',
      sharedCases: associatesData.sharedFirs || [],
      riskAssessment: {
        riskScore: associatesData.sharedFirs?.length > 2 ? 'High' : 'Low'
      }
    };
  }
}

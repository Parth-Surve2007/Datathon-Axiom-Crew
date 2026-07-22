import { ITool, ToolResult } from './ITool';
import { firService } from '../../services/fir.service';

export class GetCaseDetailsTool implements ITool {
  readonly name = 'get_case_details';
  readonly description = 'Retrieve detailed information about a specific case or FIR using its unique identifier.';
  
  readonly parametersSchema = {
    type: 'object',
    properties: {
      case_id: { type: 'string', description: 'The unique case ID or FIR number.' }
    },
    required: ['case_id']
  };

  async execute(args: Record<string, any>): Promise<ToolResult> {
    const startTime = Date.now();
    try {
      const details = await firService.getCaseDetails(args.case_id);
      
      return {
        success: true,
        tool: this.name,
        data: details,
        citations: [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: 'firService',
          repository: 'FirRepository, EvidenceRepository, etc.'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        tool: this.name,
        data: { error: error.message },
        citations: [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: 'firService',
          repository: 'FirRepository'
        }
      };
    }
  }
}

import { ITool, ToolResult } from './ITool';
import { firService } from '../../services/fir.service';

export class SearchFirsTool implements ITool {
  readonly name = 'search_firs';
  readonly description = 'Search for FIRs (First Information Reports) using keywords, dates, or locations.';
  
  readonly parametersSchema = {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query or keywords related to the FIR.' },
      location: { type: 'string', description: 'Location of the incident.' },
      date_from: { type: 'string', description: 'Start date in YYYY-MM-DD format.' },
      date_to: { type: 'string', description: 'End date in YYYY-MM-DD format.' }
    },
    required: ['query']
  };

  async execute(args: Record<string, any>): Promise<ToolResult> {
    const startTime = Date.now();
    try {
      const results = await firService.searchFirs({
        query: args.query,
        location: args.location,
        dateFrom: args.date_from,
        dateTo: args.date_to,
        page: args.page,
        limit: args.limit
      });

      return {
        success: true,
        tool: this.name,
        data: results,
        citations: [], // Populated by CitationEngine later if applicable
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: 'firService',
          repository: 'FirRepository'
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

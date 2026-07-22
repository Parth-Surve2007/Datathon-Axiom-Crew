import { ITool, ToolResult } from './ITool';
import { analyticsService } from '../../services/analytics.service';

export class CrimeStatisticsTool implements ITool {
  readonly name = 'crime_statistics';
  readonly description = 'Retrieve aggregated crime statistics based on region, time period, and crime type.';
  
  readonly parametersSchema = {
    type: 'object',
    properties: {
      region: { type: 'string', description: 'The region or district name.' },
      crime_type: { type: 'string', description: 'Type of crime (e.g., theft, assault).' },
      year: { type: 'number', description: 'The year for the statistics.' }
    },
    required: ['region']
  };

  async execute(args: Record<string, any>): Promise<ToolResult> {
    const startTime = Date.now();
    try {
      const data = await analyticsService.getCrimeStatistics({
        district: args.region,
        crimeType: args.crime_type,
        year: args.year
      });

      return {
        success: true,
        tool: this.name,
        data,
        citations: [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: 'analyticsService',
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
          source: 'analyticsService',
          repository: 'FirRepository'
        }
      };
    }
  }
}

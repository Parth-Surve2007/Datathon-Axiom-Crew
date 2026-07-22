import { ITool, ToolResult } from './ITool';
import { personService } from '../../services/person.service';

export class FindAssociatesTool implements ITool {
  readonly name = 'find_associates';
  readonly description = 'Find known associates, co-accused, or related individuals for a specific suspect.';
  
  readonly parametersSchema = {
    type: 'object',
    properties: {
      suspect_name: { type: 'string', description: 'The name of the suspect.' },
      suspect_id: { type: 'string', description: 'The unique ID of the suspect (optional).' }
    },
    required: ['suspect_name']
  };

  async execute(args: Record<string, any>): Promise<ToolResult> {
    const startTime = Date.now();
    try {
      const data = await personService.findAssociates(args.suspect_id || args.suspect_name);

      return {
        success: true,
        tool: this.name,
        data,
        citations: [],
        metadata: {
          executionTimeMs: Date.now() - startTime,
          source: 'personService',
          repository: 'PersonRepository'
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
          source: 'personService',
          repository: 'PersonRepository'
        }
      };
    }
  }
}

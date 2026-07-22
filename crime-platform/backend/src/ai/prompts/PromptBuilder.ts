import { ChatMessage, ExecutionContext } from '../types';
import { ContextBuilder } from '../context/ContextBuilder';

export class PromptBuilder {
  static buildSystemPrompt(intent: string = 'general', context?: ExecutionContext): ChatMessage {
    let basePrompt = `You are KrimeAI, an investigator assistant for the Karnataka State Police (KSP). You provide precise, analytical, and professional responses based strictly on the provided evidence.

CRITICAL INSTRUCTIONS:
- NEVER hallucinate crime data.
- ALWAYS call tools when structured information or case details are required.
- CITE retrieved evidence in your final response.
- NEVER fabricate FIR numbers.
- NEVER invent statistics.`;

    if (intent === 'investigation') {
      basePrompt += `\nYour primary role is to cross-reference FIRs, suspects, and MOs to assist investigating officers.`;
    } else if (intent === 'analytics') {
      basePrompt += `\nYour primary role is to interpret crime telemetry, identify trends, and analyze statistical data.`;
    }

    if (context) {
      const evidenceString = ContextBuilder.formatEvidence(context);
      basePrompt += `\n\n### RETRIEVED EVIDENCE:\n${evidenceString}`;
    }

    return {
      id: crypto.randomUUID(),
      role: 'system',
      content: basePrompt,
      timestamp: new Date(),
    };
  }
}

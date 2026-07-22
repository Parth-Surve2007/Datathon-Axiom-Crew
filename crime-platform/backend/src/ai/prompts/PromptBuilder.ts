import { ChatMessage, ExecutionContext } from '../types';
import { ContextBuilder } from '../context/ContextBuilder';

export class PromptBuilder {
  /**
   * Builds the System Prompt based on the specific intent (e.g., Investigator, Analytics).
   */
  static buildSystemPrompt(intent: string = 'general', context?: ExecutionContext): ChatMessage {
    let basePrompt = `You are KrimeAI, the advanced intelligence assistant for the Karnataka State Police (KSP). You provide precise, analytical, and professional responses based strictly on the provided evidence.`;

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

import { Request, Response, NextFunction } from 'express';
import { AIOrchestrator } from '../ai/orchestrator/AIOrchestrator';
import { ChatRequestSchema, ChatHistoryRequestSchema } from '../ai/types';

export class AIController {
  constructor(private orchestrator: AIOrchestrator) {}

  /**
   * POST /chat
   * Standard blocking chat request
   */
  chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ChatRequestSchema.parse(req.body);
      // Stub: Extract userId from auth middleware context
      const userId = (req as any).user?.id || 'anonymous';
      const sessionId = parsed.sessionId || crypto.randomUUID();

      const response = await this.orchestrator.processRequest(sessionId, userId, parsed.message);
      
      res.json({
        ok: true,
        data: {
          sessionId,
          ...response
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /chat/stream
   * Streams response via Server-Sent Events (SSE)
   */
  streamChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ChatRequestSchema.parse(req.body);
      const userId = (req as any).user?.id || 'anonymous';
      const sessionId = parsed.sessionId || crypto.randomUUID();

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const stream = this.orchestrator.processStream(sessionId, userId, parsed.message);

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }
  };

  /**
   * GET /chat/history
   */
  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    // Controller logic stub relying on ConversationMemory directly via DI
    res.json({ ok: true, data: [] });
  };

  /**
   * DELETE /chat/history
   */
  deleteHistory = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ ok: true, message: 'History cleared' });
  };

  /**
   * POST /chat/export
   */
  exportChat = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ ok: true, exportData: '...' });
  };

  /**
   * POST /chat/feedback
   */
  submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ ok: true });
  };
}

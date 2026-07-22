import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { aiAuthMiddleware } from '../middleware/ai-auth.middleware';
import { AIOrchestrator } from '../ai/orchestrator/AIOrchestrator';

// In a real DI setup, these instances would be injected.
// Since manual constructor injection was requested:
const stubProvider = {} as any;
const stubRetriever = {} as any;
const stubToolRegistry = {} as any;
const stubMemory = {} as any;

const orchestrator = new AIOrchestrator(stubProvider, stubRetriever, stubToolRegistry, stubMemory);
const aiController = new AIController(orchestrator);

const router = Router();

// Apply AI-specific authentication and rate limiting
router.use(aiAuthMiddleware);

router.post('/chat', aiController.chat);
router.post('/chat/stream', aiController.streamChat);
router.get('/chat/history', aiController.getHistory);
router.delete('/chat/history', aiController.deleteHistory);
router.post('/chat/export', aiController.exportChat);
router.post('/chat/feedback', aiController.submitFeedback);

export default router;

import { Router } from 'express';
import { healthCheck, readinessCheck } from '@controllers/health.controller';

const router = Router();

/** GET /health */
router.get('/', healthCheck);

/** GET /health/ready */
router.get('/ready', readinessCheck);

export default router;

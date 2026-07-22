import { Router } from 'express';
import v1Router from './v1/index';
import healthRouter from './health.routes';
import { appConfig } from '@config/index';

const router = Router();

/** Health check — no versioning, always reachable */
router.use('/health', healthRouter);

/** Versioned API routes */
router.use(`/api/${appConfig.apiVersion}`, v1Router);

/** API info endpoint */
router.get('/api', (_req, res) => {
  res.json({
    name: appConfig.appName,
    version: appConfig.apiVersion,
    status: 'operational',
    docs: `/api/${appConfig.apiVersion}/docs`,
  });
});

export default router;

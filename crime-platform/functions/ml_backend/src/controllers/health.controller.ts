import type { Request, Response } from 'express';
import { sendSuccess } from '@utils/response';
import { appConfig } from '@config/index';
import os from 'os';

/**
 * GET /health
 * Returns platform uptime, memory stats, and environment info.
 */
export const healthCheck = (_req: Request, res: Response): void => {
  const memUsage = process.memoryUsage();

  sendSuccess(res, {
    status: 'healthy',
    service: appConfig.appName,
    version: process.env.npm_package_version ?? '1.0.0',
    environment: appConfig.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      cpus: os.cpus().length,
      freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    },
    process: {
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memUsage.heapTotal / 1024 / 1024),
      rssMb: Math.round(memUsage.rss / 1024 / 1024),
      pid: process.pid,
    },
  }, { message: 'Service is operational' });
};

/**
 * GET /health/ready
 * Readiness probe — checks external dependencies.
 */
export const readinessCheck = (_req: Request, res: Response): void => {
  // TODO: Add DB and Catalyst ping checks when connectors are wired up
  sendSuccess(res, {
    status: 'ready',
    checks: {
      database: 'pending',
      catalyst: 'pending',
      aiService: 'pending',
    },
  }, { message: 'Readiness check' });
};

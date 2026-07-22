import morgan from 'morgan';
import { logger } from '@config/logger';
import type { Request, Response } from 'express';

// Custom Morgan token: request ID
morgan.token('request-id', (req: Request) => req.requestId);
morgan.token('user-id', (req: Request) => req.user?.id ?? '-');

/** HTTP request logger using morgan piped through pino. */
export const requestLogger = morgan(
  ':request-id :method :url :status :res[content-length] - :response-time ms user=:user-id',
  {
    stream: {
      write: (message: string) =>
        logger.info({ module: 'HttpAccess' }, message.trim()),
    },
    skip: (req: Request) => {
      // Skip health checks from logging to reduce noise
      return req.url === '/health' || req.url === '/api/health';
    },
  },
);

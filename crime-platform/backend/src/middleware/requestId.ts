import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import type { AsyncRequestHandler } from '../types/api';

/**
 * Injects a unique X-Request-ID on every request and stamps request start time.
 * If the client sends its own X-Request-ID header, that is used instead.
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = id;
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Wraps an async Express handler to catch unhandled promise rejections
 * and forward them to the global error handler.
 */
export const asyncHandler =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

import type { Request, Response, NextFunction } from 'express';
import type { AsyncRequestHandler } from '@app-types/index';

/**
 * Wraps an async Express handler so that any thrown error is forwarded
 * to the global error handler via `next(err)` — eliminating boilerplate
 * try/catch in every controller method.
 *
 * Usage:
 *   router.get('/cases', asyncHandler(caseController.list));
 */
export const asyncHandler =
  (fn: AsyncRequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

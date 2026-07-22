import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@utils/errors';
import { sendError } from '@utils/response';
import { HTTP_STATUS } from '@constants/http';
import { createLogger } from '@config/logger';
import { appConfig } from '@config/index';

const log = createLogger('ErrorHandler');

/**
 * Global Express error handler.
 * Must be registered LAST, after all routes.
 */
export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Operational (known) errors ─────────────────────────────────────────────
  if (err instanceof AppError) {
    if (!err.isOperational) {
      log.error({ err, requestId: req.requestId }, 'Programmer error caught');
    } else {
      log.warn({ err, requestId: req.requestId }, err.message);
    }

    sendError(res, {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: appConfig.isDev ? err.details : undefined,
    });
    return;
  }

  // ── Unknown / programmer errors ────────────────────────────────────────────
  log.error(
    { err, requestId: req.requestId, url: req.url, method: req.method },
    'Unhandled error',
  );

  sendError(res, {
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    details: appConfig.isDev && err instanceof Error ? err.stack : undefined,
  });
};

/**
 * 404 handler for unmatched routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, {
    statusCode: HTTP_STATUS.NOT_FOUND,
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} does not exist`,
  });
};

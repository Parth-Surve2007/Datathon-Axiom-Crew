import rateLimit from 'express-rate-limit';
import { rateLimitConfig } from '@config/index';
import { sendError } from '@utils/response';
import { HTTP_STATUS } from '@constants/http';
import type { Request, Response } from 'express';

export const defaultRateLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip ?? req.requestId,
  handler: (_req: Request, res: Response) => {
    sendError(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      code: 'RATE_LIMITED',
      message: 'Too many requests from this IP. Please try again later.',
    });
  },
});

/** Stricter rate limiter for auth routes */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  keyGenerator: (req: Request) => req.ip ?? req.requestId,
  handler: (_req: Request, res: Response) => {
    sendError(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});

import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { ValidationError } from '@utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Express middleware factory that validates req[target] against a Zod schema.
 * Attaches the validated & coerced data back to the request.
 *
 * Usage:
 *   router.post('/firs', validate(CreateFirSchema), firController.create);
 */
export const validate =
  <T>(schema: ZodSchema<T>, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const formatted = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ValidationError('Request validation failed', formatted));
    }

    // Replace with coerced/typed value
    (req as unknown as Record<string, unknown>)[target] = result.data;
    next();
  };

// ─── Reusable Schema Primitives ────────────────────────────────────────────────
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

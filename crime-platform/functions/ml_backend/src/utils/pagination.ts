import { z } from 'zod';
import type { Request } from 'express';
import { PAGINATION } from '@constants/index';
import { BadRequestError } from '@utils/errors';

// ─── Pagination Query Schema ───────────────────────────────────────────────────
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Parses and validates pagination query parameters from an Express request.
 * Throws `BadRequestError` if the query params are invalid.
 */
export const parsePagination = (req: Request): PaginationQuery => {
  const result = paginationQuerySchema.safeParse(req.query);
  if (!result.success) {
    const details = result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
    throw new BadRequestError('Invalid pagination parameters', details);
  }
  return result.data;
};

/**
 * Calculates the SQL/ZCQL offset from page + limit.
 */
export const calcOffset = (page: number, limit: number): number => (page - 1) * limit;

/**
 * Safely coerces a raw query param value to a string (or undefined).
 */
export const queryString = (val: unknown): string | undefined =>
  typeof val === 'string' && val.trim().length > 0 ? val.trim() : undefined;

/**
 * Safely coerces a raw query param value to a UUID string (or undefined).
 */
export const queryUuid = (val: unknown): string | undefined => {
  const s = queryString(val);
  if (!s) return undefined;
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_RE.test(s) ? s : undefined;
};

/**
 * Safely coerces a raw query param value to a Date (or undefined).
 */
export const queryDate = (val: unknown): Date | undefined => {
  const s = queryString(val);
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
};

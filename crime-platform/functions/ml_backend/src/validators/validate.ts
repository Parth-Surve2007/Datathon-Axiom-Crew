import { z } from 'zod';

// ─── Reusable Schema Primitives ────────────────────────────────────────────────

/** Validates UUID format */
export const uuidSchema = z.string().uuid();

/** Validates ISO 8601 date string */
export const isoDateSchema = z.string().datetime({ offset: true });

/** Validates Indian phone number (10 digits) */
export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number');

/** Validates Karnataka Police badge format */
export const badgeIdSchema = z
  .string()
  .regex(/^[A-Z]{2,4}-\d{4,6}$/, 'Badge ID must be in format: BLR-4921');

/** Pagination query schema */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/** Date range schema */
export const dateRangeSchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
  })
  .refine(d => new Date(d.from) <= new Date(d.to), {
    message: '"from" must be before "to"',
    path: ['from'],
  });

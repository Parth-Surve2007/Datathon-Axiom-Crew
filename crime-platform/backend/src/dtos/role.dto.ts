import { z } from 'zod';
import { uuidSchema, searchQuerySchema, idParamSchema } from './common.dto';

// ─── Create Role ───────────────────────────────────────────────────────────────
export const createRoleDtoSchema = z.object({
  name: z.string().min(2).max(50).trim(),
});

export type CreateRoleDto = z.infer<typeof createRoleDtoSchema>;

// ─── Query Roles ───────────────────────────────────────────────────────────────
export const queryRolesSchema = searchQuerySchema;

export type QueryRolesDto = z.infer<typeof queryRolesSchema>;

// ─── Params ────────────────────────────────────────────────────────────────────
export const roleIdParamSchema = idParamSchema;

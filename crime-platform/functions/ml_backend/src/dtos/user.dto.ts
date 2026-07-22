import { z } from 'zod';
import { uuidSchema, emailSchema, userRoleSchema, searchQuerySchema, idParamSchema } from './common.dto';

// ─── Create User ───────────────────────────────────────────────────────────────
export const createUserDtoSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  roleId: uuidSchema,
  officerId: uuidSchema.optional(), // Only officers have this
  isActive: z.boolean().optional().default(true),
});

export type CreateUserDto = z.infer<typeof createUserDtoSchema>;

// ─── Update User ───────────────────────────────────────────────────────────────
export const updateUserDtoSchema = createUserDtoSchema.partial().extend({
  password: z.string().min(8).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserDtoSchema>;

// ─── Query Users ───────────────────────────────────────────────────────────────
export const queryUsersSchema = searchQuerySchema.extend({
  roleId: uuidSchema.optional(),
  officerId: uuidSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;

// ─── Params ────────────────────────────────────────────────────────────────────
export const userIdParamSchema = idParamSchema;

// ─── Response Views (Optional) ────────────────────────────────────────────────
// Helps strip password_hash before returning to client
export const userResponseSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  roleId: uuidSchema,
  officerId: uuidSchema.nullable().optional(),
  isActive: z.boolean(),
  lastLogin: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

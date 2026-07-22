import { z } from 'zod';
import { emailSchema } from './common.dto';

// ─── Auth / Login ──────────────────────────────────────────────────────────────
export const loginDtoSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

// ─── Change Password ───────────────────────────────────────────────────────────
export const changePasswordDtoSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export type ChangePasswordDto = z.infer<typeof changePasswordDtoSchema>;

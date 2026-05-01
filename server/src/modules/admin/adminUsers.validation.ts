import { AdminRole, AdminStatus } from '@prisma/client';
import { z } from 'zod';

export const createAdminUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string().trim().min(1).max(80),
  password: z.string().min(8).max(200),
  role: z.enum(AdminRole).default(AdminRole.STAFF),
});

export const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  role: z.enum(AdminRole).optional(),
  status: z.enum(AdminStatus).optional(),
});

export const resetAdminPasswordSchema = z.object({
  password: z.string().min(8).max(200),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type ResetAdminPasswordInput = z.infer<typeof resetAdminPasswordSchema>;


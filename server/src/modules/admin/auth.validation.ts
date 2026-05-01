import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;

import { z } from 'zod';

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(1).max(50),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{6,30}$/),
  password: z.string().min(8).max(200),
});

export const customerLoginSchema = z.object({
  phone: z.string().trim().min(6).max(30),
  password: z.string().min(1).max(200),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;

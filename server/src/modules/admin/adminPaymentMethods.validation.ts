import { PaymentMethodType } from '@prisma/client';
import { z } from 'zod';

export const createAdminPaymentMethodSchema = z.object({
  type: z.enum(PaymentMethodType),
  name: z.string().trim().min(1).max(120),
  qrCodeUrl: z.string().trim().min(1).max(500),
  instructions: z.string().trim().min(1).max(1000),
  enabled: z.boolean().optional(),
});

export const updateAdminPaymentMethodSchema = createAdminPaymentMethodSchema.partial();

export type CreateAdminPaymentMethodInput = z.infer<typeof createAdminPaymentMethodSchema>;
export type UpdateAdminPaymentMethodInput = z.infer<typeof updateAdminPaymentMethodSchema>;

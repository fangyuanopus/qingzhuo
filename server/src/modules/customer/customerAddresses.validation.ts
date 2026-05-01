import { z } from 'zod';

export const customerAddressSchema = z.object({
  receiverName: z.string().trim().min(1).max(50),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{6,30}$/),
  address: z.string().trim().min(5).max(200),
  isDefault: z.boolean().optional(),
});

export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;


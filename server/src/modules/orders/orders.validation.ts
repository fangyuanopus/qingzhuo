import { z } from 'zod';

export const createOrderSchema = z.object({
  skuId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  customer: z.object({
    name: z.string().trim().min(1).max(50),
    phone: z.string().trim().regex(/^[0-9+\-\s()]{6,30}$/),
    address: z.string().trim().min(5).max(200),
  }),
  remark: z.string().trim().max(300).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

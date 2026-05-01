import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

const orderStatusValues = Object.values(OrderStatus) as [OrderStatus, ...OrderStatus[]];

export const adminOrderListSchema = z.object({
  status: z.enum(orderStatusValues).optional(),
  keyword: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
  note: z.string().trim().max(300).optional(),
});

export const updateShippingSchema = z.object({
  shippingCarrier: z.string().trim().min(1).max(50),
  trackingNo: z.string().trim().min(1).max(80),
  note: z.string().trim().max(300).optional(),
});

export type AdminOrderListInput = z.infer<typeof adminOrderListSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>;

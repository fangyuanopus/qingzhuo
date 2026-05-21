import { ProductStatus, SkuStatus } from '@prisma/client';
import { z } from 'zod';

const skuInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  spec: z.string().trim().min(1).max(120),
  priceCents: z.number().int().min(1),
  originalPriceCents: z.number().int().min(1).nullable().optional(),
  stock: z.number().int().min(0),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  status: z.enum(SkuStatus).optional(),
});

export const createAdminProductSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(ProductStatus).optional(),
  skus: z.array(skuInputSchema).min(1).max(20),
});

export const updateAdminProductSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  status: z.enum(ProductStatus).optional(),
});

export const updateAdminSkuSchema = skuInputSchema.partial();

export type CreateAdminProductInput = z.infer<typeof createAdminProductSchema>;
export type UpdateAdminProductInput = z.infer<typeof updateAdminProductSchema>;
export type UpdateAdminSkuInput = z.infer<typeof updateAdminSkuSchema>;

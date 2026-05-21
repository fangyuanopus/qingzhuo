import { ProductStatus, SkuStatus } from '@prisma/client';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type {
  CreateAdminProductInput,
  UpdateAdminProductInput,
  UpdateAdminSkuInput,
} from './adminProducts.validation';

const skuSelect = {
  id: true,
  productId: true,
  name: true,
  spec: true,
  priceCents: true,
  originalPriceCents: true,
  stock: true,
  imageUrl: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

const productSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  skus: {
    orderBy: { createdAt: 'asc' as const },
    select: skuSelect,
  },
};

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    select: productSelect,
  });

  return { products };
}

export async function createAdminProduct(input: CreateAdminProductInput) {
  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? ProductStatus.ACTIVE,
      skus: {
        create: input.skus.map((sku) => ({
          name: sku.name,
          spec: sku.spec,
          priceCents: sku.priceCents,
          originalPriceCents: sku.originalPriceCents ?? null,
          stock: sku.stock,
          imageUrl: sku.imageUrl ?? null,
          status: sku.status ?? SkuStatus.ACTIVE,
        })),
      },
    },
    select: productSelect,
  });

  return { product };
}

export async function updateAdminProduct(id: string, input: UpdateAdminProductInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Product not found');
  }

  const product = await prisma.product.update({
    where: { id },
    data: input,
    select: productSelect,
  });

  return { product };
}

export async function updateAdminSku(id: string, input: UpdateAdminSkuInput) {
  const existing = await prisma.sku.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'SKU not found');
  }

  const sku = await prisma.sku.update({
    where: { id },
    data: input,
    select: skuSelect,
  });

  return { sku };
}

import { ProductStatus, SkuStatus } from '@prisma/client';
import { prisma } from '../../db';

export async function listActiveProducts() {
  return prisma.product.findMany({
    where: { status: ProductStatus.ACTIVE },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      skus: {
        where: { status: SkuStatus.ACTIVE },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          spec: true,
          priceCents: true,
          originalPriceCents: true,
          stock: true,
          imageUrl: true,
        },
      },
    },
  });
}

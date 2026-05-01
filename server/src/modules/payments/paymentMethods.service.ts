import { prisma } from '../../db';

export async function listEnabledPaymentMethods() {
  return prisma.paymentMethod.findMany({
    where: { enabled: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      type: true,
      name: true,
      qrCodeUrl: true,
      instructions: true,
    },
  });
}

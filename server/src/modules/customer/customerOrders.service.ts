import { prisma } from '../../db';

export async function listMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      customer: true,
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function getMyOrder(userId: string, orderNo: string) {
  return prisma.order.findFirst({
    where: { userId, orderNo },
    include: {
      items: true,
      customer: true,
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
  });
}

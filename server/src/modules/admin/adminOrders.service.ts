import { AuditAction, OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type {
  AdminOrderListInput,
  UpdateOrderStatusInput,
  UpdateShippingInput,
} from './adminOrders.validation';

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID_CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.PAID_CONFIRMED]: [OrderStatus.SHIPPING, OrderStatus.REFUNDED],
  [OrderStatus.SHIPPING]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!allowedTransitions[from].includes(to)) {
    throw new HttpError(400, `Invalid order status transition: ${from} -> ${to}`);
  }
}

function listWhere(input: AdminOrderListInput): Prisma.OrderWhereInput {
  const keyword = input.keyword?.trim();
  return {
    ...(input.status ? { status: input.status } : {}),
    ...(keyword
      ? {
          OR: [
            { orderNo: { contains: keyword } },
            { customer: { name: { contains: keyword } } },
            { customer: { phone: { contains: keyword } } },
          ],
        }
      : {}),
  };
}

export async function listAdminOrders(input: AdminOrderListInput) {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: input.pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true,
      },
    }),
  ]);

  return {
    total,
    page: input.page,
    pageSize: input.pageSize,
    orders: orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      totalAmountCents: order.totalAmountCents,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: order.createdAt,
    })),
  };
}

export async function getAdminOrderDetail(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      statusLogs: {
        orderBy: { createdAt: 'asc' },
        include: {
          operator: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  return order;
}

export async function updateAdminOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
  operatorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) {
      throw new HttpError(404, 'Order not found');
    }

    assertTransition(order.status, input.status);

    const updated = await tx.order.update({
      where: { id },
      data: { status: input.status },
      include: {
        customer: true,
        items: true,
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: id,
        fromStatus: order.status,
        toStatus: input.status,
        operatorId,
        note: input.note,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.ORDER_STATUS_UPDATED,
        actorAdminId: operatorId,
        targetType: 'Order',
        targetId: id,
        metadataJson: JSON.stringify({ from: order.status, to: input.status }),
      },
    });

    return updated;
  });
}

export async function updateAdminOrderShipping(
  id: string,
  input: UpdateShippingInput,
  operatorId: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) {
      throw new HttpError(404, 'Order not found');
    }

    assertTransition(order.status, OrderStatus.SHIPPING);

    const updated = await tx.order.update({
      where: { id },
      data: {
        status: OrderStatus.SHIPPING,
        shippingCarrier: input.shippingCarrier,
        trackingNo: input.trackingNo,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    await tx.orderStatusLog.create({
      data: {
        orderId: id,
        fromStatus: order.status,
        toStatus: OrderStatus.SHIPPING,
        operatorId,
        note: input.note ?? `发货：${input.shippingCarrier} ${input.trackingNo}`,
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.ORDER_SHIPPING_UPDATED,
        actorAdminId: operatorId,
        targetType: 'Order',
        targetId: id,
        metadataJson: JSON.stringify({
          shippingCarrier: input.shippingCarrier,
          trackingNo: input.trackingNo,
        }),
      },
    });

    return updated;
  });
}

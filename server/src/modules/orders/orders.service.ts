import { OrderStatus, ProductStatus, SkuStatus } from '@prisma/client';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import { listEnabledPaymentMethods } from '../payments/paymentMethods.service';
import type { CreateOrderInput } from './orders.validation';

function createOrderNo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `QZ${date}${random}`;
}

export async function createOrder(input: CreateOrderInput, userId?: string) {
  const order = await prisma.$transaction(async (tx) => {
    const sku = await tx.sku.findUnique({
      where: { id: input.skuId },
      include: { product: true },
    });

    if (!sku || sku.status !== SkuStatus.ACTIVE || sku.product.status !== ProductStatus.ACTIVE) {
      throw new HttpError(400, 'SKU is not available');
    }

    if (sku.stock < input.quantity) {
      throw new HttpError(400, 'Insufficient stock');
    }

    const existingCustomer = await tx.customer.findFirst({
      where: {
        phone: input.customer.phone,
        address: input.customer.address,
      },
    });
    const customer = existingCustomer
      ? await tx.customer.update({
          where: { id: existingCustomer.id },
          data: { name: input.customer.name },
        })
      : await tx.customer.create({
          data: {
            name: input.customer.name,
            phone: input.customer.phone,
            address: input.customer.address,
          },
        });

    const subtotalCents = sku.priceCents * input.quantity;
    const orderNo = createOrderNo();

    const created = await tx.order.create({
      data: {
        orderNo,
        customerId: customer.id,
        userId,
        status: OrderStatus.PENDING_PAYMENT,
        totalAmountCents: subtotalCents,
        remark: input.remark,
        items: {
          create: {
            skuId: sku.id,
            skuNameSnapshot: sku.name,
            unitPriceCents: sku.priceCents,
            quantity: input.quantity,
            subtotalCents,
          },
        },
        statusLogs: {
          create: {
            toStatus: OrderStatus.PENDING_PAYMENT,
            note: '订单已创建，等待扫码付款',
          },
        },
      },
      include: {
        items: true,
      },
    });

    await tx.sku.update({
      where: { id: sku.id },
      data: { stock: { decrement: input.quantity } },
    });

    return created;
  });

  return {
    orderNo: order.orderNo,
    status: order.status,
    totalAmountCents: order.totalAmountCents,
    paymentMethods: await listEnabledPaymentMethods(),
  };
}

export async function getOrderByOrderNo(orderNo: string) {
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: {
      customer: true,
      items: true,
      statusLogs: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!order) {
    throw new HttpError(404, 'Order not found');
  }

  return order;
}

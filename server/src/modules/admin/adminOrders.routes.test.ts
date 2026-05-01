import { OrderStatus } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { prisma } from '../../db';
import {
  resetDatabase,
  seedAdmin,
  seedPendingOrder,
  testAdminPassword,
} from '../../testUtils';

async function adminToken() {
  const response = await request(createApp()).post('/api/admin/login').send({
    email: 'admin@qingzhuo.local',
    password: testAdminPassword,
  });
  return response.body.token as string;
}

describe('admin orders API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('lists orders for admins', async () => {
    const { order } = await seedPendingOrder();
    const token = await adminToken();

    const response = await request(createApp())
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.orders[0]).toMatchObject({
      id: order.id,
      orderNo: order.orderNo,
      status: OrderStatus.PENDING_PAYMENT,
      customerName: '张三',
      customerPhone: '13800138000',
    });
  });

  it('views order detail', async () => {
    const { order } = await seedPendingOrder();
    const token = await adminToken();

    const response = await request(createApp())
      .get(`/api/admin/orders/${order.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.order.customer.name).toBe('张三');
    expect(response.body.order.items).toHaveLength(1);
    expect(response.body.order.statusLogs).toHaveLength(1);
  });

  it('confirms payment, marks shipping, and completes an order', async () => {
    const { order } = await seedPendingOrder();
    const token = await adminToken();
    const app = createApp();

    const paid = await request(app)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.PAID_CONFIRMED, note: '已核对收款' });

    expect(paid.status).toBe(200);
    expect(paid.body.order.status).toBe(OrderStatus.PAID_CONFIRMED);

    const shipping = await request(app)
      .patch(`/api/admin/orders/${order.id}/shipping`)
      .set('Authorization', `Bearer ${token}`)
      .send({ shippingCarrier: '顺丰', trackingNo: 'SF1234567890' });

    expect(shipping.status).toBe(200);
    expect(shipping.body.order).toMatchObject({
      status: OrderStatus.SHIPPING,
      shippingCarrier: '顺丰',
      trackingNo: 'SF1234567890',
    });

    const completed = await request(app)
      .patch(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.COMPLETED });

    expect(completed.status).toBe(200);
    expect(completed.body.order.status).toBe(OrderStatus.COMPLETED);

    const logs = await prisma.orderStatusLog.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(logs.map((log) => log.toStatus)).toEqual([
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.PAID_CONFIRMED,
      OrderStatus.SHIPPING,
      OrderStatus.COMPLETED,
    ]);
  });

  it('rejects invalid status transitions', async () => {
    const { order } = await seedPendingOrder();
    const token = await adminToken();

    const response = await request(createApp())
      .patch(`/api/admin/orders/${order.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: OrderStatus.COMPLETED });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid order status transition');
  });
});

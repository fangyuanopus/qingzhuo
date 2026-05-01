import { OrderStatus, SkuStatus } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { prisma } from '../../db';
import { resetDatabase, seedPaymentMethods, seedProduct } from '../../testUtils';

describe('orders API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates an order using database price and decrements stock', async () => {
    const product = await seedProduct();
    await seedPaymentMethods();
    const sku = product.skus.find((item) => item.status === SkuStatus.ACTIVE)!;

    const response = await request(createApp())
      .post('/api/orders')
      .send({
        skuId: sku.id,
        quantity: 2,
        customer: {
          name: '李四',
          phone: '13800138000',
          address: '福建省福州市仓山区测试路 1 号',
        },
        remark: '请尽快发货',
        totalAmountCents: 1,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: OrderStatus.PENDING_PAYMENT,
      totalAmountCents: 7980,
    });
    expect(response.body.orderNo).toMatch(/^QZ\d{14}$/);
    expect(response.body.paymentMethods).toHaveLength(2);

    const updatedSku = await prisma.sku.findUniqueOrThrow({ where: { id: sku.id } });
    expect(updatedSku.stock).toBe(8);

    const order = await prisma.order.findUniqueOrThrow({
      where: { orderNo: response.body.orderNo },
      include: { items: true, statusLogs: true },
    });
    expect(order.items[0].unitPriceCents).toBe(3990);
    expect(order.statusLogs[0].toStatus).toBe(OrderStatus.PENDING_PAYMENT);
  });

  it('rejects inactive skus', async () => {
    const product = await seedProduct();
    const sku = product.skus.find((item) => item.status === SkuStatus.INACTIVE)!;

    const response = await request(createApp())
      .post('/api/orders')
      .send({
        skuId: sku.id,
        quantity: 1,
        customer: {
          name: '李四',
          phone: '13800138000',
          address: '福建省福州市仓山区测试路 1 号',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('SKU is not available');
  });

  it('rejects insufficient stock', async () => {
    const product = await seedProduct();
    const sku = product.skus.find((item) => item.status === SkuStatus.ACTIVE)!;

    const response = await request(createApp())
      .post('/api/orders')
      .send({
        skuId: sku.id,
        quantity: 11,
        customer: {
          name: '李四',
          phone: '13800138000',
          address: '福建省福州市仓山区测试路 1 号',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Insufficient stock');
  });

  it('rejects invalid customer fields', async () => {
    const product = await seedProduct();
    const sku = product.skus.find((item) => item.status === SkuStatus.ACTIVE)!;

    const response = await request(createApp())
      .post('/api/orders')
      .send({
        skuId: sku.id,
        quantity: 1,
        customer: {
          name: '',
          phone: 'abc',
          address: '短',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation failed');
  });
});

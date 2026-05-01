import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedPaymentMethods, seedProduct } from '../../testUtils';

async function registerCustomer(app: ReturnType<typeof createApp>, phone: string) {
  const response = await request(app).post('/api/auth/register').send({
    name: `用户${phone.slice(-4)}`,
    phone,
    password: 'safe-password-123',
  });
  return response.body.token as string;
}

describe('customer order ownership', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('binds authenticated orders to the current user and hides other users orders', async () => {
    const app = createApp();
    const product = await seedProduct();
    await seedPaymentMethods();
    const skuId = product.skus[0].id;
    const tokenA = await registerCustomer(app, '13900139000');
    const tokenB = await registerCustomer(app, '13900139001');

    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        skuId,
        quantity: 1,
        customer: {
          name: '林同学',
          phone: '13900139000',
          address: '福建省福州市仓山区测试路 1 号',
        },
      });

    expect(created.status).toBe(201);

    const mine = await request(app)
      .get('/api/me/orders')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(mine.status).toBe(200);
    expect(mine.body.orders).toHaveLength(1);
    expect(mine.body.orders[0].orderNo).toBe(created.body.orderNo);

    const other = await request(app)
      .get('/api/me/orders')
      .set('Authorization', `Bearer ${tokenB}`);
    expect(other.status).toBe(200);
    expect(other.body.orders).toHaveLength(0);
  });

  it('requires login to view my orders', async () => {
    const response = await request(createApp()).get('/api/me/orders');

    expect(response.status).toBe(401);
  });
});

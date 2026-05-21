import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedAdmin, seedPaymentMethods, testAdminPassword } from '../../testUtils';

async function adminToken() {
  const response = await request(createApp()).post('/api/admin/login').send({
    email: 'admin@qingzhuo.local',
    password: testAdminPassword,
  });
  return response.body.token as string;
}

describe('admin payment methods API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('lets an admin list, create, update, and disable payment methods', async () => {
    await seedPaymentMethods();
    const token = await adminToken();
    const app = createApp();

    const list = await request(app)
      .get('/api/admin/payment-methods')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.paymentMethods).toHaveLength(3);

    const created = await request(app)
      .post('/api/admin/payment-methods')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'WECHAT',
        name: 'Backup WeChat QR',
        qrCodeUrl: '/assets/qingzhuo/logo-transparent.png',
        instructions: 'Use backup QR for manual payment',
        enabled: true,
      });

    expect(created.status).toBe(201);
    expect(created.body.paymentMethod).toMatchObject({
      type: 'WECHAT',
      name: 'Backup WeChat QR',
      enabled: true,
    });

    const updated = await request(app)
      .patch(`/api/admin/payment-methods/${created.body.paymentMethod.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Disabled backup QR',
        enabled: false,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.paymentMethod).toMatchObject({
      id: created.body.paymentMethod.id,
      name: 'Disabled backup QR',
      enabled: false,
    });
  });
});

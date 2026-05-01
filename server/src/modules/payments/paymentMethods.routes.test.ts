import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedPaymentMethods } from '../../testUtils';

describe('GET /api/payment-methods', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns enabled payment methods only', async () => {
    await seedPaymentMethods();

    const response = await request(createApp()).get('/api/payment-methods');

    expect(response.status).toBe(200);
    expect(response.body.paymentMethods).toHaveLength(2);
    expect(response.body.paymentMethods.map((method: { name: string }) => method.name)).toEqual([
      '微信扫码付款',
      '支付宝扫码付款',
    ]);
  });
});

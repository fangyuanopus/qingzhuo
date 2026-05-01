import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase } from '../../testUtils';

async function customerToken(app: ReturnType<typeof createApp>) {
  const response = await request(app).post('/api/auth/register').send({
    name: 'Address Test',
    phone: '13900139003',
    password: 'safe-password-123',
  });
  return response.body.token as string;
}

describe('customer addresses API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('lets a customer create, list, and delete saved addresses', async () => {
    const app = createApp();
    const token = await customerToken(app);

    const created = await request(app)
      .post('/api/me/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        receiverName: 'Address Test',
        phone: '13900139003',
        address: 'Shanghai Test Road 100',
        isDefault: true,
      });

    expect(created.status).toBe(201);
    expect(created.body.address).toMatchObject({
      receiverName: 'Address Test',
      isDefault: true,
    });

    const list = await request(app)
      .get('/api/me/addresses')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.addresses).toHaveLength(1);

    const deleted = await request(app)
      .delete(`/api/me/addresses/${created.body.address.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleted.status).toBe(204);
  });
});


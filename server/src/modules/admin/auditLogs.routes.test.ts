import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedAdmin, testAdminPassword } from '../../testUtils';

async function ownerToken() {
  const response = await request(createApp()).post('/api/admin/login').send({
    email: 'admin@qingzhuo.local',
    password: testAdminPassword,
  });
  return response.body.token as string;
}

describe('admin audit logs API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('records and lists sensitive admin actions', async () => {
    const token = await ownerToken();
    const app = createApp();

    await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'ops@qingzhuo.local',
        displayName: 'Ops Admin',
        password: 'OpsPass123',
      });

    const logs = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(logs.status).toBe(200);
    expect(logs.body.logs[0]).toMatchObject({
      action: 'ADMIN_USER_CREATED',
      targetType: 'AdminUser',
    });
  });
});


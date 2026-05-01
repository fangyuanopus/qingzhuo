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

describe('admin users API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('lets an owner create, list, disable, and reset an administrator', async () => {
    const token = await ownerToken();
    const app = createApp();

    const created = await request(app)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'ops@qingzhuo.local',
        displayName: 'Ops Admin',
        password: 'OpsPass123',
        role: 'STAFF',
      });

    expect(created.status).toBe(201);
    expect(created.body.admin).toMatchObject({
      email: 'ops@qingzhuo.local',
      displayName: 'Ops Admin',
      role: 'STAFF',
      status: 'ACTIVE',
    });

    const list = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.admins.map((admin: { email: string }) => admin.email)).toContain('ops@qingzhuo.local');

    const disabled = await request(app)
      .patch(`/api/admin/users/${created.body.admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DISABLED' });
    expect(disabled.status).toBe(200);
    expect(disabled.body.admin.status).toBe('DISABLED');

    const disabledLogin = await request(app).post('/api/admin/login').send({
      email: 'ops@qingzhuo.local',
      password: 'OpsPass123',
    });
    expect(disabledLogin.status).toBe(403);

    const reset = await request(app)
      .post(`/api/admin/users/${created.body.admin.id}/reset-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'NewOpsPass123' });
    expect(reset.status).toBe(200);
  });
});


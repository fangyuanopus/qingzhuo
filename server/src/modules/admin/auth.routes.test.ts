import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedAdmin, testAdminPassword } from '../../testUtils';

function responseCookies(response: request.Response) {
  const value = response.header['set-cookie'];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

describe('admin auth API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('logs in with seeded admin credentials and sets an httpOnly cookie', async () => {
    const response = await request(createApp()).post('/api/admin/login').send({
      email: 'admin@qingzhuo.local',
      password: testAdminPassword,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.admin).toMatchObject({
      email: 'admin@qingzhuo.local',
    });
    const cookies = responseCookies(response).join(';');
    expect(cookies).toContain('qingzhuo_admin_token=');
    expect(cookies.toLowerCase()).toContain('httponly');
  });

  it('rejects wrong password', async () => {
    const response = await request(createApp()).post('/api/admin/login').send({
      email: 'admin@qingzhuo.local',
      password: 'wrong',
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid email or password');
  });

  it('rejects protected routes without token or cookie', async () => {
    const response = await request(createApp()).get('/api/admin/me');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Missing admin token');
  });

  it('accepts protected routes with valid bearer token', async () => {
    const login = await request(createApp()).post('/api/admin/login').send({
      email: 'admin@qingzhuo.local',
      password: testAdminPassword,
    });

    const response = await request(createApp())
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.admin.email).toBe('admin@qingzhuo.local');
  });

  it('accepts protected routes with a valid admin cookie', async () => {
    const login = await request(createApp()).post('/api/admin/login').send({
      email: 'admin@qingzhuo.local',
      password: testAdminPassword,
    });

    const response = await request(createApp())
      .get('/api/admin/me')
      .set('Cookie', responseCookies(login));

    expect(response.status).toBe(200);
    expect(response.body.admin.email).toBe('admin@qingzhuo.local');
  });
});

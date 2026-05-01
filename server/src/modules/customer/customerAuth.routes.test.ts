import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase } from '../../testUtils';

describe('customer auth API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('registers a customer account and returns the current user', async () => {
    const app = createApp();

    const register = await request(app).post('/api/auth/register').send({
      name: '林同学',
      phone: '13900139000',
      password: 'safe-password-123',
    });

    expect(register.status).toBe(201);
    expect(register.body.token).toEqual(expect.any(String));
    expect(register.body.user).toMatchObject({
      name: '林同学',
      phone: '13900139000',
    });

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user).toMatchObject({
      name: '林同学',
      phone: '13900139000',
    });
  });

  it('logs in an existing customer account', async () => {
    const app = createApp();
    await request(app).post('/api/auth/register').send({
      name: '林同学',
      phone: '13900139000',
      password: 'safe-password-123',
    });

    const login = await request(app).post('/api/auth/login').send({
      phone: '13900139000',
      password: 'safe-password-123',
    });

    expect(login.status).toBe(200);
    expect(login.body.token).toEqual(expect.any(String));
    expect(login.body.user.phone).toBe('13900139000');
  });

  it('rejects duplicate phone registration and wrong password', async () => {
    const app = createApp();
    await request(app).post('/api/auth/register').send({
      name: '林同学',
      phone: '13900139000',
      password: 'safe-password-123',
    });

    const duplicate = await request(app).post('/api/auth/register').send({
      name: '另一位同学',
      phone: '13900139000',
      password: 'safe-password-123',
    });
    expect(duplicate.status).toBe(409);

    const wrongPassword = await request(app).post('/api/auth/login').send({
      phone: '13900139000',
      password: 'wrong-password',
    });
    expect(wrongPassword.status).toBe(401);
  });
});

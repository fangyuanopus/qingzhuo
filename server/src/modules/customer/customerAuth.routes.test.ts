import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase } from '../../testUtils';

function responseCookies(response: request.Response) {
  const value = response.header['set-cookie'];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

describe('customer auth API', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('registers a customer account and supports bearer and cookie sessions', async () => {
    const app = createApp();

    const register = await request(app).post('/api/auth/register').send({
      name: 'Customer One',
      phone: '13900139000',
      password: 'safe-password-123',
    });

    expect(register.status).toBe(201);
    expect(register.body.token).toEqual(expect.any(String));
    expect(register.body.user).toMatchObject({
      name: 'Customer One',
      phone: '13900139000',
    });
    const cookies = responseCookies(register).join(';');
    expect(cookies).toContain('qingzhuo_customer_token=');
    expect(cookies.toLowerCase()).toContain('httponly');

    const bearerMe = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);
    expect(bearerMe.status).toBe(200);
    expect(bearerMe.body.user.phone).toBe('13900139000');

    const cookieMe = await request(app)
      .get('/api/auth/me')
      .set('Cookie', responseCookies(register));
    expect(cookieMe.status).toBe(200);
    expect(cookieMe.body.user.phone).toBe('13900139000');
  });

  it('logs in an existing customer account', async () => {
    const app = createApp();
    await request(app).post('/api/auth/register').send({
      name: 'Customer One',
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
      name: 'Customer One',
      phone: '13900139000',
      password: 'safe-password-123',
    });

    const duplicate = await request(app).post('/api/auth/register').send({
      name: 'Customer Two',
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

  it('locks a customer account after repeated failed logins', async () => {
    const app = createApp();
    await request(app).post('/api/auth/register').send({
      name: 'Lock Test',
      phone: '13900139001',
      password: 'safe-password-123',
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app).post('/api/auth/login').send({
        phone: '13900139001',
        password: 'wrong-password',
      });
    }

    const locked = await request(app).post('/api/auth/login').send({
      phone: '13900139001',
      password: 'safe-password-123',
    });

    expect(locked.status).toBe(423);
  });

  it('updates profile and resets a forgotten password', async () => {
    const app = createApp();
    const register = await request(app).post('/api/auth/register').send({
      name: 'Profile Test',
      phone: '13900139002',
      password: 'safe-password-123',
    });

    const profile = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`)
      .send({ name: 'Updated Profile' });
    expect(profile.status).toBe(200);
    expect(profile.body.user.name).toBe('Updated Profile');

    const requested = await request(app).post('/api/auth/password-reset/request').send({
      phone: '13900139002',
    });
    expect(requested.status).toBe(200);
    expect(requested.body.resetToken).toEqual(expect.any(String));

    const reset = await request(app).post('/api/auth/password-reset/confirm').send({
      phone: '13900139002',
      token: requested.body.resetToken,
      password: 'new-safe-password-123',
    });
    expect(reset.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({
      phone: '13900139002',
      password: 'new-safe-password-123',
    });
    expect(login.status).toBe(200);
  });
});

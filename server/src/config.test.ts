import { afterEach, describe, expect, it, vi } from 'vitest';

describe('server config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('rejects production startup without a JWT secret', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:5432/qingzhuo');
    vi.stubEnv('JWT_SECRET', '');

    await expect(import('./config')).rejects.toThrow('JWT_SECRET is required in production');
  });

  it('requires a PostgreSQL database URL', async () => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('JWT_SECRET', 'test-secret');

    await expect(import('./config')).rejects.toThrow('DATABASE_URL is required');
  });
});

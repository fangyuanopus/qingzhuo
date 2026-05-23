import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../api/[...path]';

describe('Vercel API handler', () => {
  it('exports the Express app for API routes', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});

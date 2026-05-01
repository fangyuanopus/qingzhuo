import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedProduct } from '../../testUtils';

describe('GET /api/products', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns active products and active skus', async () => {
    await seedProduct();

    const response = await request(createApp()).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe('清濯茶皂素复配洗衣液');
    expect(response.body.products[0].skus).toHaveLength(1);
    expect(response.body.products[0].skus[0]).toMatchObject({
      name: '日常家庭装',
      spec: '2kg / 瓶',
      priceCents: 3990,
      stock: 10,
    });
  });
});

import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app';
import { resetDatabase, seedAdmin, seedProduct, testAdminPassword } from '../../testUtils';

async function adminToken() {
  const response = await request(createApp()).post('/api/admin/login').send({
    email: 'admin@qingzhuo.local',
    password: testAdminPassword,
  });
  return response.body.token as string;
}

describe('admin products API', () => {
  beforeEach(async () => {
    await resetDatabase();
    await seedAdmin();
  });

  it('lets an admin list products and update product status', async () => {
    const seeded = await seedProduct();
    const token = await adminToken();
    const app = createApp();

    const list = await request(app)
      .get('/api/admin/products')
      .set('Authorization', `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.products).toHaveLength(1);
    expect(list.body.products[0]).toMatchObject({
      id: seeded.id,
      status: 'ACTIVE',
    });
    expect(list.body.products[0].skus).toHaveLength(2);

    const updated = await request(app)
      .patch(`/api/admin/products/${seeded.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INACTIVE', description: 'Hidden product' });

    expect(updated.status).toBe(200);
    expect(updated.body.product).toMatchObject({
      id: seeded.id,
      status: 'INACTIVE',
      description: 'Hidden product',
    });
  });

  it('lets an admin create a product with skus and update stock and price', async () => {
    const token = await adminToken();
    const app = createApp();

    const created = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Qingzhuo refill pack',
        description: 'Refill SKU',
        skus: [
          {
            name: 'Refill pack',
            spec: '1kg / bag',
            priceCents: 2990,
            originalPriceCents: 3990,
            stock: 25,
            imageUrl: '/assets/qingzhuo/product-front-transparent.png',
          },
        ],
      });

    expect(created.status).toBe(201);
    expect(created.body.product).toMatchObject({
      name: 'Qingzhuo refill pack',
      status: 'ACTIVE',
    });
    expect(created.body.product.skus[0]).toMatchObject({
      name: 'Refill pack',
      priceCents: 2990,
      stock: 25,
      status: 'ACTIVE',
    });

    const skuId = created.body.product.skus[0].id;
    const updatedSku = await request(app)
      .patch(`/api/admin/products/skus/${skuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ priceCents: 2590, stock: 40, status: 'INACTIVE' });

    expect(updatedSku.status).toBe(200);
    expect(updatedSku.body.sku).toMatchObject({
      id: skuId,
      priceCents: 2590,
      stock: 40,
      status: 'INACTIVE',
    });
  });
});

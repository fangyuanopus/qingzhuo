import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PaymentMethodType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const productName = '清濯茶皂素复配洗衣液';

async function ensureSku(
  productId: string,
  input: {
    name: string;
    spec: string;
    priceCents: number;
    originalPriceCents: number;
    stock: number;
    imageUrl: string;
  },
) {
  const existing = await prisma.sku.findFirst({
    where: { productId, name: input.name, spec: input.spec },
  });

  if (existing) {
    return prisma.sku.update({
      where: { id: existing.id },
      data: {
        priceCents: input.priceCents,
        originalPriceCents: input.originalPriceCents,
        imageUrl: input.imageUrl,
      },
    });
  }

  return prisma.sku.create({
    data: { productId, ...input },
  });
}

async function ensurePaymentMethod(
  type: PaymentMethodType,
  input: { name: string; qrCodeUrl: string; instructions: string },
) {
  const existing = await prisma.paymentMethod.findFirst({ where: { type } });

  if (existing) {
    return prisma.paymentMethod.update({
      where: { id: existing.id },
      data: { ...input, enabled: true },
    });
  }

  return prisma.paymentMethod.create({
    data: { type, ...input },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@qingzhuo.local';
  const adminPassword = process.env.ADMIN_PASSWORD;

  const existingProduct = await prisma.product.findFirst({ where: { name: productName } });
  const product = existingProduct
    ? await prisma.product.update({
        where: { id: existingProduct.id },
        data: { description: '茶皂素复配深层洁净洗衣液，适合日常家庭洗护场景。' },
      })
    : await prisma.product.create({
        data: {
          name: productName,
          description: '茶皂素复配深层洁净洗衣液，适合日常家庭洗护场景。',
        },
      });

  await ensureSku(product.id, {
    name: '日常家庭装',
    spec: '2kg / 瓶',
    priceCents: 3990,
    originalPriceCents: 5990,
    stock: 100,
    imageUrl: '/assets/qingzhuo/product-front-transparent.png',
  });
  await ensureSku(product.id, {
    name: '双瓶囤货装',
    spec: '2kg x 2 瓶',
    priceCents: 6990,
    originalPriceCents: 11980,
    stock: 80,
    imageUrl: '/assets/qingzhuo/product-front-with-bg.png',
  });
  await ensureSku(product.id, {
    name: '体验尝鲜装',
    spec: '500ml / 瓶',
    priceCents: 1490,
    originalPriceCents: 1990,
    stock: 120,
    imageUrl: '/assets/qingzhuo/product-botanical-transparent.png',
  });

  await ensurePaymentMethod(PaymentMethodType.WECHAT, {
    name: '微信扫码付款',
    qrCodeUrl: '/assets/qingzhuo/logo-transparent.png',
    instructions: '请使用微信扫码付款，付款后等待管理员确认订单。',
  });
  await ensurePaymentMethod(PaymentMethodType.ALIPAY, {
    name: '支付宝扫码付款',
    qrCodeUrl: '/assets/qingzhuo/logo-transparent.png',
    instructions: '请使用支付宝扫码付款，付款后等待管理员确认订单。',
  });

  const existingAdmin = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is required when creating the initial admin user');
    }

    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        displayName: '清濯管理员',
      },
    });
  }

  console.log(`Seeded product ${product.name} and admin ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

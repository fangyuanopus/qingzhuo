import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, PaymentMethodType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@qingzhuo.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'change-this-password';

  await prisma.orderStatusLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.sku.deleteMany();
  await prisma.product.deleteMany();

  const product = await prisma.product.create({
    data: {
      name: '清濯茶皂素复配洗衣液',
      description: '茶皂素复配深层洁净洗衣液，适合日常家庭洗护场景。',
      skus: {
        create: [
          {
            name: '日常家庭装',
            spec: '2kg / 瓶',
            priceCents: 3990,
            originalPriceCents: 5990,
            stock: 100,
            imageUrl: '/assets/qingzhuo/product-front-transparent.png',
          },
          {
            name: '双瓶囤货装',
            spec: '2kg x 2 瓶',
            priceCents: 6990,
            originalPriceCents: 11980,
            stock: 80,
            imageUrl: '/assets/qingzhuo/product-front-with-bg.png',
          },
          {
            name: '体验尝鲜装',
            spec: '500ml / 瓶',
            priceCents: 1490,
            originalPriceCents: 1990,
            stock: 120,
            imageUrl: '/assets/qingzhuo/product-botanical-transparent.png',
          },
        ],
      },
    },
  });

  await prisma.paymentMethod.createMany({
    data: [
      {
        type: PaymentMethodType.WECHAT,
        name: '微信扫码付款',
        qrCodeUrl: '/assets/qingzhuo/logo-transparent.png',
        instructions: '请使用微信扫码付款，付款后等待管理员确认订单。',
      },
      {
        type: PaymentMethodType.ALIPAY,
        name: '支付宝扫码付款',
        qrCodeUrl: '/assets/qingzhuo/logo-transparent.png',
        instructions: '请使用支付宝扫码付款，付款后等待管理员确认订单。',
      },
    ],
  });

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: await bcrypt.hash(adminPassword, 12),
      displayName: '清濯管理员',
    },
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 12),
      displayName: '清濯管理员',
    },
  });

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

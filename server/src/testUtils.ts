import bcrypt from 'bcryptjs';
import {
  OrderStatus,
  PaymentMethodType,
  PrismaClient,
  ProductStatus,
  SkuStatus,
} from '@prisma/client';
import { prisma } from './db';

export const testAdminPassword = 'change-this-password';

export async function resetDatabase(db: PrismaClient = prisma) {
  await db.auditLog.deleteMany();
  await db.orderStatusLog.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.customer.deleteMany();
  await db.customerAddress.deleteMany();
  await db.customerAccount.deleteMany();
  await db.paymentMethod.deleteMany();
  await db.sku.deleteMany();
  await db.product.deleteMany();
  await db.adminUser.deleteMany();
}

export async function seedProduct(db: PrismaClient = prisma) {
  return db.product.create({
    data: {
      name: '清濯茶皂素复配洗衣液',
      description: '测试商品',
      status: ProductStatus.ACTIVE,
      skus: {
        create: [
          {
            name: '日常家庭装',
            spec: '2kg / 瓶',
            priceCents: 3990,
            originalPriceCents: 5990,
            stock: 10,
            imageUrl: '/assets/qingzhuo/product-front-transparent.png',
            status: SkuStatus.ACTIVE,
          },
          {
            name: '下架套餐',
            spec: '500ml / 瓶',
            priceCents: 1490,
            originalPriceCents: 1990,
            stock: 10,
            status: SkuStatus.INACTIVE,
          },
        ],
      },
    },
    include: { skus: true },
  });
}

export async function seedPaymentMethods(db: PrismaClient = prisma) {
  await db.paymentMethod.createMany({
    data: [
      {
        type: PaymentMethodType.WECHAT,
        name: '微信扫码付款',
        qrCodeUrl: '/wechat.png',
        instructions: '请使用微信扫码付款',
        enabled: true,
      },
      {
        type: PaymentMethodType.ALIPAY,
        name: '支付宝扫码付款',
        qrCodeUrl: '/alipay.png',
        instructions: '请使用支付宝扫码付款',
        enabled: true,
      },
      {
        type: PaymentMethodType.WECHAT,
        name: '停用收款码',
        qrCodeUrl: '/disabled.png',
        instructions: '不可用',
        enabled: false,
      },
    ],
  });
}

export async function seedAdmin(db: PrismaClient = prisma) {
  return db.adminUser.create({
    data: {
      email: 'admin@qingzhuo.local',
      passwordHash: await bcrypt.hash(testAdminPassword, 12),
      displayName: '清濯管理员',
    },
  });
}

export async function seedPendingOrder(db: PrismaClient = prisma) {
  const product = await seedProduct(db);
  const sku = product.skus[0];
  const customer = await db.customer.create({
    data: {
      name: '张三',
      phone: '13800138000',
      address: '福建省福州市测试地址 1 号',
    },
  });

  const order = await db.order.create({
    data: {
      orderNo: `QZ${Date.now()}001`,
      customerId: customer.id,
      status: OrderStatus.PENDING_PAYMENT,
      totalAmountCents: sku.priceCents,
      items: {
        create: {
          skuId: sku.id,
          skuNameSnapshot: sku.name,
          unitPriceCents: sku.priceCents,
          quantity: 1,
          subtotalCents: sku.priceCents,
        },
      },
      statusLogs: {
        create: {
          toStatus: OrderStatus.PENDING_PAYMENT,
          note: '测试订单',
        },
      },
    },
    include: { customer: true, items: true, statusLogs: true },
  });

  return { order, sku, customer };
}

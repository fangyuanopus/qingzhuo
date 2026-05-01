import cors from 'cors';
import express from 'express';
import { config } from './config';
import { errorHandler, notFoundHandler } from './http/errors';
import { adminOrdersRouter } from './modules/admin/adminOrders.routes';
import { adminAuthRouter } from './modules/admin/auth.routes';
import { customerAuthRouter } from './modules/customer/customerAuth.routes';
import { customerOrdersRouter } from './modules/customer/customerOrders.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { paymentMethodsRouter } from './modules/payments/paymentMethods.routes';
import { productsRouter } from './modules/products/products.routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/payment-methods', paymentMethodsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/auth', customerAuthRouter);
  app.use('/api/me/orders', customerOrdersRouter);
  app.use('/api/admin', adminAuthRouter);
  app.use('/api/admin/orders', adminOrdersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

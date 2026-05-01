import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { listEnabledPaymentMethods } from './paymentMethods.service';

export const paymentMethodsRouter = Router();

paymentMethodsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ paymentMethods: await listEnabledPaymentMethods() });
  }),
);

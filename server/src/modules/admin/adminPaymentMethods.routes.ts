import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { requireAdmin } from './auth.middleware';
import {
  createAdminPaymentMethod,
  listAdminPaymentMethods,
  updateAdminPaymentMethod,
} from './adminPaymentMethods.service';
import {
  createAdminPaymentMethodSchema,
  updateAdminPaymentMethodSchema,
} from './adminPaymentMethods.validation';

export const adminPaymentMethodsRouter = Router();

adminPaymentMethodsRouter.use(requireAdmin);

adminPaymentMethodsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listAdminPaymentMethods());
  }),
);

adminPaymentMethodsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createAdminPaymentMethodSchema.parse(req.body);
    res.status(201).json(await createAdminPaymentMethod(input));
  }),
);

adminPaymentMethodsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = updateAdminPaymentMethodSchema.parse(req.body);
    res.json(await updateAdminPaymentMethod(String(req.params.id), input));
  }),
);

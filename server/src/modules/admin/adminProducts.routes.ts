import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { requireAdmin } from './auth.middleware';
import {
  createAdminProduct,
  listAdminProducts,
  updateAdminProduct,
  updateAdminSku,
} from './adminProducts.service';
import {
  createAdminProductSchema,
  updateAdminProductSchema,
  updateAdminSkuSchema,
} from './adminProducts.validation';

export const adminProductsRouter = Router();

adminProductsRouter.use(requireAdmin);

adminProductsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listAdminProducts());
  }),
);

adminProductsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createAdminProductSchema.parse(req.body);
    res.status(201).json(await createAdminProduct(input));
  }),
);

adminProductsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = updateAdminProductSchema.parse(req.body);
    res.json(await updateAdminProduct(String(req.params.id), input));
  }),
);

adminProductsRouter.patch(
  '/skus/:id',
  asyncHandler(async (req, res) => {
    const input = updateAdminSkuSchema.parse(req.body);
    res.json(await updateAdminSku(String(req.params.id), input));
  }),
);

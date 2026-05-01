import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { listActiveProducts } from './products.service';

export const productsRouter = Router();

productsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ products: await listActiveProducts() });
  }),
);

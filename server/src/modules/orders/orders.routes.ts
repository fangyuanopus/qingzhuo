import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { createOrder, getOrderByOrderNo } from './orders.service';
import { createOrderSchema } from './orders.validation';

export const ordersRouter = Router();

ordersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    const order = await createOrder(input);
    res.status(201).json(order);
  }),
);

ordersRouter.get(
  '/:orderNo',
  asyncHandler(async (req, res) => {
    res.json({ order: await getOrderByOrderNo(req.params.orderNo) });
  }),
);

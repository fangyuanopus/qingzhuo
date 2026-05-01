import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { CustomerRequest, optionalCustomer } from '../customer/customerAuth.middleware';
import { createOrder, getOrderByOrderNo } from './orders.service';
import { createOrderSchema } from './orders.validation';

export const ordersRouter = Router();

ordersRouter.post(
  '/',
  optionalCustomer,
  asyncHandler(async (req, res) => {
    const input = createOrderSchema.parse(req.body);
    const user = (req as CustomerRequest).customerUser;
    const order = await createOrder(input, user?.id);
    res.status(201).json(order);
  }),
);

ordersRouter.get(
  '/:orderNo',
  asyncHandler(async (req, res) => {
    res.json({ order: await getOrderByOrderNo(String(req.params.orderNo)) });
  }),
);

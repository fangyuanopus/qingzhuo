import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { HttpError } from '../../http/errors';
import { CustomerRequest, requireCustomer } from './customerAuth.middleware';
import { getMyOrder, listMyOrders } from './customerOrders.service';

export const customerOrdersRouter = Router();

customerOrdersRouter.use(requireCustomer);

customerOrdersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = (req as CustomerRequest).customerUser!;
    res.json({ orders: await listMyOrders(user.id) });
  }),
);

customerOrdersRouter.get(
  '/:orderNo',
  asyncHandler(async (req, res) => {
    const user = (req as CustomerRequest).customerUser!;
    const order = await getMyOrder(user.id, String(req.params.orderNo));
    if (!order) {
      throw new HttpError(404, 'Order not found');
    }
    res.json({ order });
  }),
);

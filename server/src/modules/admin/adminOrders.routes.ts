import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { AdminRequest, requireAdmin } from './auth.middleware';
import {
  adminOrderListSchema,
  updateOrderStatusSchema,
  updateShippingSchema,
} from './adminOrders.validation';
import {
  getAdminOrderDetail,
  listAdminOrders,
  updateAdminOrderShipping,
  updateAdminOrderStatus,
} from './adminOrders.service';

export const adminOrdersRouter = Router();

adminOrdersRouter.use(requireAdmin);

adminOrdersRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const input = adminOrderListSchema.parse(req.query);
    res.json(await listAdminOrders(input));
  }),
);

adminOrdersRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json({ order: await getAdminOrderDetail(String(req.params.id)) });
  }),
);

adminOrdersRouter.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const input = updateOrderStatusSchema.parse(req.body);
    const order = await updateAdminOrderStatus(String(req.params.id), input, (req as AdminRequest).admin.id);
    res.json({ order });
  }),
);

adminOrdersRouter.patch(
  '/:id/shipping',
  asyncHandler(async (req, res) => {
    const input = updateShippingSchema.parse(req.body);
    const order = await updateAdminOrderShipping(String(req.params.id), input, (req as AdminRequest).admin.id);
    res.json({ order });
  }),
);

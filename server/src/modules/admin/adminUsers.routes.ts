import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { AdminRequest, requireAdmin, requireOwner } from './auth.middleware';
import {
  createAdminUser,
  listAdminUsers,
  resetAdminPassword,
  updateAdminUser,
} from './adminUsers.service';
import {
  createAdminUserSchema,
  resetAdminPasswordSchema,
  updateAdminUserSchema,
} from './adminUsers.validation';

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAdmin, requireOwner);

adminUsersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listAdminUsers());
  }),
);

adminUsersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createAdminUserSchema.parse(req.body);
    const result = await createAdminUser((req as AdminRequest).admin.id, input);
    res.status(201).json(result);
  }),
);

adminUsersRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = updateAdminUserSchema.parse(req.body);
    res.json(await updateAdminUser((req as AdminRequest).admin.id, String(req.params.id), input));
  }),
);

adminUsersRouter.post(
  '/:id/reset-password',
  asyncHandler(async (req, res) => {
    const input = resetAdminPasswordSchema.parse(req.body);
    res.json(await resetAdminPassword((req as AdminRequest).admin.id, String(req.params.id), input));
  }),
);


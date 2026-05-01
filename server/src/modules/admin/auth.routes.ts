import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { adminLoginSchema } from './auth.validation';
import { loginAdmin } from './auth.service';
import { AdminRequest, requireAdmin } from './auth.middleware';

export const adminAuthRouter = Router();

adminAuthRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = adminLoginSchema.parse(req.body);
    res.json(await loginAdmin(input));
  }),
);

adminAuthRouter.post('/logout', (_req, res) => {
  res.status(204).end();
});

adminAuthRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ admin: (req as AdminRequest).admin });
  }),
);

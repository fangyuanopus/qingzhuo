import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { adminCookieName, clearAuthCookie, setAuthCookie } from '../../http/authCookies';
import { adminChangePasswordSchema, adminLoginSchema } from './auth.validation';
import { changeAdminPassword, loginAdmin } from './auth.service';
import { AdminRequest, requireAdmin } from './auth.middleware';

export const adminAuthRouter = Router();

adminAuthRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = adminLoginSchema.parse(req.body);
    const result = await loginAdmin(input);
    setAuthCookie(res, adminCookieName, result.token);
    res.json(result);
  }),
);

adminAuthRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res, adminCookieName);
  res.status(204).end();
});

adminAuthRouter.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.json({ admin: (req as AdminRequest).admin });
  }),
);

adminAuthRouter.post(
  '/change-password',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const input = adminChangePasswordSchema.parse(req.body);
    res.json(await changeAdminPassword((req as AdminRequest).admin.id, input));
  }),
);

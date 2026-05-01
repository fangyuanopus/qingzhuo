import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { clearAuthCookie, customerCookieName, setAuthCookie } from '../../http/authCookies';
import { CustomerRequest, requireCustomer } from './customerAuth.middleware';
import {
  confirmCustomerPasswordReset,
  loginCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  updateCustomerProfile,
} from './customerAuth.service';
import {
  customerLoginSchema,
  customerPasswordResetConfirmSchema,
  customerPasswordResetRequestSchema,
  customerProfileUpdateSchema,
  customerRegisterSchema,
} from './customerAuth.validation';

export const customerAuthRouter = Router();

customerAuthRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = customerRegisterSchema.parse(req.body);
    const result = await registerCustomer(input);
    setAuthCookie(res, customerCookieName, result.token);
    res.status(201).json(result);
  }),
);

customerAuthRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = customerLoginSchema.parse(req.body);
    const result = await loginCustomer(input);
    setAuthCookie(res, customerCookieName, result.token);
    res.json(result);
  }),
);

customerAuthRouter.post('/logout', (_req, res) => {
  clearAuthCookie(res, customerCookieName);
  res.status(204).end();
});

customerAuthRouter.get(
  '/me',
  requireCustomer,
  asyncHandler(async (req, res) => {
    res.json({ user: (req as CustomerRequest).customerUser });
  }),
);

customerAuthRouter.patch(
  '/me',
  requireCustomer,
  asyncHandler(async (req, res) => {
    const input = customerProfileUpdateSchema.parse(req.body);
    res.json(await updateCustomerProfile((req as CustomerRequest).customerUser!.id, input));
  }),
);

customerAuthRouter.post(
  '/password-reset/request',
  asyncHandler(async (req, res) => {
    const input = customerPasswordResetRequestSchema.parse(req.body);
    res.json(await requestCustomerPasswordReset(input));
  }),
);

customerAuthRouter.post(
  '/password-reset/confirm',
  asyncHandler(async (req, res) => {
    const input = customerPasswordResetConfirmSchema.parse(req.body);
    res.json(await confirmCustomerPasswordReset(input));
  }),
);

import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { CustomerRequest, requireCustomer } from './customerAuth.middleware';
import { loginCustomer, registerCustomer } from './customerAuth.service';
import { customerLoginSchema, customerRegisterSchema } from './customerAuth.validation';

export const customerAuthRouter = Router();

customerAuthRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = customerRegisterSchema.parse(req.body);
    res.status(201).json(await registerCustomer(input));
  }),
);

customerAuthRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = customerLoginSchema.parse(req.body);
    res.json(await loginCustomer(input));
  }),
);

customerAuthRouter.post('/logout', (_req, res) => {
  res.status(204).end();
});

customerAuthRouter.get(
  '/me',
  requireCustomer,
  asyncHandler(async (req, res) => {
    res.json({ user: (req as CustomerRequest).customerUser });
  }),
);

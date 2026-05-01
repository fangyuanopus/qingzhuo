import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { CustomerRequest, requireCustomer } from './customerAuth.middleware';
import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
} from './customerAddresses.service';
import { customerAddressSchema } from './customerAddresses.validation';

export const customerAddressesRouter = Router();

customerAddressesRouter.use(requireCustomer);

customerAddressesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await listCustomerAddresses((req as CustomerRequest).customerUser!.id));
  }),
);

customerAddressesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = customerAddressSchema.parse(req.body);
    const result = await createCustomerAddress((req as CustomerRequest).customerUser!.id, input);
    res.status(201).json(result);
  }),
);

customerAddressesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteCustomerAddress((req as CustomerRequest).customerUser!.id, String(req.params.id));
    res.status(204).end();
  }),
);


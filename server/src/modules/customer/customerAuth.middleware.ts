import type { NextFunction, Request, Response } from 'express';
import { customerCookieName, readCookieToken } from '../../http/authCookies';
import { HttpError } from '../../http/errors';
import { getCustomerById, verifyCustomerToken } from './customerAuth.service';

export type AuthenticatedCustomer = {
  id: string;
  name: string;
  phone: string;
};

export type CustomerRequest = Request & {
  customerUser?: AuthenticatedCustomer;
};

function readBearerToken(req: Request) {
  const header = req.header('authorization');
  return header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : readCookieToken(req, customerCookieName);
}

export async function optionalCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      next();
      return;
    }

    const payload = verifyCustomerToken(token);
    (req as CustomerRequest).customerUser = await getCustomerById(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      throw new HttpError(401, 'Missing customer token');
    }

    const payload = verifyCustomerToken(token);
    (req as CustomerRequest).customerUser = await getCustomerById(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}

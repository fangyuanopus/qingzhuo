import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../http/errors';
import { getAdminById, verifyAdminToken } from './auth.service';

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type AdminRequest = Request & {
  admin: AuthenticatedAdmin;
};

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
    if (!token) {
      throw new HttpError(401, 'Missing admin token');
    }

    const payload = verifyAdminToken(token);
    (req as AdminRequest).admin = await getAdminById(payload.sub);
    next();
  } catch (error) {
    next(error);
  }
}

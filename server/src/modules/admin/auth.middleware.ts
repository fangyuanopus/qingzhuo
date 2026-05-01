import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../../http/errors';
import { adminCookieName, readCookieToken } from '../../http/authCookies';
import { getAdminById, verifyAdminToken } from './auth.service';

export type AuthenticatedAdmin = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  mustChangePassword: boolean;
};

export type AdminRequest = Request & {
  admin: AuthenticatedAdmin;
};

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization');
    const token = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : readCookieToken(req, adminCookieName);
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

export function requireOwner(req: Request, _res: Response, next: NextFunction) {
  const admin = (req as AdminRequest).admin;
  if (admin.role !== 'OWNER') {
    next(new HttpError(403, 'Owner role required'));
    return;
  }
  next();
}

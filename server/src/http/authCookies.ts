import type { Request, Response } from 'express';
import { config } from '../config';

export const adminCookieName = 'qingzhuo_admin_token';
export const customerCookieName = 'qingzhuo_customer_token';

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.nodeEnv === 'production',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

function parseCookies(header: string | undefined) {
  if (!header) return new Map<string, string>();
  return new Map(
    header.split(';').map((part) => {
      const [name, ...valueParts] = part.trim().split('=');
      return [name, decodeURIComponent(valueParts.join('='))] as const;
    }),
  );
}

export function readCookieToken(req: Request, name: string) {
  return parseCookies(req.headers.cookie).get(name);
}

export function setAuthCookie(res: Response, name: string, token: string) {
  res.cookie(name, token, authCookieOptions);
}

export function clearAuthCookie(res: Response, name: string) {
  res.clearCookie(name, { ...authCookieOptions, maxAge: undefined });
}


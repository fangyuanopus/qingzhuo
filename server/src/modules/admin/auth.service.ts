import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import { config } from '../../config';
import type { AdminLoginInput } from './auth.validation';

const tokenTtl = '8h';

export type AdminTokenPayload = {
  sub: string;
  email: string;
};

export async function loginAdmin(input: AdminLoginInput) {
  const admin = await prisma.adminUser.findUnique({
    where: { email: input.email },
  });

  if (!admin) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const passwordOk = await bcrypt.compare(input.password, admin.passwordHash);
  if (!passwordOk) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const payload: AdminTokenPayload = {
    sub: admin.id,
    email: admin.email,
  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: tokenTtl });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
    },
  };
}

export async function getAdminById(id: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
    },
  });

  if (!admin) {
    throw new HttpError(401, 'Invalid admin token');
  }

  return admin;
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, config.jwtSecret) as AdminTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid admin token');
  }
}

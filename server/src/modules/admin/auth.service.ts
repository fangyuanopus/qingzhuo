import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuditAction, AdminStatus } from '@prisma/client';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import { config } from '../../config';
import { recordAuditLog } from '../audit/audit.service';
import type { AdminChangePasswordInput, AdminLoginInput } from './auth.validation';

const tokenTtl = '8h';
const maxFailedLogins = 5;
const lockoutMs = 15 * 60 * 1000;

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

  if (admin.status !== AdminStatus.ACTIVE) {
    throw new HttpError(403, 'Admin account is disabled');
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new HttpError(423, 'Admin account is temporarily locked');
  }

  const passwordOk = await bcrypt.compare(input.password, admin.passwordHash);
  if (!passwordOk) {
    const attempts = admin.failedLoginAttempts + 1;
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= maxFailedLogins ? new Date(Date.now() + lockoutMs) : null,
      },
    });
    throw new HttpError(401, 'Invalid email or password');
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const payload: AdminTokenPayload = {
    sub: admin.id,
    email: admin.email,
  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: tokenTtl });

  await recordAuditLog({
    action: AuditAction.ADMIN_LOGIN,
    actorAdminId: admin.id,
    targetType: 'AdminUser',
    targetId: admin.id,
  });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      status: admin.status,
      mustChangePassword: admin.mustChangePassword,
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
      status: true,
      mustChangePassword: true,
    },
  });

  if (!admin || admin.status !== AdminStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid admin token');
  }

  return admin;
}

export async function changeAdminPassword(adminId: string, input: AdminChangePasswordInput) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) {
    throw new HttpError(404, 'Admin not found');
  }

  const passwordOk = await bcrypt.compare(input.currentPassword, admin.passwordHash);
  if (!passwordOk) {
    throw new HttpError(401, 'Invalid current password');
  }

  await prisma.adminUser.update({
    where: { id: adminId },
    data: {
      passwordHash: await bcrypt.hash(input.password, 12),
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return { ok: true };
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, config.jwtSecret) as AdminTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid admin token');
  }
}

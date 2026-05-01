import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { CustomerStatus } from '@prisma/client';
import { config } from '../../config';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type {
  CustomerLoginInput,
  CustomerPasswordResetConfirmInput,
  CustomerPasswordResetRequestInput,
  CustomerProfileUpdateInput,
  CustomerRegisterInput,
} from './customerAuth.validation';

const maxFailedLogins = 5;
const lockoutMs = 15 * 60 * 1000;
const resetTtlMs = 30 * 60 * 1000;

type CustomerTokenPayload = {
  sub: string;
  phone: string;
  role: 'CUSTOMER';
};

function publicUser(user: { id: string; name: string; phone: string }) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
  };
}

function signCustomerToken(user: { id: string; phone: string }) {
  return jwt.sign(
    {
      sub: user.id,
      phone: user.phone,
      role: 'CUSTOMER',
    } satisfies CustomerTokenPayload,
    config.jwtSecret,
    { expiresIn: '8h' },
  );
}

export async function registerCustomer(input: CustomerRegisterInput) {
  const existing = await prisma.customerAccount.findUnique({ where: { phone: input.phone } });
  if (existing) {
    throw new HttpError(409, 'Phone already registered');
  }

  const user = await prisma.customerAccount.create({
    data: {
      name: input.name,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 12),
    },
  });

  return {
    token: signCustomerToken(user),
    user: publicUser(user),
  };
}

export async function loginCustomer(input: CustomerLoginInput) {
  const user = await prisma.customerAccount.findUnique({ where: { phone: input.phone } });
  if (!user) {
    throw new HttpError(401, 'Invalid phone or password');
  }

  if (user.status !== CustomerStatus.ACTIVE) {
    throw new HttpError(403, 'Customer account is disabled');
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new HttpError(423, 'Customer account is temporarily locked');
  }

  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) {
    const attempts = user.failedLoginAttempts + 1;
    await prisma.customerAccount.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: attempts >= maxFailedLogins ? new Date(Date.now() + lockoutMs) : null,
      },
    });
    throw new HttpError(401, 'Invalid phone or password');
  }

  await prisma.customerAccount.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  return {
    token: signCustomerToken(user),
    user: publicUser(user),
  };
}

export async function getCustomerById(id: string) {
  const user = await prisma.customerAccount.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
    },
  });

  if (!user || user.status !== CustomerStatus.ACTIVE) {
    throw new HttpError(401, 'Invalid customer token');
  }

  return user;
}

export async function updateCustomerProfile(userId: string, input: CustomerProfileUpdateInput) {
  const user = await prisma.customerAccount.update({
    where: { id: userId },
    data: { name: input.name },
  });

  return { user: publicUser(user) };
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function requestCustomerPasswordReset(input: CustomerPasswordResetRequestInput) {
  const token = crypto.randomBytes(24).toString('hex');
  const user = await prisma.customerAccount.findUnique({ where: { phone: input.phone } });

  if (user) {
    await prisma.customerAccount.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: hashResetToken(token),
        passwordResetExpiresAt: new Date(Date.now() + resetTtlMs),
      },
    });
  }

  return {
    ok: true,
    resetToken: config.nodeEnv === 'production' ? undefined : token,
  };
}

export async function confirmCustomerPasswordReset(input: CustomerPasswordResetConfirmInput) {
  const user = await prisma.customerAccount.findUnique({ where: { phone: input.phone } });
  if (
    !user ||
    !user.passwordResetTokenHash ||
    !user.passwordResetExpiresAt ||
    user.passwordResetExpiresAt < new Date() ||
    user.passwordResetTokenHash !== hashResetToken(input.token)
  ) {
    throw new HttpError(400, 'Invalid or expired reset token');
  }

  await prisma.customerAccount.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(input.password, 12),
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  return { ok: true };
}

export function verifyCustomerToken(token: string) {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as Partial<CustomerTokenPayload>;
    if (payload.role !== 'CUSTOMER' || !payload.sub) {
      throw new Error('Invalid role');
    }
    return payload as CustomerTokenPayload;
  } catch {
    throw new HttpError(401, 'Invalid customer token');
  }
}

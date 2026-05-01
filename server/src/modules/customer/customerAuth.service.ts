import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type { CustomerLoginInput, CustomerRegisterInput } from './customerAuth.validation';

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

  const passwordOk = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordOk) {
    throw new HttpError(401, 'Invalid phone or password');
  }

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
    },
  });

  if (!user) {
    throw new HttpError(401, 'Invalid customer token');
  }

  return user;
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

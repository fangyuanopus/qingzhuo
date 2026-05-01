import bcrypt from 'bcryptjs';
import { AuditAction } from '@prisma/client';
import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import { recordAuditLog } from '../audit/audit.service';
import type {
  CreateAdminUserInput,
  ResetAdminPasswordInput,
  UpdateAdminUserInput,
} from './adminUsers.validation';

const adminSelect = {
  id: true,
  email: true,
  displayName: true,
  role: true,
  status: true,
  mustChangePassword: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function listAdminUsers() {
  const admins = await prisma.adminUser.findMany({
    select: adminSelect,
    orderBy: { createdAt: 'asc' },
  });

  return { admins };
}

export async function createAdminUser(actorAdminId: string, input: CreateAdminUserInput) {
  const existing = await prisma.adminUser.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, 'Admin email already exists');
  }

  const admin = await prisma.adminUser.create({
    data: {
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      passwordHash: await bcrypt.hash(input.password, 12),
      mustChangePassword: true,
    },
    select: adminSelect,
  });

  await recordAuditLog({
    action: AuditAction.ADMIN_USER_CREATED,
    actorAdminId,
    targetType: 'AdminUser',
    targetId: admin.id,
    metadata: { email: admin.email, role: admin.role },
  });

  return { admin };
}

export async function updateAdminUser(actorAdminId: string, id: string, input: UpdateAdminUserInput) {
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Admin not found');
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: input,
    select: adminSelect,
  });

  await recordAuditLog({
    action: AuditAction.ADMIN_USER_UPDATED,
    actorAdminId,
    targetType: 'AdminUser',
    targetId: admin.id,
    metadata: input,
  });

  return { admin };
}

export async function resetAdminPassword(actorAdminId: string, id: string, input: ResetAdminPasswordInput) {
  const existing = await prisma.adminUser.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Admin not found');
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: {
      passwordHash: await bcrypt.hash(input.password, 12),
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    select: adminSelect,
  });

  await recordAuditLog({
    action: AuditAction.ADMIN_PASSWORD_RESET,
    actorAdminId,
    targetType: 'AdminUser',
    targetId: admin.id,
    metadata: { email: admin.email },
  });

  return { admin };
}


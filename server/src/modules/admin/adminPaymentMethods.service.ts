import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type {
  CreateAdminPaymentMethodInput,
  UpdateAdminPaymentMethodInput,
} from './adminPaymentMethods.validation';

const paymentMethodSelect = {
  id: true,
  type: true,
  name: true,
  qrCodeUrl: true,
  instructions: true,
  enabled: true,
  createdAt: true,
  updatedAt: true,
};

export async function listAdminPaymentMethods() {
  const paymentMethods = await prisma.paymentMethod.findMany({
    orderBy: { createdAt: 'asc' },
    select: paymentMethodSelect,
  });

  return { paymentMethods };
}

export async function createAdminPaymentMethod(input: CreateAdminPaymentMethodInput) {
  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      type: input.type,
      name: input.name,
      qrCodeUrl: input.qrCodeUrl,
      instructions: input.instructions,
      enabled: input.enabled ?? true,
    },
    select: paymentMethodSelect,
  });

  return { paymentMethod };
}

export async function updateAdminPaymentMethod(id: string, input: UpdateAdminPaymentMethodInput) {
  const existing = await prisma.paymentMethod.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Payment method not found');
  }

  const paymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: input,
    select: paymentMethodSelect,
  });

  return { paymentMethod };
}

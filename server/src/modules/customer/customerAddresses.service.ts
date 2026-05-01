import { prisma } from '../../db';
import { HttpError } from '../../http/errors';
import type { CustomerAddressInput } from './customerAddresses.validation';

export async function listCustomerAddresses(userId: string) {
  const addresses = await prisma.customerAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return { addresses };
}

export async function createCustomerAddress(userId: string, input: CustomerAddressInput) {
  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.customerAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.customerAddress.create({
      data: {
        userId,
        receiverName: input.receiverName,
        phone: input.phone,
        address: input.address,
        isDefault: input.isDefault ?? false,
      },
    });
  });

  return { address };
}

export async function deleteCustomerAddress(userId: string, id: string) {
  const existing = await prisma.customerAddress.findFirst({ where: { id, userId } });
  if (!existing) {
    throw new HttpError(404, 'Address not found');
  }

  await prisma.customerAddress.delete({ where: { id } });
}


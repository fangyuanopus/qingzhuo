import type { AuditAction } from '@prisma/client';
import { prisma } from '../../db';

type AuditInput = {
  action: AuditAction;
  actorAdminId?: string | null;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAuditLog(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actorAdminId: input.actorAdminId ?? null,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log', error);
  }
}


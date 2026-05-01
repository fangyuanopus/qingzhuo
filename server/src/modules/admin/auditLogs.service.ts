import { prisma } from '../../db';

export async function listAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      actorAdmin: {
        select: {
          id: true,
          email: true,
          displayName: true,
        },
      },
    },
  });

  return {
    logs: logs.map((log) => ({
      ...log,
      metadata: log.metadataJson ? JSON.parse(log.metadataJson) : null,
      metadataJson: undefined,
    })),
  };
}


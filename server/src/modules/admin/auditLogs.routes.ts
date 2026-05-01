import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { requireAdmin, requireOwner } from './auth.middleware';
import { listAuditLogs } from './auditLogs.service';

export const auditLogsRouter = Router();

auditLogsRouter.use(requireAdmin, requireOwner);

auditLogsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await listAuditLogs());
  }),
);


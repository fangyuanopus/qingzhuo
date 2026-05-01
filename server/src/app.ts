import cors from 'cors';
import express from 'express';
import { config } from './config';
import { errorHandler, notFoundHandler } from './http/errors';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

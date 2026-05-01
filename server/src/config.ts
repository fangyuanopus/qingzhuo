import 'dotenv/config';

const toPort = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toPort(process.env.SERVER_PORT, 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'development-only-secret',
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};

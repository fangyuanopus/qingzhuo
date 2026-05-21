import 'dotenv/config';

const toPort = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';

const jwtSecret = (() => {
  const value = process.env.JWT_SECRET?.trim();
  if (value) return value;
  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return 'development-only-secret';
})();

const databaseUrl = (() => {
  const value = process.env.DATABASE_URL?.trim();
  if (value) return value;
  throw new Error('DATABASE_URL is required for the PostgreSQL backend');
})();

export const config = {
  nodeEnv,
  port: toPort(process.env.SERVER_PORT, 4000),
  jwtSecret,
  databaseUrl,
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
};

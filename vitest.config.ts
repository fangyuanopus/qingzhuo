import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://postgres:postgres@127.0.0.1:5432/qingzhuo_test?schema=public',
      JWT_SECRET: process.env.JWT_SECRET ?? 'test-only-secret',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? 'admin@qingzhuo.local',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? 'change-this-password',
    },
    exclude: [...configDefaults.exclude, '**/.worktrees/**'],
    fileParallelism: false,
  },
});

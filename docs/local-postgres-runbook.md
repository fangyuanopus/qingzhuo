# Local PostgreSQL Runbook

本项目后端使用 Express + Prisma + PostgreSQL。开发环境推荐通过 Docker Compose 启动本地 PostgreSQL。

## 数据库

- 开发库：`qingzhuo`
- 测试库：`qingzhuo_test`

测试会清空测试库中的业务数据，不要把 `TEST_DATABASE_URL` 指向开发库。

## 启动数据库

先启动 Docker Desktop，然后运行：

```bash
npm run db:up
```

默认连接信息：

```text
host: localhost
port: 5432
user: postgres
password: postgres
database: qingzhuo
test database: qingzhuo_test
```

停止数据库：

```bash
npm run db:down
```

`db:down` 不会删除 Docker volume 中的数据。

## 环境变量

`.env` 至少需要：

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/qingzhuo?schema=public"
TEST_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/qingzhuo_test?schema=public"
SERVER_PORT=4000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@qingzhuo.local"
ADMIN_PASSWORD="change-this-password"
VITE_USE_MOCK_API=false
```

生产环境必须替换 `JWT_SECRET` 和管理员初始密码。

## 初始化

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

如果需要单独初始化测试库，可以临时把 `DATABASE_URL` 指向 `qingzhuo_test` 后运行迁移。

PowerShell 示例：

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/qingzhuo_test?schema=public"
npm run prisma:migrate
Remove-Item Env:\DATABASE_URL
```

## 启动应用

终端 1：

```bash
npm run server:dev
```

终端 2：

```bash
npm run dev
```

Vite 会把 `/api` 代理到 `http://localhost:4000`。

## 验证

```bash
npm run build
npm run server:test
```

如果 `server:test` 失败并提示无法连接 `127.0.0.1:5432`，先检查 Docker Desktop 和 `qingzhuo-postgres` 容器状态。

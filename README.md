# 清濯 QINGZHUO 洗衣液官网

这是一个可本地运行的全栈电商官网 MVP，用于展示清濯洗衣液产品并完成真实数据库下单、扫码付款说明、用户订单查看和管理员后台处理。

## 技术栈

- 前端：React 19、TypeScript、Vite、Tailwind CSS
- 后端：Express、Prisma、PostgreSQL
- 测试：Vitest、Supertest
- 本地数据库：Docker Compose 启动 PostgreSQL 16

## 功能范围

- 前台商品展示、SKU 选择和下单
- 用户注册/登录、地址管理、我的订单
- 扫码付款说明，管理员人工确认付款
- 管理员登录、订单处理、发货、完成、退款/取消标记
- 管理员账号、商品/SKU/库存、收款方式、审计日志管理

当前版本没有接入微信/支付宝官方商户支付回调。付款采用二维码扫码 + 管理员人工确认，适合课程展示、本地演示和小规模手工履约。

## 本地启动

### 1. 安装依赖

```bash
npm install
```

### 2. 准备环境变量

复制 `.env.example` 为 `.env`，保持默认值即可本地运行：

```bash
copy .env.example .env
```

关键配置：

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

`VITE_USE_MOCK_API=false` 表示前端必须连接真实后端。只有调试前端假数据时才改成 `true`。

### 3. 启动 PostgreSQL

需要先启动 Docker Desktop，然后运行：

```bash
npm run db:up
```

如果 Docker 未启动，后端测试和 API 会报 `Can't reach database server at 127.0.0.1:5432`。

### 4. 初始化数据库

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

seed 会创建默认商品、SKU、微信/支付宝扫码方式和管理员账号。

### 5. 启动后端

```bash
npm run server:dev
```

后端默认地址：

```text
http://localhost:4000/api/health
```

### 6. 启动前端

另开一个终端：

```bash
npm run dev
```

前端默认地址：

```text
http://localhost:5173
```

后台地址：

```text
http://localhost:5173/admin
```

默认管理员：

```text
邮箱：admin@qingzhuo.local
密码：change-this-password
```

## 验证命令

```bash
npm run build
```

后端测试需要 PostgreSQL 和测试库 `qingzhuo_test` 可连接：

```bash
npm run server:test
```

## 常见问题

**1. 后端启动时报 DATABASE_URL 缺失**

确认已经复制 `.env.example` 为 `.env`，并且 `DATABASE_URL` 不为空。

**2. 测试提示 Can't reach database server at 127.0.0.1:5432**

Docker Desktop 没启动，或 PostgreSQL 容器没运行。先执行 `npm run db:up`。

**3. 页面接口失败但没有 mock 数据**

这是预期行为。当前项目默认使用真实 API，只有 `.env` 中设置 `VITE_USE_MOCK_API=true` 才会启用开发假数据。

## 项目结构

```text
src/                    前端页面、用户区、后台管理区和 API client
server/src/             Express API、业务模块、认证和错误处理
prisma/                 Prisma schema、迁移和 seed
docker/postgres/init/   本地 PostgreSQL 初始化脚本
docs/                   运行手册和设计/实现计划
```

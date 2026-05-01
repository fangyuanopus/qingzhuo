---
mode: design
cwd: F:\桌面\学校\清濯洗衣液官网
task: 清濯官网真实下单电商后端设计
complexity: medium
planning_method: superpowers-brainstorming
created_at: 2026-05-01T08:24:59+08:00
---

# Design: Qingzhuo Ecommerce Backend

## Task Overview

当前项目是 React + Vite 静态品牌官网，商品、价格、评价和 FAQ 都写在前端常量中。第一版后端目标是支持真实下单，但不接入微信/支付宝正式支付 API。

第一版采用“扫码付款 + 管理员人工确认”的交易闭环：用户提交订单后看到收款码和订单号，管理员登录后台查看购买情况、确认付款、更新发货状态。

## Scope

### In Scope

1. 用户从官网商品套餐发起下单。
2. 用户填写姓名、手机号、收货地址和备注。
3. 后端创建订单并返回订单号、金额、支付说明和收款码信息。
4. 管理员账号登录后台。
5. 管理员查看订单列表、订单详情和购买情况。
6. 管理员手动确认付款、更新发货状态、记录快递信息。
7. 商品、规格、价格和库存由数据库保存。

### Out of Scope

1. 不接入微信/支付宝正式支付 API。
2. 第一版不做购物车，多套餐场景使用“立即购买”。
3. 第一版不做会员体系。
4. 第一版不做优惠券、分销、积分。
5. 第一版不做多管理员复杂权限。

## Recommended Architecture

采用 Node.js 后端服务，与现有 Vite 前端分离：

1. Frontend: React + Vite，继续负责品牌展示、商品展示和下单表单。
2. Backend API: Express 或 Fastify，提供订单、商品、管理员认证接口。
3. ORM: Prisma，统一数据库 schema、迁移和类型。
4. Database: 第一版使用 SQLite，后续部署或并发需求提高时迁移到 PostgreSQL。
5. Admin: 复用 React 前端新增 `/admin` 页面，或在同一 SPA 中增加管理端路由。

推荐第一版使用 Express + Prisma + SQLite。它的配置成本最低，适合当前课程展示和小规模真实售卖；业务稳定后再切 PostgreSQL。

## Core Modules

### Product Module

保存商品、套餐和库存信息。前端不再从硬编码常量读取价格，而是通过 API 获取可购买 SKU。

核心能力：

1. 查询商品和 SKU 列表。
2. 标记 SKU 是否上架。
3. 维护价格、原价、库存、展示文案。

### Order Module

负责创建订单和维护订单状态。订单号由后端生成，避免前端伪造。

订单状态建议：

```text
pending_payment -> paid_confirmed -> shipping -> completed
cancelled
refunded
```

第一版不要求用户上传付款截图。管理员在收到扫码付款后进入后台，将订单从 `pending_payment` 改为 `paid_confirmed`。

### Admin Auth Module

提供管理员登录能力。第一版只需要一个管理员账号，但密码必须加密存储。

核心能力：

1. 管理员登录。
2. 后端签发短期会话或 JWT。
3. 管理端接口校验管理员身份。
4. 支持通过 seed 初始化默认管理员账号。

默认管理员建议只在本地初始化时生成，密码从环境变量读取，例如：

```text
ADMIN_EMAIL=admin@qingzhuo.local
ADMIN_PASSWORD=<local-only-password>
```

### Admin Order Module

管理员登录后查看购买情况。

核心页面：

1. 订单总览：订单号、客户、手机号、金额、状态、下单时间。
2. 订单详情：商品明细、收货地址、备注、支付方式、状态历史。
3. 状态操作：确认付款、填写快递单号、标记完成、取消订单。

### Payment Settings Module

由于第一版使用扫码付款，后台需要保存或配置收款方式。

核心字段：

1. 支付方式：微信、支付宝。
2. 收款二维码图片地址。
3. 收款说明。
4. 是否启用。

## Data Model Draft

### Product

```text
id
name
description
status
createdAt
updatedAt
```

### Sku

```text
id
productId
name
spec
priceCents
originalPriceCents
stock
imageUrl
status
createdAt
updatedAt
```

### Customer

```text
id
name
phone
address
createdAt
updatedAt
```

### Order

```text
id
orderNo
customerId
status
totalAmountCents
paymentMethod
shippingCarrier
trackingNo
remark
createdAt
updatedAt
```

### OrderItem

```text
id
orderId
skuId
skuNameSnapshot
unitPriceCents
quantity
subtotalCents
```

### PaymentMethod

```text
id
type
name
qrCodeUrl
instructions
enabled
createdAt
updatedAt
```

### AdminUser

```text
id
email
passwordHash
displayName
role
createdAt
updatedAt
```

### OrderStatusLog

```text
id
orderId
fromStatus
toStatus
operatorId
note
createdAt
```

## API Draft

### Public APIs

```text
GET /api/products
GET /api/payment-methods
POST /api/orders
GET /api/orders/:orderNo
```

`POST /api/orders` 接收 SKU、数量、客户信息和备注。后端校验 SKU 上架状态、库存、价格，并按数据库价格计算订单金额。

### Admin APIs

```text
POST /api/admin/login
POST /api/admin/logout
GET /api/admin/me
GET /api/admin/orders
GET /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
PATCH /api/admin/orders/:id/shipping
GET /api/admin/products
PATCH /api/admin/skus/:id
```

所有 `/api/admin/*` 接口都必须验证管理员身份。

## Frontend Flow

1. 官网加载时请求 `/api/products` 渲染商品套餐。
2. 用户点击“立即购买”打开下单弹窗或进入下单区。
3. 用户提交订单。
4. 前端展示订单号、金额、收款码和付款说明。
5. 管理员进入 `/admin/login` 登录。
6. 管理员在 `/admin/orders` 查看购买情况。
7. 管理员核对收款后更新订单状态。

## Error Handling

1. SKU 下架或库存不足时，订单创建失败并返回明确提示。
2. 手机号、地址、数量等字段必须校验。
3. 管理员认证失败返回 401。
4. 非法状态流转返回 400，例如未确认付款时不能直接完成订单。
5. 后端记录订单状态变更日志，便于排查。

## Testing Plan

1. 单元测试：订单金额计算、库存校验、状态流转。
2. API 测试：创建订单、管理员登录、查询订单、更新状态。
3. 前端验证：下单表单、订单成功页、管理员订单列表。
4. 回归验证：现有官网展示和导航不受影响。

## Risks

1. SQLite 适合第一版和小规模真实订单，但生产部署或多人管理时建议迁移 PostgreSQL。
2. 扫码付款依赖人工核款，可能出现用户已付款但管理员未及时确认的延迟。
3. 管理员默认账号不能硬编码密码，必须从环境变量或初始化命令读取。
4. 当前 `src/App.tsx` 页面较大，接 API 前建议先拆分商品和订单相关组件。

## References

1. `package.json:7` - 当前只有 Vite 前端脚本。
2. `package.json:12` - 当前依赖中没有后端框架、ORM 或数据库客户端。
3. `src/App.tsx:22` - 商品数据当前在前端硬编码。
4. `src/App.tsx:57` - 套餐价格当前在前端硬编码。
5. `src/App.tsx:63` - 用户评价当前在前端硬编码。
6. `src/App.tsx:70` - FAQ 当前在前端硬编码。
7. `src/App.tsx:299` - “立即购买”当前只滚动到套餐区域。

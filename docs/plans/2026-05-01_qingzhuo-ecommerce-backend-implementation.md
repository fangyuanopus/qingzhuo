# Qingzhuo Ecommerce Backend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real order-taking backend for the Qingzhuo website with QR-code payment instructions and an admin login for reviewing purchases.

**Architecture:** Keep the current React + Vite frontend, add a small Express API server under `server/`, and use Prisma for database access. Start with SQLite for local development and small-scale real orders; keep the schema compatible with a later PostgreSQL migration.

**Tech Stack:** React 19, Vite, TypeScript, Express, Prisma, SQLite, bcrypt, JWT or signed HTTP-only cookie sessions, Vitest/Supertest.

---

## Current Context

The app is currently a static Vite frontend. Product plans, prices, reviews, and FAQ content are hardcoded in `src/App.tsx`. There is no backend directory, no ORM, no database migration, no API service layer, and no admin login.

Relevant files:

- `package.json`
- `vite.config.ts`
- `src/App.tsx`
- `src/components/ui/button.tsx`
- `src/index.css`
- `docs/plans/2026-05-01_qingzhuo-ecommerce-backend-design.md`

Do not overwrite existing uncommitted frontend changes. Read files before editing.

---

### Task 1: Add Backend Dependencies and Scripts

**Files:**

- Modify: `package.json`
- Create: `.env.example`
- Create: `server/tsconfig.json`

**Step 1: Add dependencies**

Install runtime dependencies:

```bash
npm install express @prisma/client bcryptjs jsonwebtoken zod cors dotenv
```

Install development dependencies:

```bash
npm install -D prisma tsx supertest vitest @types/express @types/cors @types/jsonwebtoken @types/supertest
```

**Step 2: Add scripts**

Modify `package.json` scripts:

```json
{
  "server:dev": "tsx server/src/index.ts",
  "server:test": "vitest run server",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:seed": "tsx prisma/seed.ts"
}
```

Keep existing `dev`, `build`, and `preview` scripts.

**Step 3: Create `.env.example`**

```text
DATABASE_URL="file:./dev.db"
SERVER_PORT=4000
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_EMAIL="admin@qingzhuo.local"
ADMIN_PASSWORD="change-this-password"
```

**Step 4: Verify**

Run:

```bash
npm run prisma:generate
```

Expected: Prisma reports no schema found until Task 2. This confirms the script exists but implementation is incomplete.

---

### Task 2: Define Prisma Schema and Seed Data

**Files:**

- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`

**Step 1: Write schema**

Create models:

- `Product`
- `Sku`
- `Customer`
- `Order`
- `OrderItem`
- `PaymentMethod`
- `AdminUser`
- `OrderStatusLog`

Use integer cents for money fields. Use enum fields for order status, SKU status, product status, payment method type, and admin role.

Required order statuses:

```text
PENDING_PAYMENT
PAID_CONFIRMED
SHIPPING
COMPLETED
CANCELLED
REFUNDED
```

**Step 2: Write seed**

Seed:

- Product: Qingzhuo laundry detergent.
- SKUs matching the current plan cards:
  - 2kg daily family pack, 3990 cents.
  - 2kg x 2 bundle, 6990 cents.
  - 500ml trial pack, 1490 cents.
- Payment methods:
  - WeChat QR placeholder.
  - Alipay QR placeholder.
- Admin user:
  - Email from `ADMIN_EMAIL`.
  - Password from `ADMIN_PASSWORD`.
  - Password hashed with bcrypt.

**Step 3: Run migration**

Run:

```bash
npm run prisma:migrate -- --name init_ecommerce_backend
npm run prisma:seed
```

Expected: SQLite database is created and seeded.

**Step 4: Commit**

```bash
git add package.json package-lock.json .env.example server/tsconfig.json prisma/schema.prisma prisma/seed.ts
git commit -m "feat: add ecommerce database schema"
```

---

### Task 3: Add Express App Foundation

**Files:**

- Create: `server/src/app.ts`
- Create: `server/src/index.ts`
- Create: `server/src/config.ts`
- Create: `server/src/db.ts`
- Create: `server/src/http/errors.ts`
- Create: `server/src/http/asyncHandler.ts`
- Test: `server/src/app.test.ts`

**Step 1: Write failing health test**

Test `GET /api/health` returns:

```json
{ "ok": true }
```

**Step 2: Run test**

```bash
npm run server:test -- server/src/app.test.ts
```

Expected: FAIL because app does not exist.

**Step 3: Implement app**

Create Express app with:

- JSON body parser.
- CORS for local Vite frontend.
- `/api/health`.
- Central error handler.

`server/src/index.ts` should read `SERVER_PORT` and start the server.

**Step 4: Run test**

```bash
npm run server:test -- server/src/app.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add server/src
git commit -m "feat: add express api foundation"
```

---

### Task 4: Implement Public Product and Payment APIs

**Files:**

- Create: `server/src/modules/products/products.routes.ts`
- Create: `server/src/modules/products/products.service.ts`
- Create: `server/src/modules/payments/paymentMethods.routes.ts`
- Create: `server/src/modules/payments/paymentMethods.service.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/products/products.routes.test.ts`
- Test: `server/src/modules/payments/paymentMethods.routes.test.ts`

**Step 1: Write failing API tests**

Test:

- `GET /api/products` returns active products and active SKUs.
- `GET /api/payment-methods` returns enabled QR payment methods only.

**Step 2: Implement services**

Product API response should expose:

```ts
{
  id: string;
  name: string;
  description: string | null;
  skus: Array<{
    id: string;
    name: string;
    spec: string;
    priceCents: number;
    originalPriceCents: number | null;
    stock: number;
    imageUrl: string | null;
  }>;
}
```

Payment method API response should expose QR-code information and instructions, but no internal admin fields.

**Step 3: Run tests**

```bash
npm run server:test -- server/src/modules/products server/src/modules/payments
```

Expected: PASS.

**Step 4: Commit**

```bash
git add server/src/modules server/src/app.ts
git commit -m "feat: expose public product and payment APIs"
```

---

### Task 5: Implement Public Order Creation

**Files:**

- Create: `server/src/modules/orders/orders.routes.ts`
- Create: `server/src/modules/orders/orders.service.ts`
- Create: `server/src/modules/orders/orders.validation.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/orders/orders.service.test.ts`
- Test: `server/src/modules/orders/orders.routes.test.ts`

**Step 1: Write failing tests**

Test:

- Creates order from SKU, quantity, customer name, phone, address, and remark.
- Calculates total from database price, not frontend input.
- Rejects inactive SKU.
- Rejects insufficient stock.
- Rejects invalid phone/address.
- Creates first `OrderStatusLog`.

**Step 2: Implement validation**

Use Zod for:

- `skuId`: non-empty string.
- `quantity`: integer from 1 to 99.
- `customer.name`: 1-50 chars.
- `customer.phone`: 6-30 chars, digits plus common separators.
- `customer.address`: 5-200 chars.
- `remark`: optional, max 300 chars.

**Step 3: Implement service**

Inside a Prisma transaction:

1. Load SKU and product.
2. Validate status and stock.
3. Create or update customer by phone and address.
4. Create order.
5. Create order item with price snapshot.
6. Decrement stock.
7. Create status log.

**Step 4: Implement API**

`POST /api/orders` returns:

```ts
{
  orderNo: string;
  status: "PENDING_PAYMENT";
  totalAmountCents: number;
  paymentMethods: PaymentMethodResponse[];
}
```

**Step 5: Run tests**

```bash
npm run server:test -- server/src/modules/orders
```

Expected: PASS.

**Step 6: Commit**

```bash
git add server/src/modules/orders server/src/app.ts
git commit -m "feat: create public order API"
```

---

### Task 6: Implement Admin Authentication

**Files:**

- Create: `server/src/modules/admin/auth.routes.ts`
- Create: `server/src/modules/admin/auth.service.ts`
- Create: `server/src/modules/admin/auth.middleware.ts`
- Create: `server/src/modules/admin/auth.validation.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/admin/auth.routes.test.ts`

**Step 1: Write failing tests**

Test:

- Login succeeds with seeded admin credentials.
- Login fails with wrong password.
- Protected admin route rejects missing token.
- Protected admin route accepts valid token.

**Step 2: Implement login**

`POST /api/admin/login` accepts:

```ts
{
  "email": "admin@qingzhuo.local",
  "password": "..."
}
```

Return:

```ts
{
  "token": "...",
  "admin": {
    "id": "...",
    "email": "...",
    "displayName": "..."
  }
}
```

**Step 3: Implement middleware**

Require `Authorization: Bearer <token>` for admin routes.

**Step 4: Run tests**

```bash
npm run server:test -- server/src/modules/admin
```

Expected: PASS.

**Step 5: Commit**

```bash
git add server/src/modules/admin server/src/app.ts
git commit -m "feat: add admin authentication"
```

---

### Task 7: Implement Admin Order Management APIs

**Files:**

- Create: `server/src/modules/admin/adminOrders.routes.ts`
- Create: `server/src/modules/admin/adminOrders.service.ts`
- Create: `server/src/modules/admin/adminOrders.validation.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/admin/adminOrders.routes.test.ts`

**Step 1: Write failing tests**

Test:

- Admin can list orders.
- Admin can view order detail.
- Admin can confirm payment.
- Admin can mark shipping with carrier and tracking number.
- Admin can mark completed.
- Invalid state transition is rejected.

**Step 2: Implement list/detail**

`GET /api/admin/orders` should support:

- `status`
- `keyword`
- `page`
- `pageSize`

Return order number, customer, phone, total, status, and created time.

**Step 3: Implement status updates**

Allowed transitions:

```text
PENDING_PAYMENT -> PAID_CONFIRMED
PAID_CONFIRMED -> SHIPPING
SHIPPING -> COMPLETED
PENDING_PAYMENT -> CANCELLED
PAID_CONFIRMED -> REFUNDED
```

Every transition writes `OrderStatusLog`.

**Step 4: Run tests**

```bash
npm run server:test -- server/src/modules/admin/adminOrders.routes.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add server/src/modules/admin server/src/app.ts
git commit -m "feat: add admin order management APIs"
```

---

### Task 8: Connect Frontend Product and Order Flow

**Files:**

- Create: `src/api/client.ts`
- Create: `src/api/products.ts`
- Create: `src/api/orders.ts`
- Create: `src/types/ecommerce.ts`
- Modify: `src/App.tsx`

**Step 1: Extract frontend API types**

Create shared frontend types for product, SKU, order request, order response, and payment method response.

**Step 2: Fetch products**

Replace the hardcoded purchase plan rendering with data from `GET /api/products`. Keep a fallback loading state and user-friendly error state.

**Step 3: Add order form**

When the user clicks “立即购买”, open an order form with:

- Selected SKU.
- Quantity.
- Name.
- Phone.
- Address.
- Remark.

**Step 4: Submit order**

Call `POST /api/orders`. On success, display:

- Order number.
- Total amount.
- WeChat/Alipay QR code options.
- Payment instructions.

**Step 5: Verify frontend build**

```bash
npm run build
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/api src/types src/App.tsx
git commit -m "feat: connect storefront order flow"
```

---

### Task 9: Add Admin Login and Order Dashboard

**Files:**

- Create: `src/admin/AdminApp.tsx`
- Create: `src/admin/AdminLogin.tsx`
- Create: `src/admin/AdminOrders.tsx`
- Create: `src/admin/adminApi.ts`
- Create: `src/admin/adminTypes.ts`
- Modify: `src/App.tsx` or `src/main.tsx`
- Modify: `src/index.css`

**Step 1: Add route switch**

Use a minimal path check:

```ts
const isAdmin = window.location.pathname.startsWith('/admin');
```

Render admin app for `/admin`, storefront otherwise. Avoid adding React Router unless routing complexity grows.

**Step 2: Implement login page**

Admin login form:

- Email.
- Password.
- Submit.
- Error state.

Store token in memory plus `sessionStorage` for first version.

**Step 3: Implement order dashboard**

Order list columns:

- Order number.
- Customer name.
- Phone.
- Amount.
- Status.
- Created time.
- Action.

Order detail panel:

- Items.
- Address.
- Remark.
- Status history.
- Confirm payment button.
- Shipping carrier and tracking number inputs.

**Step 4: Connect admin APIs**

Use `Authorization: Bearer <token>` for all admin requests.

**Step 5: Verify frontend build**

```bash
npm run build
```

Expected: PASS.

**Step 6: Commit**

```bash
git add src/admin src/App.tsx src/main.tsx src/index.css
git commit -m "feat: add admin order dashboard"
```

---

### Task 10: Add Local Development Proxy and Runbook

**Files:**

- Modify: `vite.config.ts`
- Modify: `README.md`
- Create: `docs/admin-runbook.md`

**Step 1: Add Vite proxy**

Proxy `/api` to `http://localhost:4000` in development.

**Step 2: Document setup**

Update README with:

```bash
cp .env.example .env
npm install
npm run prisma:migrate -- --name init_ecommerce_backend
npm run prisma:seed
npm run server:dev
npm run dev
```

Document admin login:

```text
URL: /admin
Email: value of ADMIN_EMAIL
Password: value of ADMIN_PASSWORD
```

**Step 3: Add runbook**

`docs/admin-runbook.md` should explain:

- How to view orders.
- How to confirm payment.
- How to fill shipping info.
- How to handle cancellation/refund manually.

**Step 4: Verify**

Run:

```bash
npm run server:test
npm run build
```

Expected: both PASS.

**Step 5: Commit**

```bash
git add vite.config.ts README.md docs/admin-runbook.md
git commit -m "docs: add ecommerce backend runbook"
```

---

### Task 11: Final Manual Verification

**Files:**

- No file changes expected.

**Step 1: Start backend**

```bash
npm run server:dev
```

Expected: API server starts on port 4000.

**Step 2: Start frontend**

```bash
npm run dev
```

Expected: Vite starts and proxies `/api`.

**Step 3: Verify buyer flow**

1. Open storefront.
2. Select a SKU.
3. Submit an order.
4. Confirm the success view shows order number, amount, and QR payment method.

**Step 4: Verify admin flow**

1. Open `/admin`.
2. Log in with seeded admin account.
3. Confirm the new order appears.
4. Mark payment confirmed.
5. Add shipping carrier and tracking number.
6. Mark completed.

**Step 5: Verify database**

Use Prisma Studio:

```bash
npx prisma studio
```

Expected: order, customer, item, and status log rows exist.

---

## Execution Notes

1. Prefer small commits after each task.
2. Keep current storefront visuals intact unless a task explicitly changes them.
3. Do not hardcode admin password in source code.
4. Do not trust frontend prices; calculate totals on the backend.
5. Keep the first version simple: one SKU per order is acceptable because the current site has direct purchase cards, not a cart.
6. Use the design document as the source of truth for scope: `docs/plans/2026-05-01_qingzhuo-ecommerce-backend-design.md`.

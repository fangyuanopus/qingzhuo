# Qingzhuo Runnable MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the current Qingzhuo project a locally runnable ecommerce MVP with honest API behavior, admin configuration screens, and updated setup docs.

**Architecture:** Extend the existing Express + Prisma + PostgreSQL backend rather than replacing it. Add missing admin CRUD endpoints and connect them to the existing React admin area.

**Tech Stack:** React 19, Vite, TypeScript, Express, Prisma, PostgreSQL, Vitest, Supertest.

---

### Task 1: Confirm Current Backend Boundary

**Files:**
- Read: `server/src/app.ts`
- Read: `prisma/schema.prisma`
- Read: `src/admin/AdminApp.tsx`
- Read: `src/admin/adminApi.ts`
- Read: `src/api/*.ts`

**Steps:**
1. Identify implemented APIs and missing operational APIs.
2. Confirm frontend mock fallback behavior.
3. Record validation blockers.

### Task 2: Add Admin Product/SKU Management

**Files:**
- Create or modify: `server/src/modules/admin/adminProducts.routes.ts`
- Create or modify: `server/src/modules/admin/adminProducts.service.ts`
- Create or modify: `server/src/modules/admin/adminProducts.validation.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/admin/adminProducts.routes.test.ts`

**Steps:**
1. Write failing tests for listing products, creating SKUs/products, updating stock/status/price.
2. Implement minimal admin-only endpoints.
3. Run targeted tests.

### Task 3: Add Admin Payment Method Management

**Files:**
- Create or modify: `server/src/modules/admin/adminPaymentMethods.routes.ts`
- Create or modify: `server/src/modules/admin/adminPaymentMethods.service.ts`
- Create or modify: `server/src/modules/admin/adminPaymentMethods.validation.ts`
- Modify: `server/src/app.ts`
- Test: `server/src/modules/admin/adminPaymentMethods.routes.test.ts`

**Steps:**
1. Write failing tests for list, create, update, enable/disable.
2. Implement admin-only endpoints.
3. Run targeted tests.

### Task 4: Connect Admin UI

**Files:**
- Modify: `src/admin/adminApi.ts`
- Modify: `src/admin/adminTypes.ts`
- Modify: `src/admin/AdminApp.tsx`
- Create or modify: `src/admin/AdminProducts.tsx`
- Create or modify: `src/admin/AdminPaymentMethods.tsx`

**Steps:**
1. Add API clients for products and payment methods.
2. Add tabs/screens to the admin app.
3. Provide forms for common operational edits.
4. Run `npm run build`.

### Task 5: Make Mock API Opt-In

**Files:**
- Modify: `src/api/auth.ts`
- Modify: `src/api/myOrders.ts`
- Modify: `src/api/customerAddresses.ts`
- Modify: `src/admin/adminApi.ts`
- Modify: `.env.example`

**Steps:**
1. Change mock fallback condition to `VITE_USE_MOCK_API === 'true'`.
2. Keep `.env.example` set to `false`.
3. Run `npm run build`.

### Task 6: Update Runtime Docs

**Files:**
- Modify: `README.md`
- Modify: `docs/local-postgres-runbook.md`
- Create or modify: `docs/admin-runbook.md`

**Steps:**
1. Replace stale/garbled README with real setup instructions.
2. Document Docker/PostgreSQL, migration, seed, backend/frontend startup.
3. Document admin workflow and current payment boundary.

### Task 7: Final Verification

**Commands:**
- `npm run build`
- `npm run server:test`
- `docker ps --filter name=qingzhuo-postgres`

**Expected:**
- Build passes.
- Backend tests pass when PostgreSQL is running and migrated.
- If Docker/PostgreSQL is unavailable, record the exact environment blocker.

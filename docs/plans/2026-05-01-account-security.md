# Account Security Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a practical small-commerce account security baseline for administrators and customers.

**Architecture:** Extend the existing Express + Prisma backend with account statuses, lockout fields, reset token hashes, customer addresses, administrator management APIs, and audit logs. Keep Bearer JWT compatibility while adding `HttpOnly` cookies for browser sessions. Add focused React admin/customer account screens without changing the public purchase flow.

**Tech Stack:** Express 5, Prisma SQLite, JWT, bcryptjs, zod, React 19, Vite, Vitest, Supertest.

---

### Task 1: Add Failing Security Tests

**Files:**
- Modify: `server/src/modules/admin/auth.routes.test.ts`
- Create: `server/src/modules/admin/adminUsers.routes.test.ts`
- Create: `server/src/modules/admin/auditLogs.routes.test.ts`
- Modify: `server/src/modules/admin/adminOrders.routes.test.ts`
- Modify: `server/src/modules/customer/customerAuth.routes.test.ts`
- Create: `server/src/modules/customer/customerAddresses.routes.test.ts`

**Steps:**
1. Add tests for admin cookie login, disabled login rejection, owner-created admins, owner-disabled admins, password reset, audit log listing, and rejecting `POST /api/admin/orders`.
2. Add tests for customer cookie login, lockout after repeated failures, password reset, profile update, and address CRUD.
3. Run targeted tests and verify they fail because fields/routes do not exist yet.

### Task 2: Extend Database Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_account_security_baseline/migration.sql`
- Modify: `server/src/testUtils.ts`
- Modify: `prisma/seed.ts`

**Steps:**
1. Add `AdminStatus`, `CustomerStatus`, `AuditAction`, `CustomerAddress`, and `AuditLog`.
2. Add account hardening fields to `AdminUser` and `CustomerAccount`.
3. Generate migration and Prisma client.
4. Update reset helpers and seed defaults.

### Task 3: Implement Shared Auth Security Helpers

**Files:**
- Create: `server/src/http/authCookies.ts`
- Create: `server/src/modules/audit/audit.service.ts`
- Modify: `server/src/app.ts`
- Modify: `server/src/config.ts`

**Steps:**
1. Add cookie read/set/clear helpers for admin and customer sessions.
2. Enable CORS credentials.
3. Add audit logging helper that never breaks the primary operation.

### Task 4: Implement Admin Management And Audit APIs

**Files:**
- Modify: `server/src/modules/admin/auth.service.ts`
- Modify: `server/src/modules/admin/auth.middleware.ts`
- Modify: `server/src/modules/admin/auth.routes.ts`
- Modify: `server/src/modules/admin/auth.validation.ts`
- Create: `server/src/modules/admin/adminUsers.routes.ts`
- Create: `server/src/modules/admin/adminUsers.service.ts`
- Create: `server/src/modules/admin/adminUsers.validation.ts`
- Create: `server/src/modules/admin/auditLogs.routes.ts`
- Create: `server/src/modules/admin/auditLogs.service.ts`
- Modify: `server/src/modules/admin/adminOrders.service.ts`
- Modify: `server/src/modules/admin/adminOrders.routes.ts`
- Modify: `server/src/app.ts`

**Steps:**
1. Add disabled/locked admin login checks and cookie session response.
2. Add owner-only middleware.
3. Add list/create/update/reset-password admin APIs.
4. Add audit-log list API.
5. Log order status, shipping, and admin user management actions.

### Task 5: Implement Customer Account APIs

**Files:**
- Modify: `server/src/modules/customer/customerAuth.service.ts`
- Modify: `server/src/modules/customer/customerAuth.middleware.ts`
- Modify: `server/src/modules/customer/customerAuth.routes.ts`
- Modify: `server/src/modules/customer/customerAuth.validation.ts`
- Create: `server/src/modules/customer/customerAddresses.routes.ts`
- Create: `server/src/modules/customer/customerAddresses.service.ts`
- Create: `server/src/modules/customer/customerAddresses.validation.ts`
- Modify: `server/src/app.ts`

**Steps:**
1. Add cookie-backed customer auth.
2. Add failed login lockout.
3. Add profile update.
4. Add password reset request and reset completion.
5. Add saved address CRUD for the logged-in customer.

### Task 6: Add Admin And Customer UI

**Files:**
- Modify: `src/api/client.ts`
- Modify: `src/admin/adminTypes.ts`
- Modify: `src/admin/adminApi.ts`
- Modify: `src/admin/AdminApp.tsx`
- Create: `src/admin/AdminUsers.tsx`
- Create: `src/admin/AdminAuditLogs.tsx`
- Modify: `src/types/ecommerce.ts`
- Modify: `src/api/auth.ts`
- Create: `src/api/customerAddresses.ts`
- Modify: `src/customer/CustomerAuthDialog.tsx`
- Modify: `src/customer/CustomerOrdersDialog.tsx`

**Steps:**
1. Send credentials with API requests and stop requiring browser token storage for normal UI calls.
2. Add admin tabs for orders, administrator accounts, and audit logs.
3. Add customer reset password and saved-address views.
4. Keep the current visual language: dense, utilitarian admin UI and compact customer dialogs.

### Task 7: Verify, Commit, Push, Restart

**Files:**
- All changed files.

**Steps:**
1. Run `npm run server:test`.
2. Run `npx tsc -p server/tsconfig.json`.
3. Run `npm run build`.
4. Commit with `feat: harden account management`.
5. Push `feature/ecommerce-backend`.
6. Restart local API/front-end and smoke test login, admin management, audit log, customer reset, and address flow.


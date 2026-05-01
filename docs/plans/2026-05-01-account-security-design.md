---
mode: design
cwd: F:\桌面\学校\清濯洗衣液官网\.worktrees\ecommerce-backend
task: Account security and management baseline
complexity: complex
planning_method: builtin
created_at: 2026-05-01_18-26-56
---

# Account Security And Management Design

## Goal

Bring the ecommerce backend from an MVP account model to a practical small-commerce baseline: separate customer and administrator accounts, owner-only administrator management, audit logging, password recovery basics, account lockout, and safer cookie-based sessions.

## Architecture

The existing Express API remains the boundary for all account behavior. JWTs continue to be the session credential, but the API will also set `HttpOnly` cookies so browser clients do not need to store tokens in `sessionStorage`. Bearer tokens stay supported for tests and API compatibility.

Prisma remains the source of truth. Account hardening is modeled with explicit statuses, lockout timestamps, password reset token hashes, customer addresses, and a generic audit log table. Administrator-only operations require `AdminRole.OWNER`.

## Admin Account Rules

- Owners can list, create, disable, enable, and reset administrator accounts.
- Disabled administrators cannot log in or use existing tokens.
- Sensitive admin operations create audit log rows.
- Order status and shipping updates also write audit rows in addition to order status logs.
- Admin order pages remain operational pages only; no admin order creation.

## Customer Account Rules

- Customers can register, log in, log out, update their profile name, manage saved addresses, request a reset token, and reset their password.
- Failed logins increment a counter and temporarily lock the account after repeated failures.
- Customer order visibility stays scoped to the authenticated customer.
- Checkout remains available to guests, but logged-in checkout binds the order to the customer account.

## Error Handling

Account login errors remain generic to avoid account enumeration. Disabled and locked accounts return clear but non-sensitive messages. Reset request returns a neutral response; because this project has no SMS or email provider yet, non-production responses include a reset token for local testing.

## Testing

Add backend tests for owner-only admin management, disabled admin login rejection, audit log creation, cookie session support, customer lockout, password reset, address management, and admin order creation rejection. Run the full backend test suite, server TypeScript check, and frontend production build before final handoff.


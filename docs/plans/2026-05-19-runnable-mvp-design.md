# Qingzhuo Runnable MVP Design

## Goal

Turn the current Qingzhuo storefront into a locally runnable ecommerce MVP: the buyer can browse seeded products, create a real order against PostgreSQL, and an admin can manage the operational parts needed to fulfill that order.

## Chosen Approach

Use the existing React + Vite frontend, Express API server, Prisma schema, and PostgreSQL Docker setup. Keep the current QR-code/manual payment model instead of integrating real WeChat or Alipay merchant APIs, because merchant credentials and callback infrastructure are outside the local project boundary.

## Scope

- Make local setup explicit and repeatable with environment examples, database bootstrap guidance, and health checks.
- Keep existing buyer flow: products, registration/login, addresses, orders, and QR payment instructions.
- Fill admin operational gaps: product/SKU management and payment method management, in addition to existing order and admin-user management.
- Make frontend API fallback behavior honest: mock data is opt-in, not silently enabled whenever the backend is down.
- Update documentation so the repository state matches the actual full-stack architecture.

## Architecture

The frontend calls relative `/api/*` paths. Vite proxies those calls to `http://localhost:4000` in development. The Express server owns validation, authentication, order state transitions, stock changes, and admin-only mutations. Prisma remains the single database access layer.

## Data Flow

1. Seed creates products, SKUs, QR payment methods, and the first admin account.
2. Buyers fetch active products and submit orders.
3. The backend calculates prices from database SKU records and decrements stock in a transaction.
4. Admin users log in, review orders, update shipping/status, and manage product/payment configuration.

## Error Handling

Backend validation errors return structured JSON via the existing central error handler. Frontend API calls should surface failures when `VITE_USE_MOCK_API` is not explicitly set to `true`.

## Testing

Use existing Vitest + Supertest coverage for backend APIs. Add backend tests for admin product and payment-method management. Run `npm run build` for frontend/TypeScript verification. Full integration tests require PostgreSQL on `localhost:5432`.

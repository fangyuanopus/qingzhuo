-- CreateTable
CREATE TABLE "customer_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "totalAmountCents" INTEGER NOT NULL,
    "paymentMethod" TEXT,
    "shippingCarrier" TEXT,
    "trackingNo" TEXT,
    "remark" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customer_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "customerId", "id", "orderNo", "paymentMethod", "remark", "shippingCarrier", "status", "totalAmountCents", "trackingNo", "updatedAt") SELECT "createdAt", "customerId", "id", "orderNo", "paymentMethod", "remark", "shippingCarrier", "status", "totalAmountCents", "trackingNo", "updatedAt" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNo_key" ON "orders"("orderNo");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "customer_accounts_phone_key" ON "customer_accounts"("phone");

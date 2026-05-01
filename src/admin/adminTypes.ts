import type { OrderStatus } from '../types/ecommerce';

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  role?: string;
  status?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AuditLog = {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actorAdmin: {
    id: string;
    email: string;
    displayName: string;
  } | null;
};

export type AdminOrderSummary = {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalAmountCents: number;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  createdAt: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalAmountCents: number;
  shippingCarrier: string | null;
  trackingNo: string | null;
  remark: string | null;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    id: string;
    skuNameSnapshot: string;
    unitPriceCents: number;
    quantity: number;
    subtotalCents: number;
  }>;
  statusLogs: Array<{
    id: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note: string | null;
    createdAt: string;
    operator?: {
      displayName: string;
      email: string;
    } | null;
  }>;
};

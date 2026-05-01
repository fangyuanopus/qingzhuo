import { apiRequest } from '../api/client';
import type { OrderStatus } from '../types/ecommerce';
import type { AdminOrderDetail, AdminOrderSummary, AdminUser, AuditLog } from './adminTypes';

const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false';

function mockAdminSession(email: string) {
  return {
    token: 'mock-admin-token',
    admin: {
      id: 'mock-admin-user',
      email,
      displayName: 'Mock 管理员',
      role: 'OWNER',
      status: 'ACTIVE',
      mustChangePassword: false,
    } satisfies AdminUser,
  };
}

const mockOrderSummary: AdminOrderSummary = {
  id: 'mock-order',
  orderNo: 'QZMOCK000001',
  status: 'PENDING_PAYMENT',
  totalAmountCents: 3990,
  customerName: 'Mock 用户',
  customerPhone: '13900000000',
  itemCount: 1,
  createdAt: new Date().toISOString(),
};

function mockOrderDetail(id: string): AdminOrderDetail {
  return {
    id,
    orderNo: 'QZMOCK000001',
    status: 'PENDING_PAYMENT',
    totalAmountCents: 3990,
    shippingCarrier: null,
    trackingNo: null,
    remark: 'Mock 订单',
    createdAt: new Date().toISOString(),
    customer: {
      name: 'Mock 用户',
      phone: '13900000000',
      address: 'Mock 地址',
    },
    items: [
      {
        id: 'mock-item',
        skuNameSnapshot: '清濯茶皂素复配洗衣液',
        unitPriceCents: 3990,
        quantity: 1,
        subtotalCents: 3990,
      },
    ],
    statusLogs: [
      {
        id: 'mock-log',
        fromStatus: null,
        toStatus: 'PENDING_PAYMENT',
        note: 'Mock 订单已创建',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function loginAdmin(email: string, password: string) {
  return apiRequest<{ token: string; admin: AdminUser }>('/api/admin/login', {
    method: 'POST',
    body: { email, password },
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin session because admin auth API failed.', error);
    return mockAdminSession(email);
  });
}

export function fetchAdminOrders(token: string, status?: OrderStatus | 'ALL') {
  const params = new URLSearchParams();
  if (status && status !== 'ALL') params.set('status', status);
  const query = params.toString();
  return apiRequest<{
    total: number;
    page: number;
    pageSize: number;
    orders: AdminOrderSummary[];
  }>(`/api/admin/orders${query ? `?${query}` : ''}`, { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin orders because API failed.', error);
    return {
      total: 1,
      page: 1,
      pageSize: 20,
      orders: [mockOrderSummary],
    };
  });
}

export function fetchAdminOrderDetail(token: string, id: string) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}`, { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin order detail because API failed.', error);
    return { order: mockOrderDetail(id) };
  });
}

export function updateAdminOrderStatus(token: string, id: string, status: OrderStatus, note?: string) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status, note },
  });
}

export function updateAdminOrderShipping(
  token: string,
  id: string,
  shippingCarrier: string,
  trackingNo: string,
) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}/shipping`, {
    method: 'PATCH',
    token,
    body: { shippingCarrier, trackingNo },
  });
}

export function fetchAdminUsers(token: string) {
  return apiRequest<{ admins: AdminUser[] }>('/api/admin/users', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin users because API failed.', error);
    return {
      admins: [mockAdminSession('admin@qingzhuo.local').admin],
    };
  });
}

export function createAdminUser(
  token: string,
  input: { email: string; displayName: string; password: string; role: 'OWNER' | 'STAFF' },
) {
  return apiRequest<{ admin: AdminUser }>('/api/admin/users', {
    method: 'POST',
    token,
    body: input,
  });
}

export function updateAdminUser(
  token: string,
  id: string,
  input: { displayName?: string; role?: 'OWNER' | 'STAFF'; status?: 'ACTIVE' | 'DISABLED' },
) {
  return apiRequest<{ admin: AdminUser }>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function resetAdminUserPassword(token: string, id: string, password: string) {
  return apiRequest<{ admin: AdminUser }>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    token,
    body: { password },
  });
}

export function fetchAuditLogs(token: string) {
  return apiRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock audit logs because API failed.', error);
    return { logs: [] };
  });
}

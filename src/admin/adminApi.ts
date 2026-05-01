import { apiRequest } from '../api/client';
import type { OrderStatus } from '../types/ecommerce';
import type { AdminOrderDetail, AdminOrderSummary, AdminUser, AuditLog } from './adminTypes';

export function loginAdmin(email: string, password: string) {
  return apiRequest<{ token: string; admin: AdminUser }>('/api/admin/login', {
    method: 'POST',
    body: { email, password },
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
  }>(`/api/admin/orders${query ? `?${query}` : ''}`, { token });
}

export function fetchAdminOrderDetail(token: string, id: string) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}`, { token });
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
  return apiRequest<{ admins: AdminUser[] }>('/api/admin/users', { token });
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
  return apiRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs', { token });
}

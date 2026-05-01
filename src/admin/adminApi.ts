import { apiRequest } from '../api/client';
import type { OrderStatus } from '../types/ecommerce';
import type { AdminOrderDetail, AdminOrderSummary, AdminUser } from './adminTypes';

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

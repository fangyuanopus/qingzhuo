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

function createInitialMockOrder(id: string): AdminOrderDetail {
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

let mockOrderState: AdminOrderDetail = createInitialMockOrder('mock-order');
let mockAdmins: AdminUser[] = [mockAdminSession('admin@qingzhuo.local').admin];
let mockAuditLogs: AuditLog[] = [];

function mockOrderSummaryFromState(order: AdminOrderDetail): AdminOrderSummary {
  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    totalAmountCents: order.totalAmountCents,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
  };
}

function appendMockStatusLog(fromStatus: OrderStatus | null, toStatus: OrderStatus, note?: string) {
  mockOrderState = {
    ...mockOrderState,
    status: toStatus,
    statusLogs: [
      ...mockOrderState.statusLogs,
      {
        id: `mock-log-${Date.now()}`,
        fromStatus,
        toStatus,
        note: note ?? null,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

function appendMockAudit(action: string, targetType: string, targetId?: string | null) {
  mockAuditLogs = [
    {
      id: `mock-audit-${Date.now()}`,
      action,
      targetType,
      targetId: targetId ?? null,
      metadata: null,
      createdAt: new Date().toISOString(),
      actorAdmin: mockAdmins[0] ? {
        id: mockAdmins[0].id,
        email: mockAdmins[0].email,
        displayName: mockAdmins[0].displayName,
      } : null,
    },
    ...mockAuditLogs,
  ];
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
    const visible = !status || status === 'ALL' || mockOrderState.status === status;
    return {
      total: visible ? 1 : 0,
      page: 1,
      pageSize: 20,
      orders: visible ? [mockOrderSummaryFromState(mockOrderState)] : [],
    };
  });
}

export function fetchAdminOrderDetail(token: string, id: string) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}`, { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin order detail because API failed.', error);
    return { order: { ...mockOrderState, id } };
  });
}

export function updateAdminOrderStatus(token: string, id: string, status: OrderStatus, note?: string) {
  return apiRequest<{ order: AdminOrderDetail }>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body: { status, note },
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin order status update because API failed.', error);
    appendMockStatusLog(mockOrderState.status, status, note);
    appendMockAudit('ORDER_STATUS_UPDATED', 'Order', id);
    return { order: { ...mockOrderState, id } };
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
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin shipping update because API failed.', error);
    mockOrderState = {
      ...mockOrderState,
      shippingCarrier,
      trackingNo,
    };
    appendMockStatusLog(mockOrderState.status, 'SHIPPING', `Mock 发货：${shippingCarrier} ${trackingNo}`);
    appendMockAudit('ORDER_SHIPPING_UPDATED', 'Order', id);
    return { order: { ...mockOrderState, id } };
  });
}

export function fetchAdminUsers(token: string) {
  return apiRequest<{ admins: AdminUser[] }>('/api/admin/users', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin users because API failed.', error);
    return { admins: mockAdmins };
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
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin user creation because API failed.', error);
    const admin: AdminUser = {
      id: `mock-admin-${Date.now()}`,
      email: input.email,
      displayName: input.displayName,
      role: input.role,
      status: 'ACTIVE',
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAdmins = [...mockAdmins, admin];
    appendMockAudit('ADMIN_USER_CREATED', 'AdminUser', admin.id);
    return { admin };
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
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin user update because API failed.', error);
    mockAdmins = mockAdmins.map((admin) => (
      admin.id === id ? { ...admin, ...input, updatedAt: new Date().toISOString() } : admin
    ));
    appendMockAudit('ADMIN_USER_UPDATED', 'AdminUser', id);
    return { admin: mockAdmins.find((admin) => admin.id === id) ?? mockAdmins[0] };
  });
}

export function resetAdminUserPassword(token: string, id: string, password: string) {
  return apiRequest<{ admin: AdminUser }>(`/api/admin/users/${id}/reset-password`, {
    method: 'POST',
    token,
    body: { password },
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock admin password reset because API failed.', error);
    appendMockAudit('ADMIN_PASSWORD_RESET', 'AdminUser', id);
    return { admin: mockAdmins.find((admin) => admin.id === id) ?? mockAdmins[0] };
  });
}

export function fetchAuditLogs(token: string) {
  return apiRequest<{ logs: AuditLog[] }>('/api/admin/audit-logs', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock audit logs because API failed.', error);
    return { logs: mockAuditLogs };
  });
}

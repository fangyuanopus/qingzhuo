import { apiRequest } from './client';
import type { CustomerSession } from '../types/ecommerce';

const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false';

function mockCustomerSession(input: { name?: string; phone: string }): CustomerSession {
  return {
    token: 'mock-customer-token',
    user: {
      id: 'mock-customer-user',
      name: input.name?.trim() || '测试用户',
      phone: input.phone || '13900000000',
    },
  };
}

async function withCustomerMock(
  request: () => Promise<CustomerSession>,
  input: { name?: string; phone: string },
) {
  try {
    return await request();
  } catch (error) {
    if (!mockEnabled) throw error;
    console.warn('Using mock customer session because auth API failed.', error);
    return mockCustomerSession(input);
  }
}

export function registerCustomer(input: { name: string; phone: string; password: string }) {
  return withCustomerMock(
    () => apiRequest<CustomerSession>('/api/auth/register', {
      method: 'POST',
      body: input,
    }),
    input,
  );
}

export function loginCustomer(input: { phone: string; password: string }) {
  return withCustomerMock(
    () => apiRequest<CustomerSession>('/api/auth/login', {
      method: 'POST',
      body: input,
    }),
    input,
  );
}

export function fetchCurrentCustomer(token: string) {
  return apiRequest<{ user: CustomerSession['user'] }>('/api/auth/me', { token });
}

export function updateCustomerProfile(token: string, input: { name: string }) {
  return apiRequest<{ user: CustomerSession['user'] }>('/api/auth/me', {
    method: 'PATCH',
    token,
    body: input,
  });
}

export function requestCustomerPasswordReset(input: { phone: string }) {
  return apiRequest<{ ok: true; resetToken?: string }>('/api/auth/password-reset/request', {
    method: 'POST',
    body: input,
  });
}

export function confirmCustomerPasswordReset(input: { phone: string; token: string; password: string }) {
  return apiRequest<{ ok: true }>('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: input,
  });
}

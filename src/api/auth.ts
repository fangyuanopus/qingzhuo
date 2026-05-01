import { apiRequest } from './client';
import type { CustomerSession } from '../types/ecommerce';

export function registerCustomer(input: { name: string; phone: string; password: string }) {
  return apiRequest<CustomerSession>('/api/auth/register', {
    method: 'POST',
    body: input,
  });
}

export function loginCustomer(input: { phone: string; password: string }) {
  return apiRequest<CustomerSession>('/api/auth/login', {
    method: 'POST',
    body: input,
  });
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

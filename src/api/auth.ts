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

import { apiRequest } from './client';
import type { CustomerAddress } from '../types/ecommerce';

export function fetchCustomerAddresses(token: string) {
  return apiRequest<{ addresses: CustomerAddress[] }>('/api/me/addresses', { token });
}

export function createCustomerAddress(
  token: string,
  input: { receiverName: string; phone: string; address: string; isDefault?: boolean },
) {
  return apiRequest<{ address: CustomerAddress }>('/api/me/addresses', {
    method: 'POST',
    token,
    body: input,
  });
}

export function deleteCustomerAddress(token: string, id: string) {
  return apiRequest<void>(`/api/me/addresses/${id}`, {
    method: 'DELETE',
    token,
  });
}

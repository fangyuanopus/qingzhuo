import { apiRequest } from './client';
import type { CustomerAddress } from '../types/ecommerce';

const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false';

export function fetchCustomerAddresses(token: string) {
  return apiRequest<{ addresses: CustomerAddress[] }>('/api/me/addresses', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock customer addresses because API failed.', error);
    return { addresses: [] };
  });
}

export function createCustomerAddress(
  token: string,
  input: { receiverName: string; phone: string; address: string; isDefault?: boolean },
) {
  return apiRequest<{ address: CustomerAddress }>('/api/me/addresses', {
    method: 'POST',
    token,
    body: input,
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock address creation because API failed.', error);
    return {
      address: {
        id: `mock-address-${Date.now()}`,
        receiverName: input.receiverName,
        phone: input.phone,
        address: input.address,
        isDefault: Boolean(input.isDefault),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

export function deleteCustomerAddress(token: string, id: string) {
  return apiRequest<void>(`/api/me/addresses/${id}`, {
    method: 'DELETE',
    token,
  }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock address deletion because API failed.', error);
  });
}

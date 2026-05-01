import { apiRequest } from './client';
import type { CustomerOrder } from '../types/ecommerce';

const mockEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false';

export function fetchMyOrders(token: string) {
  return apiRequest<{ orders: CustomerOrder[] }>('/api/me/orders', { token }).catch((error) => {
    if (!mockEnabled) throw error;
    console.warn('Using mock customer orders because API failed.', error);
    return { orders: [] };
  });
}

import { apiRequest } from './client';
import type { CustomerOrder } from '../types/ecommerce';

export function fetchMyOrders(token: string) {
  return apiRequest<{ orders: CustomerOrder[] }>('/api/me/orders', { token });
}

import { apiRequest } from './client';
import type { CreateOrderRequest, CreateOrderResponse } from '../types/ecommerce';

export function createOrder(input: CreateOrderRequest) {
  return apiRequest<CreateOrderResponse>('/api/orders', {
    method: 'POST',
    body: input,
  });
}

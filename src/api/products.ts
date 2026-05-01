import { apiRequest } from './client';
import type { Product } from '../types/ecommerce';

export function fetchProducts() {
  return apiRequest<{ products: Product[] }>('/api/products');
}

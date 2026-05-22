import { apiRequest } from './apiClient';

export function createOrder(payload, token) {
  return apiRequest('/api/orders', {
    method: 'POST',
    body: payload,
    token
  });
}

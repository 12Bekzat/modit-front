import { apiRequest } from './apiClient';

export function fetchCart(token) {
  return apiRequest('/api/cart', { token });
}

export function addCartItem(token, payload) {
  return apiRequest('/api/cart/items', {
    method: 'POST',
    body: payload,
    token
  });
}

export function updateCartItem(token, productCode, payload) {
  return apiRequest(`/api/cart/items/${encodeURIComponent(productCode)}`, {
    method: 'PUT',
    body: payload,
    token
  });
}

export function removeCartItem(token, productCode) {
  return apiRequest(`/api/cart/items/${encodeURIComponent(productCode)}`, {
    method: 'DELETE',
    token
  });
}

export function clearCart(token) {
  return apiRequest('/api/cart', {
    method: 'DELETE',
    token
  });
}

import { apiRequest } from './apiClient';

export function loginUser(credentials) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: credentials
  });
}

export function registerUser(payload) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: payload
  });
}

export function getCurrentUser(token) {
  return apiRequest('/api/auth/me', { token });
}

import { apiRequest } from './apiClient';

export function fetchProducts(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '' || value === 'all') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null && item !== '') {
          searchParams.append(key, item);
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return apiRequest(`/api/products${query ? `?${query}` : ''}`);
}

export function fetchProductFilters() {
  return apiRequest('/api/products/filters');
}

export function fetchCategoryNavigation() {
  return apiRequest('/api/categories/navigation');
}

export function fetchProductById(id) {
  return apiRequest(`/api/products/${id}`);
}

export function createPreorder(payload, token) {
  return apiRequest('/api/preorders', {
    method: 'POST',
    body: payload,
    token
  });
}

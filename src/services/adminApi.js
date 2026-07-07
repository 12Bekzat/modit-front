import { apiRequest } from './apiClient';

export function fetchAdminProducts(token) {
  return apiRequest('/api/admin/products', { token });
}

export function fetchAdminCategories(token) {
  return apiRequest('/api/admin/categories', { token });
}

export function fetchAdminBrands(token) {
  return apiRequest('/api/admin/brands', { token });
}

export function createAdminCategory(token, payload) {
  return apiRequest('/api/admin/categories', {
    method: 'POST',
    body: payload,
    token
  });
}

export function createAdminBrand(token, payload) {
  return apiRequest('/api/admin/brands', {
    method: 'POST',
    body: payload,
    token
  });
}

export function updateAdminCategory(token, id, payload) {
  return apiRequest(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });
}

export function updateAdminBrand(token, id, payload) {
  return apiRequest(`/api/admin/brands/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });
}

export function deleteAdminCategory(token, id) {
  return apiRequest(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    token
  });
}

export function deleteAdminBrand(token, id) {
  return apiRequest(`/api/admin/brands/${id}`, {
    method: 'DELETE',
    token
  });
}

export function createAdminProduct(token, payload) {
  return apiRequest('/api/admin/products', {
    method: 'POST',
    body: payload,
    token
  });
}

export function updateAdminProduct(token, id, payload) {
  return apiRequest(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });
}

export function deleteAdminProduct(token, id) {
  return apiRequest(`/api/admin/products/${id}`, {
    method: 'DELETE',
    token
  });
}

export function fetchAdminUsers(token) {
  return apiRequest('/api/admin/users', { token });
}

export function createAdminUser(token, payload) {
  return apiRequest('/api/admin/users', {
    method: 'POST',
    body: payload,
    token
  });
}

export function updateAdminUser(token, id, payload) {
  return apiRequest(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: payload,
    token
  });
}

export function deleteAdminUser(token, id) {
  return apiRequest(`/api/admin/users/${id}`, {
    method: 'DELETE',
    token
  });
}

export function fetchCatalogImportSettings(token) {
  return apiRequest('/api/admin/catalog-import/settings', { token });
}

export function updateCatalogImportSettings(token, payload) {
  return apiRequest('/api/admin/catalog-import/settings', {
    method: 'PUT',
    body: payload,
    token
  });
}

export function syncCatalogs(token) {
  return apiRequest('/api/admin/catalog-import/sync', {
    method: 'POST',
    token
  });
}

export function uploadCatalogImportFile(token, file) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest('/api/admin/catalog-import/file', {
    method: 'POST',
    body: formData,
    token
  });
}

export function previewCatalogImportFile(token, file) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest('/api/admin/catalog-import/file/preview', {
    method: 'POST',
    body: formData,
    token
  });
}

export function uploadCatalogImportFileWithMapping(token, file, mapping) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mapping', JSON.stringify(mapping || {}));

  return apiRequest('/api/admin/catalog-import/file', {
    method: 'POST',
    body: formData,
    token
  });
}

export function fetchAdminPreorders(token) {
  return apiRequest('/api/admin/preorders', { token });
}

export function updatePreorderStatus(token, id, status) {
  return apiRequest(`/api/admin/preorders/${id}/status`, {
    method: 'PUT',
    body: { status },
    token
  });
}

export function fetchAdminOrders(token) {
  return apiRequest('/api/admin/orders', { token });
}

export function updateOrderStatus(token, id, status) {
  return apiRequest(`/api/admin/orders/${id}/status`, {
    method: 'PUT',
    body: { status },
    token
  });
}

export function fetchMarkupSettings(token) {
  return apiRequest('/api/admin/markups/settings', { token });
}

export function updateMarkupSettings(token, payload) {
  return apiRequest('/api/admin/markups/settings', {
    method: 'PUT',
    body: payload,
    token
  });
}

export function fetchProductMarkupRules(token) {
  return apiRequest('/api/admin/markups/products', { token });
}

export function upsertProductMarkupRule(token, payload) {
  return apiRequest('/api/admin/markups/products', {
    method: 'POST',
    body: payload,
    token
  });
}

export function deleteProductMarkupRule(token, id) {
  return apiRequest(`/api/admin/markups/products/${id}`, {
    method: 'DELETE',
    token
  });
}

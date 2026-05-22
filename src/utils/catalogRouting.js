export function buildCatalogPath(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '' || value === 'all') {
      return;
    }

    if (key === 'inStock' && value === true) {
      return;
    }

    if (key === 'sort' && value === 'popular') {
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
  return `/products${query ? `?${query}` : ''}`;
}

export function buildProductPath(productOrId) {
  const id = typeof productOrId === 'object' ? productOrId?.id : productOrId;

  if (id == null || id === '') {
    return '/products';
  }

  return `/products/${encodeURIComponent(String(id))}`;
}

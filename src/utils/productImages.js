export function getProductImageUrls(product) {
  const values = [];
  const primaryImage = typeof product?.imageUrl === 'string' ? product.imageUrl.trim() : '';

  if (primaryImage) {
    values.push(primaryImage);
  }

  if (Array.isArray(product?.imageUrls)) {
    product.imageUrls.forEach((value) => {
      const normalized = typeof value === 'string' ? value.trim() : '';
      if (normalized && !values.includes(normalized)) {
        values.push(normalized);
      }
    });
  }

  return values;
}

export function getPrimaryProductImage(product) {
  return getProductImageUrls(product)[0] || '';
}

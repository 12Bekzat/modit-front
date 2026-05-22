import { getPrimaryProductImage } from './productImages';

export function toProductSnapshot(product) {
  return {
    productId: product.id || product.productId || undefined,
    productCode: product.productCode,
    externalCode: product.externalCode || product.productExternalCode || undefined,
    name: product.name,
    category: product.category || undefined,
    brand: product.brand,
    price: Number(product.price),
    oldPrice: Number(product.oldPrice || product.price),
    availableQuantity: Number(product.availableQuantity || 0),
    currencyCode: product.currencyCode || 'KZT',
    imageUrl: getPrimaryProductImage(product) || undefined,
    productUrl: product.productUrl || undefined,
    delivery: product.delivery || undefined,
    tag: product.tag || undefined,
    source: product.source || undefined
  };
}

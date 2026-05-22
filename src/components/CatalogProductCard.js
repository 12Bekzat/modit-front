import { Link } from 'react-router-dom';
import { buildProductPath } from '../utils/catalogRouting';

function CatalogProductCard({ product, formatPrice, deliveryLabel, onAddToCart }) {
  const currency = product.currencyCode || 'KZT';

  return (
    <div className="catalog-card">
      <div className="catalog-media">
        <span className="catalog-tag">{product.tag}</span>
        <Link to={buildProductPath(product)} className="catalog-image-link" aria-label={`Открыть ${product.name}`}>
          {product.imageUrl ? (
            <img className="catalog-image" src={product.imageUrl} alt={product.name} loading="lazy" />
          ) : (
            <div className="catalog-image" />
          )}
        </Link>
      </div>
      <div className="catalog-info">
        <h3 className="catalog-name">
          <Link to={buildProductPath(product)} className="catalog-name-link">
            {product.name}
          </Link>
        </h3>
        <p className="price">
          {formatPrice(product.price)} {currency}
          {Number(product.oldPrice) > Number(product.price) ? (
            <span>
              {formatPrice(product.oldPrice)} {currency}
            </span>
          ) : null}
        </p>
        <div className="catalog-rating">
          <span>{Number(product.rating || 0).toFixed(1)}</span>
          <span>Рейтинг</span>
          <span className="stock in">В наличии: {product.availableQuantity}</span>
        </div>
        <div className="catalog-meta">
          <span>{product.brand}</span>
          <span>{deliveryLabel}</span>
        </div>
        <div className="catalog-meta">
          <span>{product.category}</span>
          <span>{product.productCode}</span>
        </div>
        <div className="catalog-actions">
          <button className="primary-button" type="button" onClick={() => onAddToCart(product)}>
            В корзину
          </button>
          <Link className="ghost-button" to={buildProductPath(product)}>
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CatalogProductCard;

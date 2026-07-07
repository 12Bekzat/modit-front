import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { buildProductPath } from '../utils/catalogRouting';

function CatalogProductCard({ product, formatPrice, deliveryLabel, onAddToCart }) {
  const currency = product.currencyCode || 'KZT';
  const { items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.productCode === product.productCode);
  const cartQuantity = Number(cartItem?.quantity || 0);
  const maxQuantity = Math.max(Number(product.availableQuantity || 0), 0);
  const isInCart = cartQuantity > 0;

  return (
    <div className="catalog-card">
      <div className="catalog-media">
        {product.tag ? <span className="catalog-tag">{product.tag}</span> : null}
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
        </div>
        <div className="catalog-actions">
          {isInCart ? (
            <div className="catalog-cart-control" aria-label="Количество в корзине">
              <button
                className="ghost-button catalog-qty-button"
                type="button"
                onClick={() => updateQuantity(product.productCode, cartQuantity - 1)}
              >
                -
              </button>
              <span>{cartQuantity}</span>
              <button
                className="ghost-button catalog-qty-button"
                type="button"
                onClick={() => updateQuantity(product.productCode, cartQuantity + 1)}
                disabled={cartQuantity >= maxQuantity}
              >
                +
              </button>
            </div>
          ) : (
            <button className="primary-button" type="button" onClick={() => onAddToCart(product)}>
              В корзину
            </button>
          )}
          <Link className="ghost-button" to={buildProductPath(product)}>
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CatalogProductCard;

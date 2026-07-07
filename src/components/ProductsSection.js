import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { buildCatalogPath, buildProductPath } from '../utils/catalogRouting';

function formatPrice(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function ProductInlineCart({ product, onAddToCart }) {
  const { items, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.productCode === product.productCode);
  const cartQuantity = Number(cartItem?.quantity || 0);
  const maxQuantity = Math.max(Number(product.availableQuantity || 0), 0);

  if (cartQuantity > 0) {
    return (
      <div className="catalog-cart-control product-card-cart-control" aria-label="Количество в корзине">
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
    );
  }

  return (
    <button className="primary-button" type="button" onClick={() => onAddToCart(product)}>
      В корзину
    </button>
  );
}

function ProductsSection({ products, filterChips, onAddToCart }) {
  return (
    <section className="section">
      <div className="container section-head">
        <div>
          <h2>Горячие предложения</h2>
          <p>Популярные товары из текущего каталога.</p>
        </div>
        <div className="filters">
          {filterChips.map((item) => (
            <Link key={item.label} to={buildCatalogPath(item.params)} className="chip-button muted">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="container grid product-grid">
        {products.map((item) => (
          <div key={item.productCode || item.externalCode || item.name} className="product-card">
            <div className="product-media">
              {item.tag ? <span className="product-tag">{item.tag}</span> : null}
              <Link to={buildProductPath(item)} className="product-art-link" aria-label={`Открыть ${item.name}`}>
                {item.imageUrl ? (
                  <img className="product-art" src={item.imageUrl} alt={item.name} loading="lazy" />
                ) : (
                  <div className="product-art" />
                )}
              </Link>
            </div>
            <div className="product-info">
              <h3>
                <Link to={buildProductPath(item)} className="product-name-link">
                  {item.name}
                </Link>
              </h3>
              <p className="price">
                {formatPrice(item.price)} {item.currencyCode || 'KZT'}
              </p>
              <div className="product-meta">
                <span>{Number(item.rating || 0).toFixed(1)}</span>
                <span>{item.delivery}</span>
              </div>
              <div className="product-actions">
                <ProductInlineCart product={item} onAddToCart={onAddToCart} />
                <Link className="ghost-button" to={buildProductPath(item)}>
                  Подробнее
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductsSection;

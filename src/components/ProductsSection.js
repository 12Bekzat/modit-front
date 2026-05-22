import { Link } from 'react-router-dom';
import { buildCatalogPath, buildProductPath } from '../utils/catalogRouting';

function formatPrice(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function ProductsSection({ products, filterChips, onAddToCart }) {
  return (
    <section className="section">
      <div className="container section-head">
        <div>
          <h2>Горячие предложения</h2>
          <p>Лучшие цены на популярные устройства из текущего каталога.</p>
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
              <span className="product-tag">{item.tag}</span>
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
                {Number(item.oldPrice) > Number(item.price) ? (
                  <span>
                    {formatPrice(item.oldPrice)} {item.currencyCode || 'KZT'}
                  </span>
                ) : null}
              </p>
              <div className="product-meta">
                <span>{Number(item.rating || 0).toFixed(1)}</span>
                <span>{item.delivery}</span>
              </div>
              <div className="product-actions">
                <button className="primary-button" type="button" onClick={() => onAddToCart(item)}>
                  В корзину
                </button>
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

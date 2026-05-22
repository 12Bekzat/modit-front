import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderApi';
import { createPreorder, fetchProductById, fetchProducts } from '../services/productApi';
import { buildCatalogPath, buildProductPath } from '../utils/catalogRouting';
import { getPrimaryProductImage, getProductImageUrls } from '../utils/productImages';
import { toProductSnapshot } from '../utils/productSnapshot';

const deliveryLabels = {
  today: 'Самовывоз сегодня',
  tomorrow: 'Доставка завтра',
  '2-3 days': 'Доставка 2-3 дня',
  '3-5 days': 'Доставка 3-5 дней',
  preorder: 'Поставка под заказ',
  сегодня: 'Самовывоз сегодня',
  завтра: 'Доставка завтра',
  '2-3 дня': 'Доставка 2-3 дня',
  '3-5 дней': 'Доставка 3-5 дней',
  предзаказ: 'Поставка под заказ'
};

function formatPrice(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

function splitFullName(fullName) {
  if (!fullName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ')
  };
}

function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user, token, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isPreorderOpen, setIsPreorderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [quickOrderForm, setQuickOrderForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    comment: ''
  });
  const [preorderForm, setPreorderForm] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    comment: ''
  });

  useEffect(() => {
    let isCancelled = false;

    const loadProduct = async () => {
      setIsLoading(true);
      setError('');
      setMessage('');

      try {
        const response = await fetchProductById(id);
        if (!isCancelled) {
          setProduct(response);
          setQuantity(1);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setProduct(null);
          setError(requestError.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product?.category) {
      setRelatedProducts([]);
      return undefined;
    }

    let isCancelled = false;

    const loadRelated = async () => {
      try {
        const response = await fetchProducts({
          categories: [product.category],
          inStock: false,
          size: 4
        });

        if (!isCancelled) {
          setRelatedProducts((response.items || []).filter((item) => item.id !== product.id).slice(0, 3));
        }
      } catch {
        if (!isCancelled) {
          setRelatedProducts([]);
        }
      }
    };

    loadRelated();
    return () => {
      isCancelled = true;
    };
  }, [product]);

  useEffect(() => {
    setActiveImage(getPrimaryProductImage(product));
  }, [product]);

  const currencyCode = product?.currencyCode || 'KZT';
  const productImages = useMemo(() => getProductImageUrls(product), [product]);
  const isAvailable = Boolean(product?.inStock && Number(product?.availableQuantity) > 0);
  const maxQuantity = Math.max(Number(product?.availableQuantity || 1), 1);
  const deliveryLabel = product ? (deliveryLabels[product.delivery] || 'Срок уточняется') : '';

  const detailRows = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      { label: 'ID', value: product.id },
      { label: 'Код товара', value: product.productCode || '—' },
      { label: 'Внешний код', value: product.externalCode || '—' },
      { label: 'Бренд', value: product.brand || '—' },
      { label: 'Категория', value: product.category || '—' },
      { label: 'Источник', value: product.source || '—' },
      { label: 'Валюта', value: currencyCode },
      { label: 'Рейтинг', value: Number(product.rating || 0).toFixed(1) },
      { label: 'Наличие', value: `${Number(product.availableQuantity || 0)} шт.` },
      { label: 'Доставка', value: deliveryLabel },
      { label: 'Создан', value: formatDate(product.createdAt) },
      { label: 'Обновлен', value: formatDate(product.updatedAt) },
      { label: 'Синхронизирован', value: formatDate(product.lastSyncedAt) }
    ];
  }, [currencyCode, deliveryLabel, product]);

  const handleQuantityChange = (value) => {
    const normalized = Number.parseInt(String(value), 10);
    if (Number.isNaN(normalized)) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.min(Math.max(normalized, 1), maxQuantity));
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await addItem(product, quantity);
      setMessage(`Товар "${product.name}" добавлен в корзину.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openQuickOrder = () => {
    if (!product) {
      return;
    }

    const customer = splitFullName(user?.fullName);
    setQuickOrderForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: user?.phone || '',
      email: user?.email || '',
      comment: `${product.name} (${product.productCode}) x${quantity}`
    });
    setError('');
    setIsQuickOrderOpen(true);
  };

  const openPreorder = () => {
    setPreorderForm({
      contactName: user?.fullName || '',
      contactEmail: user?.email || '',
      contactPhone: user?.phone || '',
      comment: product ? `Интересует товар ${product.name} (${product.productCode})` : ''
    });
    setError('');
    setIsPreorderOpen(true);
  };

  const closeModals = () => {
    if (isSubmitting) {
      return;
    }

    setIsQuickOrderOpen(false);
    setIsPreorderOpen(false);
  };

  const handleQuickOrderSubmit = async (event) => {
    event.preventDefault();
    if (!product) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await createOrder(
        {
          firstName: quickOrderForm.firstName,
          lastName: quickOrderForm.lastName,
          phone: quickOrderForm.phone,
          email: quickOrderForm.email || undefined,
          comment: quickOrderForm.comment || undefined,
          items: [
            {
              product: toProductSnapshot(product),
              quantity
            }
          ]
        },
        isAuthenticated ? token : undefined
      );
      setIsQuickOrderOpen(false);
      setMessage('Заказ на товар создан. Менеджер свяжется с вами для подтверждения.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreorderSubmit = async (event) => {
    event.preventDefault();
    if (!product) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      await createPreorder(
        {
          product: toProductSnapshot(product),
          contactName: preorderForm.contactName,
          contactEmail: preorderForm.contactEmail,
          contactPhone: preorderForm.contactPhone,
          comment: preorderForm.comment || undefined
        },
        isAuthenticated ? token : undefined
      );
      setIsPreorderOpen(false);
      setMessage('Заявка на предзаказ отправлена. Мы свяжемся с вами после проверки поставки.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="product-detail-page">
        <div className="container">
          <div className="catalog-empty">
            <h3>Загружаем страницу товара</h3>
            <p className="muted-text">Получаем подробные данные о товаре и актуальное наличие.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail-page">
        <div className="container">
          {error ? <p className="form-message is-error">{error}</p> : null}
          <div className="catalog-empty">
            <h3>Товар не найден</h3>
            <p className="muted-text">Возможно, товар был удален или ссылка устарела.</p>
            <Link to="/products" className="ghost-button">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="container">
        <nav className="product-breadcrumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/products">Каталог</Link>
          <span>/</span>
          <Link to={buildCatalogPath({ categories: [product.category] })}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {message ? <p className="form-message is-success">{message}</p> : null}
        {error ? <p className="form-message is-error">{error}</p> : null}

        <div className="product-detail-hero">
          <div className="product-detail-gallery">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="product-detail-image" />
            ) : (
              <div className="product-detail-image product-detail-image-empty" />
            )}

            {productImages.length > 1 ? (
              <div className="product-detail-thumbs">
                {productImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    type="button"
                    className={`product-detail-thumb ${imageUrl === activeImage ? 'is-active' : ''}`}
                    onClick={() => setActiveImage(imageUrl)}
                    aria-label={`РџРѕРєР°Р·Р°С‚СЊ С„РѕС‚Рѕ ${index + 1}`}
                  >
                    <img src={imageUrl} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-detail-main">
            <div className="product-detail-topline">
              <span className="product-detail-tag">{product.tag || 'Каталог'}</span>
              <span className={`product-detail-stock ${isAvailable ? 'is-available' : 'is-missing'}`}>
                {isAvailable ? `В наличии: ${product.availableQuantity} шт.` : 'Нет в наличии'}
              </span>
            </div>

            <h1>{product.name}</h1>

            <div className="product-detail-meta">
              <span>Бренд: {product.brand}</span>
              <span>Код: {product.productCode}</span>
              <span>Рейтинг: {Number(product.rating || 0).toFixed(1)}</span>
            </div>

            <p className="product-detail-price">
              {formatPrice(product.price)} {currencyCode}
              {Number(product.oldPrice) > Number(product.price) ? (
                <span>
                  {formatPrice(product.oldPrice)} {currencyCode}
                </span>
              ) : null}
            </p>

            <p className="product-detail-delivery">{deliveryLabel}</p>

            <p className="product-detail-description">
              {product.description || 'Описание для этого товара пока не заполнено.'}
            </p>

            <div className="product-detail-actions">
              {isAvailable ? (
                <>
                  <div className="product-quantity-box">
                    <button type="button" className="ghost-button product-qty-button" onClick={() => handleQuantityChange(quantity - 1)}>
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={quantity}
                      onChange={(event) => handleQuantityChange(event.target.value)}
                    />
                    <button type="button" className="ghost-button product-qty-button" onClick={() => handleQuantityChange(quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button type="button" className="primary-button" onClick={handleAddToCart}>
                    В корзину
                  </button>
                  <button type="button" className="accent-button" onClick={openQuickOrder}>
                    Купить в 1 клик
                  </button>
                </>
              ) : (
                <button type="button" className="accent-button" onClick={openPreorder}>
                  Оставить заявку
                </button>
              )}

              <Link to="/cart" className="ghost-button">
                Перейти в корзину
              </Link>
              {product.productUrl ? (
                <a className="ghost-button" href={product.productUrl} target="_blank" rel="noreferrer">
                  Открыть источник
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="product-detail-sections">
          <article className="product-detail-card">
            <div className="product-detail-card-head">
              <h2>Описание</h2>
            </div>
            <p>{product.description || 'Описание отсутствует.'}</p>
          </article>

          <article className="product-detail-card">
            <div className="product-detail-card-head">
              <h2>Полные данные</h2>
            </div>
            <div className="product-specs">
              {detailRows.map((row) => (
                <div key={row.label} className="product-spec-row">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="product-related">
            <div className="product-detail-card-head">
              <h2>Похожие товары</h2>
              <Link to={buildCatalogPath({ categories: [product.category] })} className="ghost-button">
                Вся категория
              </Link>
            </div>
            <div className="product-related-grid">
              {relatedProducts.map((item) => (
                <article key={item.id} className="product-related-card">
                  <Link to={buildProductPath(item)} className="product-related-image-link">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="product-related-image" loading="lazy" />
                    ) : (
                      <div className="product-related-image product-detail-image-empty" />
                    )}
                  </Link>
                  <div className="product-related-body">
                    <Link to={buildProductPath(item)} className="product-related-name">
                      {item.name}
                    </Link>
                    <p className="muted-text">{item.brand}</p>
                    <p className="price">{formatPrice(item.price)} {item.currencyCode || 'KZT'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {isQuickOrderOpen ? (
        <div className="quick-order-backdrop" onClick={closeModals}>
          <div className="quick-order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quick-order-head">
              <div>
                <h2>Купить в 1 клик</h2>
                <p className="muted-text">{product.name} • {quantity} шт.</p>
              </div>
              <button type="button" className="quick-order-close" onClick={closeModals} aria-label="Закрыть">
                ×
              </button>
            </div>

            <form className="quick-order-form" onSubmit={handleQuickOrderSubmit}>
              <label className="auth-field">
                Имя *
                <input
                  type="text"
                  value={quickOrderForm.firstName}
                  onChange={(event) => setQuickOrderForm((current) => ({ ...current, firstName: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                Фамилия
                <input
                  type="text"
                  value={quickOrderForm.lastName}
                  onChange={(event) => setQuickOrderForm((current) => ({ ...current, lastName: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                Телефон *
                <input
                  type="tel"
                  value={quickOrderForm.phone}
                  onChange={(event) => setQuickOrderForm((current) => ({ ...current, phone: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                E-mail
                <input
                  type="email"
                  value={quickOrderForm.email}
                  onChange={(event) => setQuickOrderForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                Комментарий
                <textarea
                  className="admin-textarea quick-order-textarea"
                  value={quickOrderForm.comment}
                  onChange={(event) => setQuickOrderForm((current) => ({ ...current, comment: event.target.value }))}
                />
              </label>
              <button className="quick-order-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправляем...' : 'Оформить заказ'}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isPreorderOpen ? (
        <div className="preorder-backdrop" onClick={closeModals}>
          <div className="preorder-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quick-order-head product-modal-head">
              <div>
                <h2>Предзаказ товара</h2>
                <p className="muted-text preorder-product">{product.name}</p>
              </div>
              <button type="button" className="quick-order-close" onClick={closeModals} aria-label="Закрыть">
                ×
              </button>
            </div>
            <form className="quick-order-form" onSubmit={handlePreorderSubmit}>
              <label className="auth-field">
                Контактное лицо *
                <input
                  type="text"
                  value={preorderForm.contactName}
                  onChange={(event) => setPreorderForm((current) => ({ ...current, contactName: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                E-mail *
                <input
                  type="email"
                  value={preorderForm.contactEmail}
                  onChange={(event) => setPreorderForm((current) => ({ ...current, contactEmail: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                Телефон *
                <input
                  type="tel"
                  value={preorderForm.contactPhone}
                  onChange={(event) => setPreorderForm((current) => ({ ...current, contactPhone: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                Комментарий
                <textarea
                  className="admin-textarea quick-order-textarea"
                  value={preorderForm.comment}
                  onChange={(event) => setPreorderForm((current) => ({ ...current, comment: event.target.value }))}
                />
              </label>
              <button className="quick-order-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProductDetailPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderApi';

const deliveryOptions = [
  { id: 'pickup', title: 'Самовывоз сегодня', text: 'Бесплатно' },
  { id: 'tomorrow', title: 'Доставка завтра', text: '2 990 KZT' },
  { id: 'express', title: 'Экспресс 2 часа', text: '4 990 KZT' }
];

function formatPrice(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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

function CartPage() {
  const { isAuthenticated, token, user } = useAuth();
  const { items, subtotal, totalQuantity, updateQuantity, removeItem, clearCart, isLoading } = useCart();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [orderForm, setOrderForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    comment: ''
  });

  const handleUpdateQuantity = async (productCode, quantity) => {
    setError('');
    setMessage('');

    try {
      await updateQuantity(productCode, quantity);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleRemoveItem = async (productCode) => {
    setError('');
    setMessage('');

    try {
      await removeItem(productCode);
      setMessage('Товар удален из корзины.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleClearCart = async () => {
    setError('');
    setMessage('');

    try {
      await clearCart();
      setMessage('Корзина очищена.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openOrderModal = () => {
    const customer = splitFullName(user?.fullName);
    const itemLines = items.map((item) => `${item.name} [x${item.quantity}]`).join(' | ');
    setOrderForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: user?.phone || '',
      email: user?.email || '',
      comment: itemLines
    });
    setError('');
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    if (isSubmittingOrder) {
      return;
    }
    setIsOrderModalOpen(false);
  };

  const handlePromoApply = () => {
    setError('');

    if (!promoCode.trim()) {
      setMessage('Введите промокод перед применением.');
      return;
    }

    setMessage(`Промокод "${promoCode.trim()}" принят и будет проверен менеджером при подтверждении заказа.`);
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmittingOrder(true);

    try {
      await createOrder(
        {
          firstName: orderForm.firstName,
          lastName: orderForm.lastName,
          phone: orderForm.phone,
          email: orderForm.email || undefined,
          comment: orderForm.comment,
          items: items.map((item) => ({
            product: {
              productCode: item.productCode,
              externalCode: item.productExternalCode,
              name: item.name,
              category: item.category,
              brand: item.brand,
              price: item.price,
              oldPrice: item.oldPrice,
              availableQuantity: item.availableQuantity,
              currencyCode: item.currencyCode,
              imageUrl: item.imageUrl,
              productUrl: item.productUrl,
              delivery: item.delivery,
              tag: item.tag,
              source: item.source
            },
            quantity: item.quantity
          }))
        },
        isAuthenticated ? token : undefined
      );
      await clearCart();
      setIsOrderModalOpen(false);
      setMessage('Заказ в один клик создан. Менеджер свяжется с вами для уточнения деталей.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="container cart-head">
        <div>
          <p className="hero-tag">Корзина</p>
          <h1>Ваши покупки</h1>
          <p className="muted-text">
            Проверьте товары, измените количество и перейдите к быстрому оформлению. {isAuthenticated
              ? 'Корзина синхронизируется с вашим аккаунтом.'
              : 'Для гостей корзина сохраняется в этом браузере.'}
          </p>
        </div>
        <div className="cart-summary">
          <p className="muted-text">Итого</p>
          <p className="cart-total">{formatPrice(subtotal)} KZT</p>
          <p className="muted-text">{totalQuantity} шт.</p>
        </div>
      </div>

      {message ? <p className="container form-message is-success">{message}</p> : null}
      {error ? <p className="container form-message is-error">{error}</p> : null}

      <div className="container cart-layout">
        <div className="cart-list">
          {isLoading ? (
            <div className="catalog-empty">
              <h3>Загружаем корзину</h3>
              <p className="muted-text">Получаем актуальные товары и количество.</p>
            </div>
          ) : items.length === 0 ? (
            <div className="catalog-empty">
              <h3>Корзина пуста</h3>
              <p className="muted-text">Добавьте товары из каталога, чтобы продолжить покупку.</p>
              <Link to="/products" className="ghost-button">
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.productCode} className="cart-item">
                  <div
                    className="cart-image"
                    style={
                      item.imageUrl
                        ? {
                            backgroundImage: `url(${item.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }
                        : undefined
                    }
                  />
                  <div className="cart-info">
                    <h3>{item.name}</h3>
                    <p className="muted-text">
                      {item.productCode} • {item.brand}
                    </p>
                    <p className="price">
                      {formatPrice(item.price)} {item.currencyCode || 'KZT'}{' '}
                      {Number(item.oldPrice) > Number(item.price) ? (
                        <span>
                          {formatPrice(item.oldPrice)} {item.currencyCode || 'KZT'}
                        </span>
                      ) : null}
                    </p>
                    <div className="cart-controls">
                      <button
                        type="button"
                        className="ghost-button cart-qty-button"
                        onClick={() => handleUpdateQuantity(item.productCode, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button
                        type="button"
                        className="ghost-button cart-qty-button"
                        onClick={() => handleUpdateQuantity(item.productCode, item.quantity + 1)}
                        disabled={item.quantity >= item.availableQuantity}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-meta">
                      <span>Доступно: {item.availableQuantity} шт.</span>
                      <span>Сумма: {formatPrice(item.lineTotal)} {item.currencyCode || 'KZT'}</span>
                    </div>
                    <div className="cart-actions">
                      <button className="ghost-button" type="button" onClick={() => handleRemoveItem(item.productCode)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="cart-list-actions">
                <button className="ghost-button cart-clear-button" type="button" onClick={handleClearCart}>
                  Очистить корзину
                </button>
              </div>
            </>
          )}
        </div>

        <div className="cart-side">
          <div className="cart-box">
            <h3>Доставка и оплата</h3>
            <div className="cart-options">
              {deliveryOptions.map((option) => (
                <div key={option.id} className="cart-option">
                  <div>
                    <p>{option.title}</p>
                    <p className="muted-text">{option.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total-box">
              <div>
                <p className="muted-text">К оплате</p>
                <p className="cart-total">{formatPrice(subtotal)} KZT</p>
              </div>
              <button className="accent-button" type="button" disabled={items.length === 0} onClick={openOrderModal}>
                Купить в 1 клик
              </button>
            </div>
          </div>
          <div className="cart-box">
            <h3>Промокод</h3>
            <div className="cart-promo">
              <input
                type="text"
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
              />
              <button className="primary-button" type="button" onClick={handlePromoApply}>
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOrderModalOpen ? (
        <div className="quick-order-backdrop" onClick={closeOrderModal}>
          <div className="quick-order-modal" onClick={(event) => event.stopPropagation()}>
            <div className="quick-order-head">
              <div>
                <h2>Купить в 1 клик</h2>
                <p className="muted-text">Менеджер перезвонит вам для уточнения деталей заказа.</p>
              </div>
              <button type="button" className="quick-order-close" onClick={closeOrderModal} aria-label="Закрыть">
                ×
              </button>
            </div>

            <form className="quick-order-form" onSubmit={handleOrderSubmit}>
              <label className="auth-field">
                Имя *
                <input
                  type="text"
                  value={orderForm.firstName}
                  onChange={(event) => setOrderForm((current) => ({ ...current, firstName: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                Фамилия
                <input
                  type="text"
                  value={orderForm.lastName}
                  onChange={(event) => setOrderForm((current) => ({ ...current, lastName: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                Телефон *
                <input
                  type="tel"
                  value={orderForm.phone}
                  onChange={(event) => setOrderForm((current) => ({ ...current, phone: event.target.value }))}
                  required
                />
              </label>
              <label className="auth-field">
                E-mail
                <input
                  type="email"
                  value={orderForm.email}
                  onChange={(event) => setOrderForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label className="auth-field">
                Комментарий
                <textarea
                  className="admin-textarea quick-order-textarea"
                  value={orderForm.comment}
                  onChange={(event) => setOrderForm((current) => ({ ...current, comment: event.target.value }))}
                />
              </label>
              <button className="quick-order-submit" type="submit" disabled={isSubmittingOrder}>
                {isSubmittingOrder ? 'Отправляем...' : 'Заказать'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CartPage;

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { buildCatalogPath } from '../utils/catalogRouting';

function Drawer({ open, onClose, navLinks, buyerLinks }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (location.pathname !== '/products') {
      return;
    }

    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('search') || '');
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    navigate(buildCatalogPath({ search: searchValue.trim() || null }));
    onClose();
  };

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`drawer-panel ${open ? 'is-open' : ''}`}>
        <div className="drawer-header">
          <Brand title="modit" subtitle="Интернет-магазин техники" />
          <button className="icon-button" onClick={onClose} aria-label="Закрыть меню">
            Закрыть
          </button>
        </div>
        <form className="drawer-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Поиск техники и брендов"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <button className="primary-button" type="submit">
            Найти
          </button>
        </form>
        <div className="drawer-section">
          <p className="section-title">Аккаунт</p>
          <div className="drawer-links">
            <Link to="/products" className="drawer-link" onClick={onClose}>
              Каталог
            </Link>
            {isAuthenticated ? (
              <>
                <div className="drawer-user">{user.fullName}</div>
                <Link to="/profile" className="drawer-link" onClick={onClose}>
                  Профиль
                </Link>
              </>
            ) : (
              <Link to="/login" className="drawer-link" onClick={onClose}>
                Войти
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="drawer-link" onClick={onClose}>
                Админ
              </Link>
            ) : null}
            <Link to="/cart" className="drawer-link" onClick={onClose}>
              Корзина ({totalQuantity})
            </Link>
          </div>
        </div>
        <div className="drawer-section">
          <p className="section-title">Категории</p>
          <div className="drawer-links">
            {navLinks.map((item) => (
              <Link key={item} to={buildCatalogPath({ categories: [item] })} className="drawer-link" onClick={onClose}>
                {item}
              </Link>
            ))}
          </div>
        </div>
        <div className="drawer-section">
          <p className="section-title">Покупателям</p>
          <div className="drawer-links">
            {buyerLinks.map((item) => (
              <Link key={item.label} to={item.to} className="drawer-link muted" onClick={onClose}>
                {item.label}
              </Link>
            ))}
            <Link to="/business" className="drawer-link muted" onClick={onClose}>
              Юридическим лицам
            </Link>
          </div>
        </div>
        <div className="drawer-footer">
          <p>Ежедневно: 09:00 - 23:00</p>
          <p className="drawer-phone">+7 707 000 00 00</p>
          {isAuthenticated ? (
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Выйти
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export default Drawer;

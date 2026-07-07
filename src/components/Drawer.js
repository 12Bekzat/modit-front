import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { buildCatalogPath } from '../utils/catalogRouting';

const mobileMenuLinks = [
  { label: 'Каталог', to: '/products', hasArrow: true }
];

function Drawer({ open, onClose, navLinks }) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

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
          <Brand title="modit" subtitle="интернет-магазин" />
          <button className="drawer-close" onClick={onClose} aria-label="Закрыть меню" type="button">
            ×
          </button>
        </div>

        <form className="drawer-search" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            placeholder="Поиск товаров"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <button className="primary-button" type="submit">
            Найти
          </button>
        </form>

        <nav className="drawer-main-menu">
          {mobileMenuLinks.map((item) => (
            <div key={item.label}>
              <Link
                to={item.to}
                className="drawer-menu-row"
                onClick={(event) => {
                  if (item.label === 'Каталог') {
                    event.preventDefault();
                    setIsCatalogOpen((current) => !current);
                    return;
                  }
                  onClose();
                }}
              >
                <span>{item.label}</span>
                {item.hasArrow ? <span className="drawer-arrow">›</span> : null}
              </Link>
              {item.label === 'Каталог' && isCatalogOpen ? (
                <div className="drawer-submenu">
                  {navLinks.map((category) => (
                    <Link
                      key={category}
                      to={buildCatalogPath({ categories: [category] })}
                      className="drawer-submenu-link"
                      onClick={onClose}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="drawer-user-links">
          {isAuthenticated ? (
            <>
              <div className="drawer-user">{user.fullName}</div>
              <Link to="/profile" className="drawer-icon-row" onClick={onClose}>
                <span>◎</span>
                <span>Кабинет</span>
              </Link>
            </>
          ) : (
            <Link to="/login" className="drawer-icon-row" onClick={onClose}>
              <span>◎</span>
              <span>Кабинет</span>
            </Link>
          )}
          <Link to="/products?sort=rating" className="drawer-icon-row" onClick={onClose}>
            <span>≡</span>
            <span>Сравнение</span>
          </Link>
          <Link to="/products?ratingMin=4.5" className="drawer-icon-row" onClick={onClose}>
            <span>♡</span>
            <span>Избранное</span>
          </Link>
          <Link to="/cart" className="drawer-icon-row" onClick={onClose}>
            <span>⌔</span>
            <span>Корзина ({totalQuantity})</span>
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="drawer-icon-row" onClick={onClose}>
              <span>⚙</span>
              <span>Админ</span>
            </Link>
          ) : null}
          {isAuthenticated ? (
            <button
              type="button"
              className="drawer-icon-row drawer-logout"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <span>↩</span>
              <span>Выйти</span>
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}

export default Drawer;

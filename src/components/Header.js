import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/productApi';
import { buildCatalogPath, buildProductPath } from '../utils/catalogRouting';

const FEATURED_CATEGORY_COUNT = 4;
const SEARCH_RESULT_LIMIT = 10;

function formatPrice(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function Header({ categories, onOpenDrawer, showCategoryBar = true }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const { totalQuantity } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [isCatalogMenuOpen, setIsCatalogMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const normalizedCategories = useMemo(
    () => (categories || [])
      .filter((item) => item && item.name)
      .map((item, index) => ({
        id: item.id ?? `category-${index}`,
        name: item.name,
        description: item.description || 'Перейти в раздел каталога',
        featured: Boolean(item.featured),
        visible: item.visible !== false,
        sortOrder: item.sortOrder ?? index
      })),
    [categories]
  );

  const visibleCategories = useMemo(
    () => normalizedCategories.filter((item) => item.visible),
    [normalizedCategories]
  );

  const featuredCategories = useMemo(() => {
    const featured = visibleCategories.filter((item) => item.featured);
    const fallback = visibleCategories.filter((item) => !item.featured);
    return [...featured, ...fallback].slice(0, FEATURED_CATEGORY_COUNT);
  }, [visibleCategories]);

  const featuredNames = useMemo(
    () => new Set(featuredCategories.map((item) => item.name)),
    [featuredCategories]
  );

  const otherCategories = useMemo(
    () => visibleCategories.filter((item) => !featuredNames.has(item.name)),
    [featuredNames, visibleCategories]
  );

  const trimmedSearch = searchValue.trim();
  const shouldShowSearchDropdown = isSearchFocused && trimmedSearch.length >= 2;

  useEffect(() => {
    if (!location.pathname.startsWith('/products')) {
      setSearchValue('');
      return;
    }

    const params = new URLSearchParams(location.search);
    setSearchValue(params.get('search') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    setIsCatalogMenuOpen(false);
    setIsSearchFocused(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsCatalogMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCatalogMenuOpen(false);
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    if (trimmedSearch.length < 2) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return undefined;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchLoading(true);

      try {
        const response = await fetchProducts({
          search: trimmedSearch,
          size: SEARCH_RESULT_LIMIT,
          inStock: false
        });

        if (!isCancelled) {
          setSearchResults(response.items || []);
        }
      } catch {
        if (!isCancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedSearch]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = trimmedSearch || null;
    setIsSearchFocused(false);
    navigate(buildCatalogPath({ search: query }));
  };

  const handleSearchResultClick = () => {
    setIsSearchFocused(false);
  };

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-inner">
          <p>Бесплатная доставка от 20 000 KZT</p>
          <div className="topbar-actions">
            <Link to="/products">Магазин</Link>
            <a href="#site-footer">Поддержка</a>
            <Link to="/business">Юридическим лицам</Link>
          </div>
        </div>
      </div>

      <div className="mainbar">
        <div className="container mainbar-inner">
          <Brand title="modit" subtitle="Интернет-магазин техники" />

          <div className="search-shell" ref={searchRef}>
            <form className="search" onSubmit={handleSearchSubmit}>
              <input
                type="search"
                placeholder="Найти по названию, коду, бренду, категории"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              <button className="primary-button" type="submit">
                Поиск
              </button>
            </form>

            {shouldShowSearchDropdown ? (
              <div className="search-dropdown">
                <div className="search-dropdown-head">
                  <span>Быстрые результаты</span>
                  <span>{searchResults.length} из {SEARCH_RESULT_LIMIT}</span>
                </div>

                {isSearchLoading ? (
                  <div className="search-dropdown-state">Ищем товары...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="search-dropdown-list">
                      {searchResults.slice(0, SEARCH_RESULT_LIMIT).map((item) => (
                        <Link
                          key={item.id}
                          to={buildProductPath(item)}
                          className="search-result-card"
                          onClick={handleSearchResultClick}
                        >
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="search-result-image" loading="lazy" />
                          ) : (
                            <div className="search-result-image search-result-image-empty" />
                          )}
                          <div className="search-result-body">
                            <strong>{item.name}</strong>
                            <span>{item.brand} • {item.category}</span>
                            <span>Код: {item.productCode || '—'}</span>
                          </div>
                          <div className="search-result-price">
                            {formatPrice(item.price)} {item.currencyCode || 'KZT'}
                          </div>
                        </Link>
                      ))}
                    </div>

                    <Link
                      to={buildCatalogPath({ search: trimmedSearch })}
                      className="search-dropdown-all"
                      onClick={handleSearchResultClick}
                    >
                      Показать все результаты
                    </Link>
                  </>
                ) : (
                  <div className="search-dropdown-state">
                    По этому запросу ничего не найдено. Попробуйте код, бренд или категорию.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="header-actions">
            <Link to="/products" className="ghost-button">
              Каталог
            </Link>
            {isAuthenticated ? (
              <Link to="/profile" className="ghost-button">
                Профиль
              </Link>
            ) : (
              <Link to="/login" className="ghost-button">
                Войти
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="ghost-button">
                Админ
              </Link>
            ) : null}
            <Link to="/cart" className="ghost-button">
              Корзина ({totalQuantity})
            </Link>
          </div>

          <button className="icon-button mobile-only" onClick={onOpenDrawer} aria-label="Открыть меню">
            Меню
          </button>
        </div>
      </div>

      {showCategoryBar && visibleCategories.length > 0 ? (
        <nav className="category-bar">
          <div className="container category-shell">
            <div className="category-showcase">
              <Link to="/products" className="category-overview">
                <span className="category-overview-label">Каталог</span>
                <strong>Управляемые категории из базы</strong>
                <span className="category-overview-meta">{visibleCategories.length} разделов на витрине</span>
              </Link>

              <div className="category-links">
                {featuredCategories.map((item) => (
                  <Link key={item.id} to={buildCatalogPath({ categories: [item.name] })} className="category-pill">
                    <span className="category-pill-title">{item.name}</span>
                    <span className="category-pill-description">{item.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="category-actions" ref={menuRef}>
              <div className="category-cta">
                <div>
                  <span className="category-cta-label">Подборка дня</span>
                  <strong>Товары с высоким рейтингом</strong>
                </div>
                <Link className="accent-button" to={buildCatalogPath({ sort: 'rating' })}>
                  Смотреть
                </Link>
              </div>

              {otherCategories.length > 0 ? (
                <div className={`category-menu ${isCatalogMenuOpen ? 'is-open' : ''}`}>
                  <button
                    className="category-menu-trigger"
                    type="button"
                    onClick={() => setIsCatalogMenuOpen((value) => !value)}
                    aria-expanded={isCatalogMenuOpen}
                  >
                    <span>Все категории</span>
                    <span className="category-menu-count">{visibleCategories.length}</span>
                  </button>

                  {isCatalogMenuOpen ? (
                    <div className="category-dropdown">
                      <div className="category-dropdown-head">
                        <div>
                          <p className="category-dropdown-kicker">Навигация</p>
                          <strong>Быстрый переход по разделам</strong>
                        </div>
                        <Link to="/products" className="ghost-button" onClick={() => setIsCatalogMenuOpen(false)}>
                          Весь каталог
                        </Link>
                      </div>

                      <div className="category-dropdown-grid">
                        {visibleCategories.map((item) => (
                          <Link
                            key={item.id}
                            to={buildCatalogPath({ categories: [item.name] })}
                            className="category-dropdown-link"
                            onClick={() => setIsCatalogMenuOpen(false)}
                          >
                            <strong>{item.name}</strong>
                            <span>{item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export default Header;

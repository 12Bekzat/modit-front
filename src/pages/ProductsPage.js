import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CatalogProductCard from '../components/CatalogProductCard';
import FiltersPanel from '../components/FiltersPanel';
import Pagination from '../components/Pagination';
import { useCart } from '../context/CartContext';
import { fetchProductFilters, fetchProducts } from '../services/productApi';

const PAGE_SIZE = 24;

const sortOptions = [
  { value: 'popular', label: 'Популярные' },
  { value: 'price-asc', label: 'Цена по возрастанию' },
  { value: 'price-desc', label: 'Цена по убыванию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'newest', label: 'Сначала новые' }
];

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

function readFilters(searchParams) {
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1);

  return {
    search: searchParams.get('search') || '',
    categories: searchParams.getAll('categories').filter(Boolean),
    brands: searchParams.getAll('brands').filter(Boolean),
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    ratingMin: searchParams.get('ratingMin') || '0',
    inStock: searchParams.get('inStock') !== 'false',
    delivery: searchParams.get('delivery') || 'all',
    sort: searchParams.get('sort') || 'popular',
    page
  };
}

function ProductsPage() {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [catalogCategories, setCatalogCategories] = useState([]);
  const [catalogBrands, setCatalogBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [catalogMeta, setCatalogMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    page: 1,
    hasNext: false
  });

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const deferredSearch = useDeferredValue(searchInput);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const updateFilters = useCallback((updates, { replace = true, preservePage = false } = {}) => {
    const next = new URLSearchParams(searchParams);
    const shouldResetPage = !preservePage && !Object.prototype.hasOwnProperty.call(updates, 'page');

    Object.entries(updates).forEach(([key, value]) => {
      next.delete(key);

      if (value == null || value === '' || value === 'all') {
        return;
      }

      if (key === 'inStock' && value === true) {
        return;
      }

      if (key === 'sort' && value === 'popular') {
        return;
      }

      if (key === 'page' && Number(value) <= 1) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item != null && item !== '') {
            next.append(key, item);
          }
        });
        return;
      }

      next.set(key, String(value));
    });

    if (shouldResetPage) {
      next.delete('page');
    }

    setSearchParams(next, { replace });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const normalizedSearch = deferredSearch.trim();
    if (normalizedSearch === filters.search) {
      return;
    }

    updateFilters({ search: normalizedSearch || null }, { replace: true });
  }, [deferredSearch, filters.search, updateFilters]);

  useEffect(() => {
    let isCancelled = false;

    const loadFilters = async () => {
      try {
        const response = await fetchProductFilters();
        if (isCancelled) {
          return;
        }
        setCatalogCategories(response.categories || []);
        setCatalogBrands(response.brands || []);
      } catch (requestError) {
        if (!isCancelled) {
          setError(requestError.message);
        }
      }
    };

    loadFilters();
    return () => {
      isCancelled = true;
    };
  }, []);

  const requestParams = useMemo(
    () => ({
      search: filters.search,
      categories: filters.categories,
      brands: filters.brands,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
      ratingMin: filters.ratingMin || undefined,
      inStock: filters.inStock,
      delivery: filters.delivery,
      sort: filters.sort,
      size: PAGE_SIZE
    }),
    [filters]
  );

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetchProducts({
          ...requestParams,
          page: Math.max(filters.page - 1, 0)
        });

        if (isCancelled) {
          return;
        }

        const totalPages = response.totalPages || 0;
        const safePage = totalPages > 0 ? Math.min((response.page || 0) + 1, totalPages) : 1;

        setProducts(response.items || []);
        setCatalogMeta({
          totalElements: response.totalElements || 0,
          totalPages,
          page: safePage,
          hasNext: Boolean(response.hasNext)
        });

        if (totalPages > 0 && safePage !== filters.page) {
          updateFilters({ page: safePage }, { replace: true, preservePage: true });
        }
      } catch (requestError) {
        if (!isCancelled) {
          setProducts([]);
          setCatalogMeta({
            totalElements: 0,
            totalPages: 0,
            page: 1,
            hasNext: false
          });
          setError(requestError.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      isCancelled = true;
    };
  }, [filters.page, requestParams, updateFilters]);

  const availableBrands = useMemo(
    () => [...catalogBrands].sort((left, right) => left.localeCompare(right, 'ru')),
    [catalogBrands]
  );

  const handleCategoryChange = (item) => {
    updateFilters({ categories: item ? [item] : [] }, { replace: false });
  };

  const handleBrandChange = (item) => {
    updateFilters({ brands: item ? [item] : [] }, { replace: false });
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: false });
  };

  const handleAddToCart = async (product) => {
    setError('');
    setMessage('');

    try {
      await addItem(product, 1);
      setMessage(`Товар "${product.name}" добавлен в корзину.`);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page === filters.page || page > Math.max(catalogMeta.totalPages, 1)) {
      return;
    }

    updateFilters({ page }, { replace: false, preservePage: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="catalog-page">
      <div className="container">
        <div className="catalog-head">
          <div>
            <h1>Каталог товаров</h1>
            <p className="muted-text">
              Все товары, фильтры, категории и поиск теперь работают напрямую через базу данных.
            </p>
          </div>
          <div className="catalog-controls">
            <span className="muted-text">Сортировка</span>
            <select
              className="filter-select"
              value={filters.sort}
              onChange={(event) => updateFilters({ sort: event.target.value }, { replace: false })}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message ? <p className="form-message is-success">{message}</p> : null}
        {error ? <p className="form-message is-error">{error}</p> : null}

        <div className="catalog-layout">
          <FiltersPanel
            categories={catalogCategories}
            brands={availableBrands}
            filters={{ ...filters, search: searchInput }}
            onSearchChange={setSearchInput}
            onCategoryChange={handleCategoryChange}
            onBrandChange={handleBrandChange}
            onPriceMinChange={(value) => updateFilters({ priceMin: value || null }, { replace: false })}
            onPriceMaxChange={(value) => updateFilters({ priceMax: value || null }, { replace: false })}
            onRatingMinChange={(value) => updateFilters({ ratingMin: value }, { replace: false })}
            onInStockChange={(value) => updateFilters({ inStock: value }, { replace: false })}
            onDeliveryChange={(value) => updateFilters({ delivery: value }, { replace: false })}
            onReset={handleReset}
          />

          <div>
            {isLoading ? (
              <div className="catalog-empty">
                <h3>Загружаем товары</h3>
                <p className="muted-text">Каталог запрашивается с сервера.</p>
              </div>
            ) : (
              <>
                <div className="catalog-results">
                  <span>Показано {products.length} из {catalogMeta.totalElements}</span>
                  <span>{catalogMeta.totalPages > 0 ? `Страница ${catalogMeta.page} из ${catalogMeta.totalPages}` : 'Каталог пуст'}</span>
                </div>

                <Pagination
                  currentPage={catalogMeta.page}
                  totalPages={catalogMeta.totalPages}
                  onPageChange={handlePageChange}
                />

                {products.length === 0 ? (
                  <div className="catalog-empty">
                    <h3>Ничего не найдено</h3>
                    <p className="muted-text">Попробуйте изменить фильтры или очистить поиск.</p>
                    <button className="ghost-button" type="button" onClick={handleReset}>
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="catalog-grid">
                      {products.map((product) => (
                        <CatalogProductCard
                          key={product.productCode || product.externalCode || product.name}
                          product={product}
                          formatPrice={formatPrice}
                          deliveryLabel={deliveryLabels[product.delivery] || 'Срок уточняется'}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>

                    <div className="catalog-pagination-wrap">
                      <Pagination
                        currentPage={catalogMeta.page}
                        totalPages={catalogMeta.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductsPage;

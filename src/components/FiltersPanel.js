import { useMemo, useState } from 'react';

function FiltersPanel({
  categories,
  brands,
  filters,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onPriceMinChange,
  onPriceMaxChange,
  onRatingMinChange,
  onInStockChange,
  onDeliveryChange,
  onReset
}) {
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const visibleCategories = useMemo(() => {
    const query = categorySearch.trim().toLowerCase();
    const filtered = query
      ? categories.filter((item) => item.toLowerCase().includes(query))
      : categories;
    return filtered.slice(0, 120);
  }, [categories, categorySearch]);

  const visibleBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();
    const filtered = query
      ? brands.filter((item) => item.toLowerCase().includes(query))
      : brands;
    return filtered.slice(0, 120);
  }, [brands, brandSearch]);

  const selectedCategory = filters.categories[0] || '';
  const selectedBrand = filters.brands[0] || '';

  return (
    <aside className="filters-panel">
      <div className="filters-head">
        <h2>Фильтры</h2>
        <button className="ghost-button" type="button" onClick={onReset}>
          Сбросить
        </button>
      </div>

      <div className="filters-section">
        <p className="filters-title">Поиск</p>
        <input
          className="filter-input"
          type="search"
          placeholder="Название или бренд"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="filters-section">
        <p className="filters-title">Категория</p>
        <input
          className="filter-input"
          type="search"
          placeholder="Найти категорию"
          value={categorySearch}
          onChange={(event) => setCategorySearch(event.target.value)}
        />
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">Все категории</option>
          {visibleCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <p className="filters-meta">
          {categorySearch.trim()
            ? `Найдено ${visibleCategories.length} из ${categories.length}`
            : `Всего категорий: ${categories.length}`}
        </p>
      </div>

      <div className="filters-section">
        <p className="filters-title">Бренд</p>
        <input
          className="filter-input"
          type="search"
          placeholder="Найти бренд"
          value={brandSearch}
          onChange={(event) => setBrandSearch(event.target.value)}
        />
        <select
          className="filter-select"
          value={selectedBrand}
          onChange={(event) => onBrandChange(event.target.value)}
        >
          <option value="">Все бренды</option>
          {visibleBrands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <p className="filters-meta">
          {brandSearch.trim()
            ? `Найдено ${visibleBrands.length} из ${brands.length}`
            : `Всего брендов: ${brands.length}`}
        </p>
      </div>

      <div className="filters-section">
        <p className="filters-title">Цена</p>
        <div className="filter-range">
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="От"
            value={filters.priceMin}
            onChange={(event) => onPriceMinChange(event.target.value)}
          />
          <input
            className="filter-input"
            type="number"
            min="0"
            placeholder="До"
            value={filters.priceMax}
            onChange={(event) => onPriceMaxChange(event.target.value)}
          />
        </div>
      </div>

      <div className="filters-section">
        <p className="filters-title">Рейтинг</p>
        <select
          className="filter-select"
          value={filters.ratingMin}
          onChange={(event) => onRatingMinChange(event.target.value)}
        >
          <option value="0">Любой</option>
          <option value="4.0">от 4.0</option>
          <option value="4.3">от 4.3</option>
          <option value="4.5">от 4.5</option>
          <option value="4.7">от 4.7</option>
        </select>
      </div>

      <div className="filters-section">
        <p className="filters-title">Доставка</p>
        <select
          className="filter-select"
          value={filters.delivery}
          onChange={(event) => onDeliveryChange(event.target.value)}
        >
          <option value="all">Любая</option>
          <option value="сегодня">Сегодня</option>
          <option value="завтра">Завтра</option>
          <option value="2-3 дня">2-3 дня</option>
          <option value="3-5 дней">3-5 дней</option>
        </select>
      </div>

      <div className="filters-section">
        <label className="filter-option">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(event) => onInStockChange(event.target.checked)}
          />
          <span>Только в наличии</span>
        </label>
      </div>
    </aside>
  );
}

export default FiltersPanel;

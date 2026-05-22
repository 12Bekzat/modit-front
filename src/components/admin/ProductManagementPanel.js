import { useEffect, useMemo, useState } from 'react';
import Pagination from '../Pagination';
import {
  createAdminProduct,
  deleteAdminProduct,
  updateAdminProduct
} from '../../services/adminApi';
import { getProductImageUrls } from '../../utils/productImages';

const PRODUCT_COLUMN_STORAGE_KEY = 'admin-product-columns';
const ADMIN_PRODUCTS_PAGE_SIZE = 15;
const DEFAULT_PRODUCT_COLUMNS = ['name', 'category', 'brand', 'price', 'availableQuantity', 'source', 'updatedAt'];
const DELIVERY_OPTIONS = ['сегодня', 'завтра', '2-3 дня', '3-5 дней', 'предзаказ'];

const PRODUCT_COLUMN_OPTIONS = [
  { key: 'productCode', label: 'Код', render: (product) => product.productCode || '—' },
  { key: 'name', label: 'Название', render: (product) => product.name },
  { key: 'category', label: 'Категория', render: (product) => product.category },
  { key: 'brand', label: 'Бренд', render: (product) => product.brand },
  { key: 'price', label: 'Цена', render: (product) => formatPrice(product.price, product.currencyCode) },
  { key: 'oldPrice', label: 'Старая цена', render: (product) => formatPrice(product.oldPrice, product.currencyCode) },
  { key: 'rating', label: 'Рейтинг', render: (product) => String(product.rating ?? '—') },
  { key: 'availableQuantity', label: 'Остаток', render: (product) => String(product.availableQuantity ?? 0) },
  { key: 'delivery', label: 'Доставка', render: (product) => product.delivery || '—' },
  { key: 'tag', label: 'Тег', render: (product) => product.tag || '—' },
  { key: 'source', label: 'Источник', render: (product) => product.source || '—' },
  { key: 'updatedAt', label: 'Обновлено', render: (product) => formatDate(product.updatedAt) }
];

function createEmptyProductForm() {
  return {
    name: '',
    category: '',
    brand: '',
    price: '',
    oldPrice: '',
    rating: '4.5',
    availableQuantity: '0',
    inStock: false,
    delivery: 'предзаказ',
    tag: '',
    description: '',
    imageUrls: [''],
    productUrl: '',
    currencyCode: 'KZT'
  };
}

function formatNumber(value) {
  return String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function formatPrice(value, currencyCode) {
  return `${formatNumber(value)} ${currencyCode || 'KZT'}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function normalizeImageUrls(values) {
  const normalized = [];

  (values || []).forEach((value) => {
    const imageUrl = String(value || '').trim();
    if (imageUrl && !normalized.includes(imageUrl)) {
      normalized.push(imageUrl);
    }
  });

  return normalized;
}

function buildImageFieldList(values) {
  const normalized = normalizeImageUrls(values);
  return normalized.length > 0 ? normalized : [''];
}

function createProductForm(product) {
  if (!product) {
    return createEmptyProductForm();
  }

  return {
    name: product.name || '',
    category: product.category || '',
    brand: product.brand || '',
    price: String(product.price ?? ''),
    oldPrice: String(product.oldPrice ?? ''),
    rating: String(product.rating ?? '4.5'),
    availableQuantity: String(product.availableQuantity ?? 0),
    inStock: Boolean(product.inStock),
    delivery: product.delivery || 'предзаказ',
    tag: product.tag || '',
    description: product.description || '',
    imageUrls: buildImageFieldList(getProductImageUrls(product)),
    productUrl: product.productUrl || '',
    currencyCode: product.currencyCode || 'KZT'
  };
}

function normalizeProductForm(form) {
  const imageUrls = normalizeImageUrls(form.imageUrls);

  return {
    name: form.name.trim(),
    category: form.category.trim(),
    brand: form.brand.trim(),
    price: String(form.price).trim(),
    oldPrice: String(form.oldPrice).trim(),
    rating: String(form.rating).trim(),
    availableQuantity: String(form.availableQuantity).trim(),
    inStock: Boolean(form.inStock) && Number(form.availableQuantity) > 0,
    delivery: form.delivery.trim(),
    tag: form.tag.trim(),
    description: form.description.trim(),
    imageUrl: imageUrls[0] || '',
    imageUrls,
    productUrl: form.productUrl.trim(),
    currencyCode: form.currencyCode.trim()
  };
}

function validateUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateProductForm(form) {
  const normalized = normalizeProductForm(form);
  const errors = {};
  const price = Number(normalized.price);
  const oldPrice = Number(normalized.oldPrice);
  const rating = Number(normalized.rating);
  const availableQuantity = Number(normalized.availableQuantity);

  if (normalized.name.length < 2) {
    errors.name = 'Минимум 2 символа.';
  }
  if (normalized.category.length < 2) {
    errors.category = 'Минимум 2 символа.';
  }
  if (normalized.brand.length < 2) {
    errors.brand = 'Минимум 2 символа.';
  }
  if (normalized.delivery.length < 2) {
    errors.delivery = 'Укажите срок доставки.';
  }
  if (normalized.tag.length < 2) {
    errors.tag = 'Укажите короткий тег.';
  }
  if (normalized.description.length < 10) {
    errors.description = 'Минимум 10 символов.';
  }
  if (!normalized.currencyCode) {
    errors.currencyCode = 'Валюта обязательна.';
  }
  if (Number.isNaN(price) || price < 0) {
    errors.price = 'Цена должна быть 0 или больше.';
  }
  if (Number.isNaN(oldPrice) || oldPrice < 0) {
    errors.oldPrice = 'Старая цена должна быть 0 или больше.';
  }
  if (!Number.isNaN(price) && !Number.isNaN(oldPrice) && oldPrice < price) {
    errors.oldPrice = 'Старая цена не может быть меньше текущей.';
  }
  if (Number.isNaN(rating) || rating < 0 || rating > 5) {
    errors.rating = 'Рейтинг должен быть от 0 до 5.';
  }
  if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
    errors.availableQuantity = 'Остаток должен быть целым числом от 0.';
  }
  if (normalized.imageUrls.length > 12) {
    errors.imageUrls = 'Максимум 12 фото на один товар.';
  }
  if (normalized.imageUrls.some((value) => !validateUrl(value))) {
    errors.imageUrls = 'Каждая ссылка на фото должна быть корректной http/https.';
  }
  if (!validateUrl(normalized.productUrl)) {
    errors.productUrl = 'Нужна корректная ссылка http/https.';
  }

  return errors;
}

function ProductManagementPanel({
  products,
  categories = [],
  brands = [],
  token,
  setMessage,
  setError,
  refreshAdminData
}) {
  const [tableQuery, setTableQuery] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productForm, setProductForm] = useState(createEmptyProductForm);
  const [productBaseline, setProductBaseline] = useState(createEmptyProductForm);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(() => {
    try {
      const raw = window.localStorage.getItem(PRODUCT_COLUMN_STORAGE_KEY);
      if (!raw) {
        return DEFAULT_PRODUCT_COLUMNS;
      }

      const parsed = JSON.parse(raw);
      const allowedKeys = PRODUCT_COLUMN_OPTIONS.map((item) => item.key);
      const filtered = parsed.filter((key) => allowedKeys.includes(key));
      return filtered.length > 0 ? filtered : DEFAULT_PRODUCT_COLUMNS;
    } catch {
      return DEFAULT_PRODUCT_COLUMNS;
    }
  });

  const selectedProduct = useMemo(
    () => products.find((item) => item.id === selectedProductId) || null,
    [products, selectedProductId]
  );
  const productValidationErrors = useMemo(() => validateProductForm(productForm), [productForm]);
  const hasProductChanges = useMemo(
    () => JSON.stringify(normalizeProductForm(productForm)) !== JSON.stringify(normalizeProductForm(productBaseline)),
    [productBaseline, productForm]
  );
  const filteredProducts = useMemo(() => {
    const normalizedQuery = tableQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => (
      [
        product.name,
        product.brand,
        product.category,
        product.productCode,
        product.externalCode,
        product.source
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    ));
  }, [products, tableQuery]);
  const totalTablePages = Math.max(Math.ceil(filteredProducts.length / ADMIN_PRODUCTS_PAGE_SIZE), 1);
  const pagedProducts = useMemo(() => {
    const start = (tablePage - 1) * ADMIN_PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(start, start + ADMIN_PRODUCTS_PAGE_SIZE);
  }, [filteredProducts, tablePage]);
  const tableRangeStart = filteredProducts.length === 0 ? 0 : (tablePage - 1) * ADMIN_PRODUCTS_PAGE_SIZE + 1;
  const tableRangeEnd = filteredProducts.length === 0
    ? 0
    : Math.min(tablePage * ADMIN_PRODUCTS_PAGE_SIZE, filteredProducts.length);
  const visibleColumnOptions = useMemo(
    () => PRODUCT_COLUMN_OPTIONS.filter((item) => visibleColumns.includes(item.key)),
    [visibleColumns]
  );
  const productPreviewImages = useMemo(() => normalizeImageUrls(productForm.imageUrls), [productForm.imageUrls]);
  const availableBrands = useMemo(
    () => Array.from(new Set(brands.map((item) => item?.name).filter(Boolean))).sort((left, right) => left.localeCompare(right, 'ru')),
    [brands]
  );
  const availableCategories = useMemo(
    () => Array.from(new Set(categories.map((item) => item?.name).filter(Boolean))).sort((left, right) => left.localeCompare(right, 'ru')),
    [categories]
  );

  useEffect(() => {
    window.localStorage.setItem(PRODUCT_COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    setTablePage(1);
  }, [tableQuery]);

  useEffect(() => {
    if (tablePage > totalTablePages) {
      setTablePage(totalTablePages);
    }
  }, [tablePage, totalTablePages]);

  useEffect(() => {
    if (isCreatingProduct || selectedProductId == null) {
      return;
    }

    if (!selectedProduct) {
      const emptyForm = createEmptyProductForm();
      setSelectedProductId(null);
      setProductForm(emptyForm);
      setProductBaseline(emptyForm);
    }
  }, [isCreatingProduct, selectedProduct, selectedProductId]);

  const syncFormWithProduct = (product) => {
    const nextForm = createProductForm(product);
    setProductForm(nextForm);
    setProductBaseline(nextForm);
  };

  const resetToEmptyForm = () => {
    const emptyForm = createEmptyProductForm();
    setProductForm(emptyForm);
    setProductBaseline(emptyForm);
  };

  const confirmDiscardIfNeeded = () => {
    if (!hasProductChanges) {
      return true;
    }

    return window.confirm('Есть несохраненные изменения. Отменить их?');
  };

  const handleSelectProduct = (product) => {
    if (!confirmDiscardIfNeeded()) {
      return;
    }

    setIsCreatingProduct(false);
    setSelectedProductId(product.id);
    syncFormWithProduct(product);
  };

  const handleCreateProduct = () => {
    if (!confirmDiscardIfNeeded()) {
      return;
    }

    setIsCreatingProduct(true);
    setSelectedProductId(null);
    resetToEmptyForm();
  };

  const handleCancelChanges = () => {
    if (isCreatingProduct) {
      setIsCreatingProduct(false);
      setSelectedProductId(null);
      resetToEmptyForm();
      return;
    }

    syncFormWithProduct(selectedProduct);
  };

  const handleToggleColumn = (columnKey) => {
    setVisibleColumns((current) => {
      if (current.includes(columnKey)) {
        if (current.length === 1) {
          return current;
        }
        return current.filter((item) => item !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const handleProductFieldChange = (field, value) => {
    setProductForm((current) => {
      const nextForm = { ...current, [field]: value };
      if (field === 'availableQuantity' && Number(value) <= 0) {
        nextForm.inStock = false;
      }
      return nextForm;
    });
  };

  const handleProductImageChange = (index, value) => {
    setProductForm((current) => ({
      ...current,
      imageUrls: current.imageUrls.map((item, itemIndex) => (itemIndex === index ? value : item))
    }));
  };

  const handleAddProductImage = () => {
    setProductForm((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, '']
    }));
  };

  const handleRemoveProductImage = (index) => {
    setProductForm((current) => {
      const nextImageUrls = current.imageUrls.filter((_, itemIndex) => itemIndex !== index);
      return {
        ...current,
        imageUrls: nextImageUrls.length > 0 ? nextImageUrls : ['']
      };
    });
  };

  const handleTablePageChange = (page) => {
    if (page < 1 || page > totalTablePages || page === tablePage) {
      return;
    }

    setTablePage(page);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    if (!hasProductChanges || Object.keys(productValidationErrors).length > 0) {
      return;
    }

    const payload = {
      ...normalizeProductForm(productForm),
      price: Number(productForm.price),
      oldPrice: Number(productForm.oldPrice || productForm.price),
      rating: Number(productForm.rating),
      availableQuantity: Number(productForm.availableQuantity),
      inStock: Boolean(productForm.inStock) && Number(productForm.availableQuantity) > 0
    };

    setError('');
    setMessage('');
    setIsSavingProduct(true);

    try {
      const savedProduct = isCreatingProduct
        ? await createAdminProduct(token, payload)
        : await updateAdminProduct(token, selectedProductId, payload);

      await refreshAdminData();
      setIsCreatingProduct(false);
      setSelectedProductId(savedProduct.id);
      syncFormWithProduct(savedProduct);
      setMessage(isCreatingProduct ? 'Товар создан.' : 'Изменения по товару сохранены.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct || !window.confirm(`Удалить товар "${selectedProduct.name}"?`)) {
      return;
    }

    setError('');
    setMessage('');
    setIsSavingProduct(true);

    try {
      await deleteAdminProduct(token, selectedProduct.id);
      await refreshAdminData();
      setIsCreatingProduct(false);
      setSelectedProductId(null);
      resetToEmptyForm();
      setMessage('Товар удален.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const detailTitle = isCreatingProduct
    ? 'Новый товар'
    : selectedProduct
      ? selectedProduct.name
      : 'Выберите товар';

  const isDetailOpen = isCreatingProduct || selectedProduct != null;

  return (
    <div className="admin-products-layout">
      <div className="admin-list-card admin-products-table-card">
        <div className="admin-form-head">
          <div>
            <h2>Товары</h2>
            <p className="muted-text">Слева таблица, справа компактная карточка редактирования.</p>
          </div>
          <button type="button" className="accent-button" onClick={handleCreateProduct}>
            Новый товар
          </button>
        </div>

        <div className="admin-products-toolbar">
          <label className="auth-field admin-products-search">
            Поиск по таблице
            <input
              type="search"
              value={tableQuery}
              onChange={(event) => setTableQuery(event.target.value)}
              placeholder="Название, бренд, код, категория"
            />
          </label>

          <details className="admin-column-picker">
            <summary className="ghost-button">Колонки таблицы</summary>
            <div className="admin-column-picker-menu">
              {PRODUCT_COLUMN_OPTIONS.map((column) => (
                <label key={column.key} className="filter-option admin-column-option">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => handleToggleColumn(column.key)}
                    disabled={visibleColumns.length === 1 && visibleColumns.includes(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
          </details>
        </div>

        <div className="admin-products-table-wrap">
          <table className="admin-products-table">
            <thead>
              <tr>
                {visibleColumnOptions.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedProducts.map((product) => (
                <tr
                  key={product.id}
                  className={product.id === selectedProductId && !isCreatingProduct ? 'is-selected' : ''}
                  onClick={() => handleSelectProduct(product)}
                >
                  {visibleColumnOptions.map((column) => (
                    <td key={column.key}>{column.render(product)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 ? (
            <div className="admin-empty compact">
              <h3>Товары не найдены</h3>
              <p className="muted-text">Измените запрос или создайте новый товар.</p>
            </div>
          ) : (
            <div className="admin-products-table-footer">
              <span className="muted-text">{`Показано ${tableRangeStart}-${tableRangeEnd} из ${filteredProducts.length}`}</span>
              <Pagination currentPage={tablePage} totalPages={totalTablePages} onPageChange={handleTablePageChange} />
            </div>
          )}
        </div>
      </div>

      <div className={`admin-form-card admin-product-detail-card ${isDetailOpen ? 'is-open' : ''}`}>
        {isDetailOpen ? (
          <form onSubmit={handleSaveProduct} className="admin-product-detail-form">
            <div className="admin-form-head">
              <div>
                <h2>{detailTitle}</h2>
                <p className="muted-text">
                  {isCreatingProduct ? 'Создание ручного товара.' : 'Редактирование полей товара.'}
                </p>
              </div>
              {!isCreatingProduct && selectedProduct ? (
                <button type="button" className="ghost-button" onClick={handleDeleteProduct} disabled={isSavingProduct}>
                  Удалить
                </button>
              ) : null}
            </div>

            {!isCreatingProduct && selectedProduct ? (
              <div className="admin-detail-meta-grid">
                <label className="auth-field">
                  ID
                  <input type="text" value={selectedProduct.id} readOnly />
                </label>
                <label className="auth-field">
                  Product code
                  <input type="text" value={selectedProduct.productCode || ''} readOnly />
                </label>
                <label className="auth-field">
                  Source
                  <input type="text" value={selectedProduct.source || ''} readOnly />
                </label>
                <label className="auth-field">
                  External code
                  <input type="text" value={selectedProduct.externalCode || ''} readOnly />
                </label>
                <label className="auth-field">
                  Создан
                  <input type="text" value={formatDate(selectedProduct.createdAt)} readOnly />
                </label>
                <label className="auth-field">
                  Обновлен
                  <input type="text" value={formatDate(selectedProduct.updatedAt)} readOnly />
                </label>
                <label className="auth-field admin-detail-span-2">
                  Последняя синхронизация
                  <input type="text" value={formatDate(selectedProduct.lastSyncedAt)} readOnly />
                </label>
              </div>
            ) : null}

            <div className="admin-grid-2">
              <label className="auth-field">
                Название *
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(event) => handleProductFieldChange('name', event.target.value)}
                  required
                />
                {productValidationErrors.name ? <span className="admin-field-error">{productValidationErrors.name}</span> : null}
              </label>
              <label className="auth-field">
                Категория *
                <input
                  type="text"
                  list="admin-category-options"
                  value={productForm.category}
                  onChange={(event) => handleProductFieldChange('category', event.target.value)}
                  required
                />
                <datalist id="admin-category-options">
                  {availableCategories.map((categoryName) => (
                    <option key={categoryName} value={categoryName} />
                  ))}
                </datalist>
                {productValidationErrors.category ? <span className="admin-field-error">{productValidationErrors.category}</span> : null}
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="auth-field">
                Бренд *
                <input
                  type="text"
                  list="admin-brand-options"
                  value={productForm.brand}
                  onChange={(event) => handleProductFieldChange('brand', event.target.value)}
                  required
                />
                <datalist id="admin-brand-options">
                  {availableBrands.map((brandName) => (
                    <option key={brandName} value={brandName} />
                  ))}
                </datalist>
                {productValidationErrors.brand ? <span className="admin-field-error">{productValidationErrors.brand}</span> : null}
              </label>
              <label className="auth-field">
                Валюта *
                <input
                  type="text"
                  value={productForm.currencyCode}
                  onChange={(event) => handleProductFieldChange('currencyCode', event.target.value)}
                  required
                />
                {productValidationErrors.currencyCode ? <span className="admin-field-error">{productValidationErrors.currencyCode}</span> : null}
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="auth-field">
                Цена *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => handleProductFieldChange('price', event.target.value)}
                  required
                />
                {productValidationErrors.price ? <span className="admin-field-error">{productValidationErrors.price}</span> : null}
              </label>
              <label className="auth-field">
                Старая цена *
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.oldPrice}
                  onChange={(event) => handleProductFieldChange('oldPrice', event.target.value)}
                  required
                />
                {productValidationErrors.oldPrice ? <span className="admin-field-error">{productValidationErrors.oldPrice}</span> : null}
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="auth-field">
                Рейтинг *
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={productForm.rating}
                  onChange={(event) => handleProductFieldChange('rating', event.target.value)}
                  required
                />
                {productValidationErrors.rating ? <span className="admin-field-error">{productValidationErrors.rating}</span> : null}
              </label>
              <label className="auth-field">
                Остаток *
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={productForm.availableQuantity}
                  onChange={(event) => handleProductFieldChange('availableQuantity', event.target.value)}
                  required
                />
                {productValidationErrors.availableQuantity ? <span className="admin-field-error">{productValidationErrors.availableQuantity}</span> : null}
              </label>
            </div>

            <div className="admin-grid-2">
              <label className="auth-field">
                Доставка *
                <select
                  className="filter-select"
                  value={productForm.delivery}
                  onChange={(event) => handleProductFieldChange('delivery', event.target.value)}
                >
                  {DELIVERY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {productValidationErrors.delivery ? <span className="admin-field-error">{productValidationErrors.delivery}</span> : null}
              </label>
              <label className="auth-field">
                Тег *
                <input
                  type="text"
                  value={productForm.tag}
                  onChange={(event) => handleProductFieldChange('tag', event.target.value)}
                  required
                />
                {productValidationErrors.tag ? <span className="admin-field-error">{productValidationErrors.tag}</span> : null}
              </label>
            </div>

            <label className="filter-option">
              <input
                type="checkbox"
                checked={productForm.inStock}
                onChange={(event) => handleProductFieldChange('inStock', event.target.checked)}
                disabled={Number(productForm.availableQuantity) <= 0}
              />
              <span>Показывать как "в наличии"</span>
            </label>

            <div className="auth-field admin-product-media-panel">
              <div className="admin-product-media-head">
                <div>
                  <span>Фото товара</span>
                  <p className="muted-text">Первое фото будет главным в каталоге и корзине.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button admin-inline-button"
                  onClick={handleAddProductImage}
                  disabled={productForm.imageUrls.length >= 12}
                >
                  Добавить фото
                </button>
              </div>

              <div className="admin-image-list">
                {productForm.imageUrls.map((imageUrl, index) => (
                  <div key={`product-image-${index}`} className="admin-image-row">
                    <span className="admin-image-index">{index + 1}</span>
                    <input
                      type="url"
                      value={imageUrl}
                      placeholder="https://example.com/image.jpg"
                      onChange={(event) => handleProductImageChange(index, event.target.value)}
                    />
                    <button
                      type="button"
                      className="ghost-button admin-inline-button"
                      onClick={() => handleRemoveProductImage(index)}
                      disabled={productForm.imageUrls.length === 1 && !productForm.imageUrls[0]}
                    >
                      Убрать
                    </button>
                  </div>
                ))}
              </div>

              {productValidationErrors.imageUrls ? <span className="admin-field-error">{productValidationErrors.imageUrls}</span> : null}

              {productPreviewImages.length > 0 ? (
                <div className="admin-image-preview-grid">
                  {productPreviewImages.map((imageUrl, index) => (
                    <div key={imageUrl} className="admin-image-preview-card">
                      <div
                        className="admin-image-preview-thumb"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                        aria-label={`Фото ${index + 1}`}
                      />
                      <span>{index === 0 ? 'Главное' : `Фото ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted-text">Можно добавить одну или несколько ссылок на фото товара.</p>
              )}
            </div>

            <label className="auth-field">
              Ссылка на карточку товара
              <input
                type="url"
                value={productForm.productUrl}
                onChange={(event) => handleProductFieldChange('productUrl', event.target.value)}
              />
              {productValidationErrors.productUrl ? <span className="admin-field-error">{productValidationErrors.productUrl}</span> : null}
            </label>

            <label className="auth-field">
              Описание *
              <textarea
                className="admin-textarea"
                value={productForm.description}
                onChange={(event) => handleProductFieldChange('description', event.target.value)}
                required
              />
              {productValidationErrors.description ? <span className="admin-field-error">{productValidationErrors.description}</span> : null}
            </label>

            <div className="admin-detail-actions">
              <button
                type="submit"
                className="accent-button"
                disabled={isSavingProduct || !hasProductChanges || Object.keys(productValidationErrors).length > 0}
              >
                {isSavingProduct ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={handleCancelChanges}
                disabled={isSavingProduct || !hasProductChanges}
              >
                Отменить
              </button>
            </div>
          </form>
        ) : (
          <div className="admin-empty admin-product-placeholder">
            <h3>Выберите товар</h3>
            <p className="muted-text">Клик по строке открывает карточку редактирования справа.</p>
            <button type="button" className="accent-button" onClick={handleCreateProduct}>
              Создать товар
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductManagementPanel;

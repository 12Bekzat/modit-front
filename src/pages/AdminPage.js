import { useCallback, useEffect, useState } from 'react';
import BrandManagementPanel from '../components/admin/BrandManagementPanel';
import CategoryManagementPanel from '../components/admin/CategoryManagementPanel';
import ProductManagementPanel from '../components/admin/ProductManagementPanel';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminBrands,
  createAdminUser,
  deleteAdminUser,
  deleteProductMarkupRule,
  fetchAdminCategories,
  fetchAdminOrders,
  fetchAdminPreorders,
  fetchAdminProducts,
  fetchAdminUsers,
  fetchCatalogImportSettings,
  fetchMarkupSettings,
  fetchProductMarkupRules,
  previewCatalogImportFile,
  syncCatalogs,
  uploadCatalogImportFile,
  uploadCatalogImportFileWithMapping,
  updateAdminUser,
  updateCatalogImportSettings,
  updateMarkupSettings,
  updateOrderStatus,
  updatePreorderStatus,
  upsertProductMarkupRule
} from '../services/adminApi';

const preorderStatuses = ['NEW', 'PROCESSING', 'COMPLETED', 'CANCELED'];
const orderStatuses = ['NEW', 'PROCESSING', 'COMPLETED', 'CANCELED'];
const markupModes = [
  { value: 'PERCENT', label: 'Процент' },
  { value: 'FIXED', label: 'Сумма' }
];

const initialUserForm = { fullName: '', email: '', phone: '', role: 'USER', password: '' };
const initialMarkupSettingsForm = { enabled: false, mode: 'PERCENT', value: '0' };
const initialProductMarkupForm = { productCode: '', productName: '', enabled: true, mode: 'PERCENT', value: '0' };
const initialImportSettingsForm = { apiBaseUrl: '', accessToken: '', pageSize: '250', maxItems: '0', requestIntervalMs: '1200' };

const tabs = {
  brands: 'Бренды',
  imports: 'Импорт API',
  products: 'Товары',
  categories: 'Категории',
  markups: 'Наценки',
  users: 'Пользователи',
  preorders: 'Предзаказы',
  orders: 'Заказы'
};

const formatPrice = (value) => String(Math.round(Number(value || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const formatDate = (value) => (
  value
    ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Неизвестно'
);
const humanizeStatus = (status) => ({
  NEW: 'Новый',
  PROCESSING: 'В работе',
  COMPLETED: 'Завершен',
  CANCELED: 'Отменен'
}[status] || status);
const modeLabel = (mode) => (mode === 'FIXED' ? 'Сумма' : 'Процент');

function AdminPage() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('imports');
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [preorders, setPreorders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [markupRules, setMarkupRules] = useState([]);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [markupSettingsForm, setMarkupSettingsForm] = useState(initialMarkupSettingsForm);
  const [productMarkupForm, setProductMarkupForm] = useState(initialProductMarkupForm);
  const [importSettingsForm, setImportSettingsForm] = useState(initialImportSettingsForm);
  const [isImportAccessTokenConfigured, setIsImportAccessTokenConfigured] = useState(false);
  const [importSettingsUpdatedAt, setImportSettingsUpdatedAt] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingMarkupId, setEditingMarkupId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFileImporting, setIsFileImporting] = useState(false);
  const [catalogImportFile, setCatalogImportFile] = useState(null);
  const [catalogImportInputKey, setCatalogImportInputKey] = useState(0);
  const [catalogImportPreview, setCatalogImportPreview] = useState(null);
  const [catalogImportMapping, setCatalogImportMapping] = useState({});
  const [statusUpdateId, setStatusUpdateId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    const [
      productsData,
      brandsData,
      categoriesData,
      usersData,
      preordersData,
      ordersData,
      settingsData,
      rulesData,
      importSettingsData
    ] = await Promise.all([
      fetchAdminProducts(token),
      fetchAdminBrands(token),
      fetchAdminCategories(token),
      fetchAdminUsers(token),
      fetchAdminPreorders(token),
      fetchAdminOrders(token),
      fetchMarkupSettings(token),
      fetchProductMarkupRules(token),
      fetchCatalogImportSettings(token)
    ]);

    setProducts(productsData);
    setBrands(brandsData);
    setCategories(categoriesData);
    setUsers(usersData);
    setPreorders(preordersData);
    setOrders(ordersData);
    setMarkupRules(rulesData);
    setMarkupSettingsForm({
      enabled: Boolean(settingsData.enabled),
      mode: settingsData.mode || 'PERCENT',
      value: String(settingsData.value ?? '0')
    });
    setImportSettingsForm({
      apiBaseUrl: importSettingsData.apiBaseUrl || '',
      accessToken: '',
      pageSize: String(importSettingsData.pageSize ?? 250),
      maxItems: String(importSettingsData.maxItems ?? 0),
      requestIntervalMs: String(importSettingsData.requestIntervalMs ?? 1200)
    });
    setIsImportAccessTokenConfigured(Boolean(importSettingsData.accessTokenConfigured));
    setImportSettingsUpdatedAt(importSettingsData.updatedAt || null);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setIsLoading(true);
      setError('');
      try {
        await loadAdminData();
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [loadAdminData]);

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(initialUserForm);
  };

  const resetProductMarkupForm = () => {
    setEditingMarkupId(null);
    setProductMarkupForm(initialProductMarkupForm);
  };

  const safeAction = async (action, successMessage) => {
    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      await action();
      await loadAdminData();
      setMessage(successMessage);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      fullName: userForm.fullName,
      email: userForm.email,
      phone: userForm.phone,
      role: userForm.role,
      ...(userForm.password ? { password: userForm.password } : {})
    };

    await safeAction(async () => {
      if (editingUserId) {
        await updateAdminUser(token, editingUserId, payload);
      } else {
        await createAdminUser(token, payload);
      }
      resetUserForm();
    }, editingUserId ? 'Пользователь обновлен.' : 'Пользователь создан.');
  };

  const handleMarkupSettingsSubmit = async (event) => {
    event.preventDefault();
    await safeAction(
      () => updateMarkupSettings(token, {
        enabled: markupSettingsForm.enabled,
        mode: markupSettingsForm.mode,
        value: Number(markupSettingsForm.value || 0)
      }),
      'Общая наценка обновлена.'
    );
  };

  const handleProductMarkupSubmit = async (event) => {
    event.preventDefault();
    await safeAction(async () => {
      await upsertProductMarkupRule(token, {
        productCode: productMarkupForm.productCode.trim().toUpperCase(),
        productName: productMarkupForm.productName || undefined,
        enabled: productMarkupForm.enabled,
        mode: productMarkupForm.mode,
        value: Number(productMarkupForm.value || 0)
      });
      resetProductMarkupForm();
    }, 'Индивидуальная наценка сохранена.');
  };

  const handleImportSettingsSubmit = async (event) => {
    event.preventDefault();
    await safeAction(
      () => updateCatalogImportSettings(token, {
        apiBaseUrl: importSettingsForm.apiBaseUrl.trim(),
        accessToken: importSettingsForm.accessToken.trim(),
        pageSize: Math.min(Math.max(Number(importSettingsForm.pageSize || 250), 0), 250),
        maxItems: Number(importSettingsForm.maxItems || 0),
        requestIntervalMs: Number(importSettingsForm.requestIntervalMs || 0)
      }),
      'Настройки импорта сохранены.'
    );
  };

  const handleCatalogSync = async () => {
    setError('');
    setMessage('');
    setIsSyncing(true);
    try {
      const result = await syncCatalogs(token);
      await loadAdminData();
      setMessage(
        `Импорт завершен. Создано: ${result.created ?? 0}, обновлено: ${result.updated ?? 0}, пропущено/удалено: ${result.skipped ?? 0}.`
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCatalogFileSelect = async (file) => {
    setCatalogImportFile(file || null);
    setCatalogImportPreview(null);
    setCatalogImportMapping({});
    setMessage('');
    setError('');

    if (!file) {
      return;
    }

    const name = file.name || '';
    if (!/\.(xls|xlsx)$/i.test(name)) {
      return;
    }

    try {
      const preview = await previewCatalogImportFile(token, file);
      setCatalogImportPreview(preview);
      setCatalogImportMapping(preview.suggestedMapping || {});
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCatalogFileUpload = async (event) => {
    event.preventDefault();
    if (!catalogImportFile) {
      setError('Выберите файл .xls, .xlsx или .xml.');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');
    setIsFileImporting(true);

    try {
      const result = catalogImportPreview
        ? await uploadCatalogImportFileWithMapping(token, catalogImportFile, catalogImportMapping)
        : await uploadCatalogImportFile(token, catalogImportFile);
      await loadAdminData();
      setCatalogImportFile(null);
      setCatalogImportPreview(null);
      setCatalogImportMapping({});
      setCatalogImportInputKey((current) => current + 1);
      setMessage(
        `Файл обработан. Создано: ${result.created ?? 0}, обновлено: ${result.updated ?? 0}, пропущено: ${result.skipped ?? 0}.`
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsFileImporting(false);
    }
  };

  const changePreorderStatus = async (id, status) => {
    setStatusUpdateId(id);
    await safeAction(() => updatePreorderStatus(token, id, status), 'Статус предзаказа обновлен.');
    setStatusUpdateId(null);
  };

  const changeOrderStatus = async (id, status) => {
    setStatusUpdateId(id);
    await safeAction(() => updateOrderStatus(token, id, status), 'Статус заказа обновлен.');
    setStatusUpdateId(null);
  };

  const editUser = (item) => {
    setActiveTab('users');
    setEditingUserId(item.id);
    setUserForm({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      role: item.role,
      password: ''
    });
  };

  const editMarkup = (rule) => {
    setActiveTab('markups');
    setEditingMarkupId(rule.id);
    setProductMarkupForm({
      productCode: rule.productCode,
      productName: rule.productName || '',
      enabled: rule.enabled,
      mode: rule.mode,
      value: String(rule.value)
    });
  };

  const removeUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) {
      return;
    }
    await safeAction(async () => {
      await deleteAdminUser(token, id);
      if (editingUserId === id) {
        resetUserForm();
      }
    }, 'Пользователь удален.');
  };

  const removeMarkup = async (id) => {
    if (!window.confirm('Удалить правило наценки?')) {
      return;
    }
    await safeAction(async () => {
      await deleteProductMarkupRule(token, id);
      if (editingMarkupId === id) {
        resetProductMarkupForm();
      }
    }, 'Правило наценки удалено.');
  };

  const renderStatusSelect = (item, statuses, onChange) => (
    <div className="admin-actions admin-actions-wide">
      <span className={`admin-status admin-status-${item.status.toLowerCase()}`}>
        {humanizeStatus(item.status)}
      </span>
      <select
        className="filter-select"
        value={item.status}
        onChange={(event) => onChange(item.id, event.target.value)}
        disabled={statusUpdateId === item.id}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {humanizeStatus(status)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <section className="admin-page">
      <div className="admin-page-shell">
        <div className="admin-head">
          <div>
            <p className="hero-tag">Админ-панель</p>
            <h1>Управление магазином</h1>
            <p className="muted-text">Текущий администратор: {user?.fullName}.</p>
          </div>
          <div className="admin-side-actions">
            <button type="button" className="accent-button" onClick={handleCatalogSync} disabled={isSyncing}>
              {isSyncing ? 'Импортируем каталог...' : 'Загрузить из API'}
            </button>
            <div className="admin-tabs">
              {Object.entries(tabs).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  className={`ghost-button ${activeTab === tab ? 'is-active-tab' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message ? <p className="form-message admin-message is-success">{message}</p> : null}
        {error ? <p className="form-message admin-message is-error">{error}</p> : null}

        {isLoading ? (
          <div className="admin-empty">
            <h3>Загружаем данные</h3>
            <p className="muted-text">Получаем данные с сервера.</p>
          </div>
        ) : (
          <div className={`admin-layout ${activeTab === 'products' || activeTab === 'categories' || activeTab === 'brands' ? 'admin-layout-products' : ''}`}>
            {activeTab === 'imports' ? (
              <>
                <form className="admin-form-card" onSubmit={handleImportSettingsSubmit}>
                  <div className="admin-form-head">
                    <h2>Настройки импорта API</h2>
                  </div>
                  <p className="muted-text">
                    Укажите базовый URL API, access token и параметры загрузки. После этого каталог можно скачать в БД.
                  </p>
                  <label className="auth-field">
                    Базовый URL API
                    <input
                      type="url"
                      placeholder="https://api.al-style.kz"
                      value={importSettingsForm.apiBaseUrl}
                      onChange={(event) => setImportSettingsForm((current) => ({ ...current, apiBaseUrl: event.target.value }))}
                      required
                    />
                  </label>
                  <label className="auth-field">
                    Access token
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder={isImportAccessTokenConfigured ? 'Configured. Leave blank to keep current token.' : ''}
                      value={importSettingsForm.accessToken}
                      onChange={(event) => setImportSettingsForm((current) => ({ ...current, accessToken: event.target.value }))}
                      required={!isImportAccessTokenConfigured}
                    />
                  </label>
                  <div className="admin-grid-2">
                    <label className="auth-field">
                      Размер страницы
                      <input
                        type="number"
                        min="0"
                        max="250"
                        value={importSettingsForm.pageSize}
                        onChange={(event) => setImportSettingsForm((current) => ({ ...current, pageSize: event.target.value }))}
                        required
                      />
                    </label>
                    <label className="auth-field">
                      Лимит товаров на импорт
                      <input
                        type="number"
                        min="0"
                        value={importSettingsForm.maxItems}
                        onChange={(event) => setImportSettingsForm((current) => ({ ...current, maxItems: event.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <div className="admin-grid-2">
                    <label className="auth-field">
                      Интервал запросов, мс
                      <input
                        type="number"
                        min="0"
                        value={importSettingsForm.requestIntervalMs}
                        onChange={(event) => setImportSettingsForm((current) => ({ ...current, requestIntervalMs: event.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <p className="muted-text">0 в лимите импорта означает без ограничений. 0 в размере страницы использует авто-значение API.</p>
                  {importSettingsUpdatedAt ? (
                    <p className="muted-text">Последнее обновление настроек: {formatDate(importSettingsUpdatedAt)}</p>
                  ) : null}
                  <button type="submit" className="accent-button auth-submit" disabled={isSaving}>
                    {isSaving ? 'Сохраняем...' : 'Сохранить настройки'}
                  </button>
                </form>

                <div className="admin-list-card">
                  <div className="admin-form-head">
                    <h2>Импорт каталога в БД</h2>
                    <span className="muted-text">{products.length} товаров в базе</span>
                  </div>
                  <div className="admin-summary">
                    <p className="muted-text">
                      Импорт создает и обновляет товары в локальной базе. Витрина сайта берет товары уже только из БД.
                    </p>
                    <button type="button" className="accent-button auth-submit" onClick={handleCatalogSync} disabled={isSyncing}>
                      {isSyncing ? 'Импортируем...' : 'Запустить импорт'}
                    </button>
                  </div>
                </div>

                <form className="admin-list-card" onSubmit={handleCatalogFileUpload}>
                  <div className="admin-form-head">
                    <h2>Импорт из Excel/XML</h2>
                    <span className="muted-text">Upsert по коду/артикулу с обновлением цены, остатков и полей товара</span>
                  </div>
                  <div className="admin-summary">
                    <p className="muted-text">
                      Поддерживаются файлы `.xls`, `.xlsx` и `.xml`. Для Excel ожидаются колонки вроде: Код, Артикул, Категория, Производитель, Номенклатура, Дилерская KZT, Остаток.
                    </p>
                    <label className="auth-field">
                      Файл каталога
                      <input
                        key={catalogImportInputKey}
                        type="file"
                        accept=".xls,.xlsx,.xml,application/xml,text/xml"
                        onChange={(event) => handleCatalogFileSelect(event.target.files?.[0] || null)}
                        required
                      />
                    </label>
                    {catalogImportPreview ? (
                      <div className="import-mapping-panel">
                        <div className="admin-form-head">
                          <h3>Mapping колонок</h3>
                          <span className="muted-text">Строка заголовков: {catalogImportPreview.headerRowIndex + 1}</span>
                        </div>
                        <div className="import-mapping-grid">
                          {Object.entries(catalogImportPreview.fieldLabels || {}).map(([field, label]) => (
                            <label key={field} className="auth-field">
                              {label}
                              <select
                                className="filter-select"
                                value={catalogImportMapping[field] || ''}
                                onChange={(event) => setCatalogImportMapping((current) => ({
                                  ...current,
                                  [field]: event.target.value
                                }))}
                              >
                                <option value="">Не импортировать</option>
                                {(catalogImportPreview.columns || []).map((column) => (
                                  <option key={`${field}-${column}`} value={column}>{column}</option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>
                        {(catalogImportPreview.previewRows || []).length > 0 ? (
                          <div className="import-preview-table-wrap">
                            <table className="import-preview-table">
                              <thead>
                                <tr>
                                  {(catalogImportPreview.columns || []).slice(0, 8).map((column) => (
                                    <th key={column}>{column}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {catalogImportPreview.previewRows.map((row, rowIndex) => (
                                  <tr key={`preview-${rowIndex}`}>
                                    {(catalogImportPreview.columns || []).slice(0, 8).map((column) => (
                                      <td key={`${rowIndex}-${column}`}>{row[column] || ''}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <button type="submit" className="accent-button auth-submit" disabled={isFileImporting}>
                      {isFileImporting ? 'Загружаем файл...' : 'Загрузить файл'}
                    </button>
                  </div>
                </form>
              </>
            ) : null}

            {activeTab === 'products' ? (
              <ProductManagementPanel
                products={products}
                categories={categories}
                brands={brands}
                token={token}
                setMessage={setMessage}
                setError={setError}
                refreshAdminData={loadAdminData}
              />
            ) : null}

            {activeTab === 'brands' ? (
              <BrandManagementPanel
                brands={brands}
                token={token}
                setMessage={setMessage}
                setError={setError}
                refreshAdminData={loadAdminData}
              />
            ) : null}

            {activeTab === 'categories' ? (
              <CategoryManagementPanel
                categories={categories}
                token={token}
                setMessage={setMessage}
                setError={setError}
                refreshAdminData={loadAdminData}
              />
            ) : null}

            {activeTab === 'markups' ? (
              <>
                <form className="admin-form-card" onSubmit={handleMarkupSettingsSubmit}>
                  <div className="admin-form-head"><h2>Общая наценка</h2></div>
                  <p className="muted-text">Работает на весь каталог из БД. Индивидуальное правило по товару имеет приоритет.</p>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={markupSettingsForm.enabled}
                      onChange={(event) => setMarkupSettingsForm((current) => ({ ...current, enabled: event.target.checked }))}
                    />
                    <span>Включить общую наценку</span>
                  </label>
                  <div className="admin-grid-2">
                    <label className="auth-field">
                      Режим
                      <select
                        className="filter-select"
                        value={markupSettingsForm.mode}
                        onChange={(event) => setMarkupSettingsForm((current) => ({ ...current, mode: event.target.value }))}
                      >
                        {markupModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <label className="auth-field">
                      Значение
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={markupSettingsForm.value}
                        onChange={(event) => setMarkupSettingsForm((current) => ({ ...current, value: event.target.value }))}
                        required
                      />
                    </label>
                  </div>
                  <button type="submit" className="accent-button auth-submit" disabled={isSaving}>
                    {isSaving ? 'Сохраняем...' : 'Сохранить общую наценку'}
                  </button>
                </form>

                <div className="admin-list-card">
                  <div className="admin-form-head">
                    <h2>{editingMarkupId ? 'Редактировать наценку товара' : 'Индивидуальная наценка товара'}</h2>
                    {editingMarkupId ? <button type="button" className="ghost-button" onClick={resetProductMarkupForm}>Сбросить</button> : null}
                  </div>
                  <form className="admin-summary" onSubmit={handleProductMarkupSubmit}>
                    <div className="admin-grid-2">
                      <label className="auth-field">
                        Product code
                        <input
                          type="text"
                          value={productMarkupForm.productCode}
                          onChange={(event) => setProductMarkupForm((current) => ({ ...current, productCode: event.target.value.toUpperCase() }))}
                          required
                        />
                      </label>
                      <label className="auth-field">
                        Название
                        <input
                          type="text"
                          value={productMarkupForm.productName}
                          onChange={(event) => setProductMarkupForm((current) => ({ ...current, productName: event.target.value }))}
                        />
                      </label>
                    </div>
                    <div className="admin-grid-2">
                      <label className="auth-field">
                        Режим
                        <select
                          className="filter-select"
                          value={productMarkupForm.mode}
                          onChange={(event) => setProductMarkupForm((current) => ({ ...current, mode: event.target.value }))}
                        >
                          {markupModes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                        </select>
                      </label>
                      <label className="auth-field">
                        Значение
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={productMarkupForm.value}
                          onChange={(event) => setProductMarkupForm((current) => ({ ...current, value: event.target.value }))}
                          required
                        />
                      </label>
                    </div>
                    <label className="filter-option">
                      <input
                        type="checkbox"
                        checked={productMarkupForm.enabled}
                        onChange={(event) => setProductMarkupForm((current) => ({ ...current, enabled: event.target.checked }))}
                      />
                      <span>Включить правило</span>
                    </label>
                    <button type="submit" className="accent-button auth-submit" disabled={isSaving}>
                      {isSaving ? 'Сохраняем...' : editingMarkupId ? 'Обновить наценку' : 'Добавить наценку'}
                    </button>
                  </form>

                  <div className="admin-form-head"><h2>Правила по товарам</h2><span className="muted-text">{markupRules.length} правил</span></div>
                  {markupRules.length === 0 ? (
                    <div className="admin-empty compact">
                      <h3>Правил пока нет</h3>
                      <p className="muted-text">Добавьте правило по `productCode`.</p>
                    </div>
                  ) : (
                    <div className="admin-list">
                      {markupRules.map((rule) => (
                        <div key={rule.id} className="admin-item">
                          <div className="admin-item-main">
                            <p className="admin-item-title">{rule.productName || 'Без названия'} ({rule.productCode})</p>
                            <p className="muted-text">{rule.enabled ? 'Активна' : 'Выключена'} • {modeLabel(rule.mode)} • {formatPrice(rule.value)}{rule.mode === 'PERCENT' ? '%' : ' KZT'}</p>
                            <p className="muted-text">Обновлено: {formatDate(rule.updatedAt)}</p>
                          </div>
                          <div className="admin-actions">
                            <button type="button" className="ghost-button" onClick={() => editMarkup(rule)}>Изменить</button>
                            <button type="button" className="ghost-button" onClick={() => removeMarkup(rule.id)}>Удалить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {activeTab === 'users' ? (
              <>
                <form className="admin-form-card" onSubmit={handleUserSubmit}>
                  <div className="admin-form-head">
                    <h2>{editingUserId ? 'Редактировать пользователя' : 'Новый пользователь'}</h2>
                    {editingUserId ? <button type="button" className="ghost-button" onClick={resetUserForm}>Сбросить</button> : null}
                  </div>
                  <label className="auth-field">
                    Имя
                    <input type="text" value={userForm.fullName} onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))} required />
                  </label>
                  <label className="auth-field">
                    Email
                    <input type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} required />
                  </label>
                  <label className="auth-field">
                    Телефон
                    <input type="tel" value={userForm.phone} onChange={(event) => setUserForm((current) => ({ ...current, phone: event.target.value }))} required />
                  </label>
                  <div className="admin-grid-2">
                    <label className="auth-field">
                      Роль
                      <select className="filter-select" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </label>
                    <label className="auth-field">
                      {editingUserId ? 'Новый пароль' : 'Пароль'}
                      <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} required={!editingUserId} />
                    </label>
                  </div>
                  <button type="submit" className="accent-button auth-submit" disabled={isSaving}>
                    {isSaving ? 'Сохраняем...' : editingUserId ? 'Обновить пользователя' : 'Создать пользователя'}
                  </button>
                </form>

                <div className="admin-list-card">
                  <div className="admin-form-head"><h2>Пользователи</h2><span className="muted-text">{users.length} записей</span></div>
                  <div className="admin-list">
                    {users.map((item) => (
                      <div key={item.id} className="admin-item">
                        <div className="admin-item-main">
                          <p className="admin-item-title">{item.fullName}</p>
                          <p className="muted-text">{item.email} • {item.phone}</p>
                          <p className="muted-text">{item.role} • создан {formatDate(item.createdAt)}</p>
                        </div>
                        <div className="admin-actions">
                          <button type="button" className="ghost-button" onClick={() => editUser(item)}>Изменить</button>
                          <button type="button" className="ghost-button" onClick={() => removeUser(item.id)} disabled={item.email === user?.email}>Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {activeTab === 'preorders' ? (
              <>
                <div className="admin-form-card admin-side-panel"><div className="admin-form-head"><h2>Предзаказы</h2></div><p className="muted-text">Всего: {preorders.length}</p></div>
                <div className="admin-list-card">
                  {preorders.length === 0 ? (
                    <div className="admin-empty compact"><h3>Предзаказов пока нет</h3></div>
                  ) : (
                    <div className="admin-list">
                      {preorders.map((item) => (
                        <div key={item.id} className="admin-item admin-item-stack">
                          <div className="admin-item-main">
                            <p className="admin-item-title">{item.productName}</p>
                            <p className="muted-text">Клиент: {item.contactName} • {item.contactEmail} • {item.contactPhone}</p>
                            <p className="muted-text">Код: {item.productCode} • Пользователь: {item.userEmail || 'гость'}</p>
                            {item.comment ? <p className="admin-preorder-comment">{item.comment}</p> : null}
                          </div>
                          {renderStatusSelect(item, preorderStatuses, changePreorderStatus)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {activeTab === 'orders' ? (
              <>
                <div className="admin-form-card admin-side-panel"><div className="admin-form-head"><h2>Заказы</h2></div><p className="muted-text">Всего: {orders.length}</p></div>
                <div className="admin-list-card">
                  {orders.length === 0 ? (
                    <div className="admin-empty compact"><h3>Заказов пока нет</h3></div>
                  ) : (
                    <div className="admin-list">
                      {orders.map((order) => (
                        <div key={order.id} className="admin-item admin-item-stack">
                          <div className="admin-item-main">
                            <p className="admin-item-title">Заказ #{order.id} • {formatPrice(order.totalAmount)} KZT</p>
                            <p className="muted-text">Клиент: {order.firstName} {order.lastName || ''} • {order.phone}</p>
                            <div className="admin-order-items">
                              {order.items.map((item) => (
                                <p key={`${order.id}-${item.productCode}`} className="muted-text">{item.productName} ({item.productCode}) • {item.quantity} шт. • {formatPrice(item.lineTotal)} KZT</p>
                              ))}
                            </div>
                            {order.comment ? <p className="admin-preorder-comment">{order.comment}</p> : null}
                          </div>
                          {renderStatusSelect(order, orderStatuses, changeOrderStatus)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminPage;

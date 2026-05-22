import { useMemo, useState } from 'react';
import {
  createAdminBrand,
  deleteAdminBrand,
  updateAdminBrand
} from '../../services/adminApi';

const initialBrandForm = {
  name: '',
  description: '',
  sortOrder: '0'
};

function normalizeBrandName(value) {
  return value.trim().replace(/\s{2,}/g, ' ');
}

function normalizeBrandForm(form) {
  return {
    name: normalizeBrandName(form.name),
    description: form.description.trim(),
    sortOrder: String(form.sortOrder).trim()
  };
}

function validateBrandForm(form, brands, editingBrand) {
  const normalized = normalizeBrandForm(form);
  const errors = {};
  const sortOrder = Number(normalized.sortOrder);

  if (normalized.name.length < 2) {
    errors.name = 'Минимум 2 символа.';
  }

  if (normalized.description.length > 180) {
    errors.description = 'Описание должно быть не длиннее 180 символов.';
  }

  if (!Number.isInteger(sortOrder)) {
    errors.sortOrder = 'Порядок должен быть целым числом.';
  }

  const duplicateBrand = brands.find((brand) => (
    brand.id !== editingBrand?.id &&
    normalizeBrandName(brand.name || '').toLowerCase() === normalized.name.toLowerCase()
  ));

  if (normalized.name.length >= 2 && duplicateBrand) {
    errors.name = 'Бренд с таким названием уже существует.';
  }

  return errors;
}

function createFormFromBrand(brand) {
  if (!brand) {
    return initialBrandForm;
  }

  return {
    name: brand.name || '',
    description: brand.description || '',
    sortOrder: String(brand.sortOrder ?? 0)
  };
}

function BrandManagementPanel({ brands, token, setMessage, setError, refreshAdminData }) {
  const [query, setQuery] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState(initialBrandForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const brandErrors = useMemo(
    () => validateBrandForm(brandForm, brands, editingBrand),
    [brandForm, brands, editingBrand]
  );
  const filteredBrands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return brands;
    }

    return brands.filter((brand) => (
      [brand.name, brand.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    ));
  }, [brands, query]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setBrandForm(initialBrandForm);
    setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setBrandForm(createFormFromBrand(brand));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setBrandForm(initialBrandForm);
  };

  const handleFieldChange = (field, value) => {
    setBrandForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (Object.keys(brandErrors).length > 0) {
      return;
    }

    const payload = {
      ...normalizeBrandForm(brandForm),
      sortOrder: Number(brandForm.sortOrder || 0)
    };

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      if (editingBrand) {
        await updateAdminBrand(token, editingBrand.id, payload);
      } else {
        await createAdminBrand(token, payload);
      }
      await refreshAdminData();
      setMessage(editingBrand ? 'Бренд обновлен.' : 'Бренд создан.');
      closeModal();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Удалить бренд "${brand.name}"?`)) {
      return;
    }

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await deleteAdminBrand(token, brand.id);
      await refreshAdminData();
      setMessage('Бренд удален.');
      if (editingBrand?.id === brand.id) {
        closeModal();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="admin-category-panel">
        <div className="admin-category-panel-head">
          <div>
            <p className="hero-tag">Бренды</p>
            <h2>Управление брендами товаров</h2>
            <p className="muted-text">
              Бренды доступны в карточке товара, а при переименовании или удалении автоматически обновляются у всех продуктов.
            </p>
          </div>
          <button type="button" className="accent-button" onClick={openCreateModal}>
            Новый бренд
          </button>
        </div>

        <div className="admin-category-stats">
          <div className="admin-category-stat-card">
            <span>Всего брендов</span>
            <strong>{brands.length}</strong>
          </div>
          <div className="admin-category-stat-card">
            <span>Поиск</span>
            <strong>{filteredBrands.length}</strong>
          </div>
          <div className="admin-category-stat-card">
            <span>По умолчанию</span>
            <strong>{brands.some((brand) => brand.name === 'Без бренда') ? 'Есть' : 'Нет'}</strong>
          </div>
        </div>

        <div className="admin-list-card">
          <div className="admin-products-toolbar">
            <label className="auth-field admin-products-search">
              Поиск по брендам
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Название или описание"
              />
            </label>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="admin-empty compact">
              <h3>Бренды не найдены</h3>
              <p className="muted-text">Измените запрос или создайте новый бренд.</p>
            </div>
          ) : (
            <div className="admin-category-grid">
              {filteredBrands.map((brand) => (
                <article key={brand.id} className="admin-category-card">
                  <div className="admin-category-card-head">
                    <div>
                      <p className="admin-item-title">{brand.name}</p>
                      <p className="muted-text">Порядок: {brand.sortOrder}</p>
                    </div>
                    <span className="admin-category-visibility is-visible">Активен</span>
                  </div>

                  <p className="muted-text admin-category-description">
                    {brand.description || 'Описание не указано.'}
                  </p>

                  <div className="admin-actions">
                    <button type="button" className="ghost-button" onClick={() => openEditModal(brand)}>
                      Изменить
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleDelete(brand)}>
                      Удалить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen ? (
        <div className="admin-category-modal-backdrop" onClick={closeModal}>
          <div className="admin-category-modal" onClick={(event) => event.stopPropagation()}>
            <div className="admin-form-head">
              <div>
                <h2>{editingBrand ? 'Редактировать бренд' : 'Новый бренд'}</h2>
                <p className="muted-text">Бренд используется во всех товарах и в форме редактирования продукта.</p>
              </div>
              <button type="button" className="ghost-button" onClick={closeModal} disabled={isSaving}>
                Закрыть
              </button>
            </div>

            <form className="admin-category-form" onSubmit={handleSave}>
              <label className="auth-field">
                Название *
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                  required
                />
                {brandErrors.name ? <span className="admin-field-error">{brandErrors.name}</span> : null}
              </label>

              <label className="auth-field">
                Короткое описание
                <textarea
                  className="admin-textarea admin-category-textarea"
                  value={brandForm.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                />
                {brandErrors.description ? <span className="admin-field-error">{brandErrors.description}</span> : null}
              </label>

              <label className="auth-field">
                Порядок
                <input
                  type="number"
                  step="1"
                  value={brandForm.sortOrder}
                  onChange={(event) => handleFieldChange('sortOrder', event.target.value)}
                />
                {brandErrors.sortOrder ? <span className="admin-field-error">{brandErrors.sortOrder}</span> : null}
              </label>

              <div className="admin-detail-actions">
                <button
                  type="submit"
                  className="accent-button"
                  disabled={isSaving || Object.keys(brandErrors).length > 0}
                >
                  {isSaving ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button type="button" className="ghost-button" onClick={closeModal} disabled={isSaving}>
                  Отменить
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default BrandManagementPanel;

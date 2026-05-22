import { useMemo, useState } from 'react';
import {
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory
} from '../../services/adminApi';

const initialCategoryForm = {
  name: '',
  description: '',
  visible: true,
  featured: false,
  sortOrder: '0'
};

function normalizeCategoryForm(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    visible: Boolean(form.visible),
    featured: Boolean(form.featured),
    sortOrder: String(form.sortOrder).trim()
  };
}

function validateCategoryForm(form) {
  const normalized = normalizeCategoryForm(form);
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

  return errors;
}

function createFormFromCategory(category) {
  if (!category) {
    return initialCategoryForm;
  }

  return {
    name: category.name || '',
    description: category.description || '',
    visible: Boolean(category.visible),
    featured: Boolean(category.featured),
    sortOrder: String(category.sortOrder ?? 0)
  };
}

function CategoryManagementPanel({ categories, token, setMessage, setError, refreshAdminData }) {
  const [query, setQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryErrors = useMemo(() => validateCategoryForm(categoryForm), [categoryForm]);
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) => (
      [category.name, category.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    ));
  }, [categories, query]);

  const featuredCount = useMemo(
    () => categories.filter((category) => category.featured && category.visible).length,
    [categories]
  );
  const hiddenCount = useMemo(
    () => categories.filter((category) => !category.visible).length,
    [categories]
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryForm(initialCategoryForm);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryForm(createFormFromCategory(category));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryForm(initialCategoryForm);
  };

  const handleFieldChange = (field, value) => {
    setCategoryForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (Object.keys(categoryErrors).length > 0) {
      return;
    }

    const payload = {
      ...normalizeCategoryForm(categoryForm),
      sortOrder: Number(categoryForm.sortOrder || 0)
    };

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      if (editingCategory) {
        await updateAdminCategory(token, editingCategory.id, payload);
      } else {
        await createAdminCategory(token, payload);
      }
      await refreshAdminData();
      setMessage(editingCategory ? 'Категория обновлена.' : 'Категория создана.');
      closeModal();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Удалить категорию "${category.name}"?`)) {
      return;
    }

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      await deleteAdminCategory(token, category.id);
      await refreshAdminData();
      setMessage('Категория удалена.');
      if (editingCategory?.id === category.id) {
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
            <p className="hero-tag">Категории</p>
            <h2>Управление витриной категорий</h2>
            <p className="muted-text">
              Здесь настраиваются категории для header, каталога и быстрого перехода по разделам.
            </p>
          </div>
          <button type="button" className="accent-button" onClick={openCreateModal}>
            Новая категория
          </button>
        </div>

        <div className="admin-category-stats">
          <div className="admin-category-stat-card">
            <span>Всего</span>
            <strong>{categories.length}</strong>
          </div>
          <div className="admin-category-stat-card">
            <span>Избранные</span>
            <strong>{featuredCount}</strong>
          </div>
          <div className="admin-category-stat-card">
            <span>Скрытые</span>
            <strong>{hiddenCount}</strong>
          </div>
        </div>

        <div className="admin-list-card">
          <div className="admin-products-toolbar">
            <label className="auth-field admin-products-search">
              Поиск по категориям
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Название или описание"
              />
            </label>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="admin-empty compact">
              <h3>Категории не найдены</h3>
              <p className="muted-text">Измените запрос или создайте новую категорию.</p>
            </div>
          ) : (
            <div className="admin-category-grid">
              {filteredCategories.map((category) => (
                <article key={category.id} className={`admin-category-card ${category.visible ? '' : 'is-hidden'}`}>
                  <div className="admin-category-card-head">
                    <div>
                      <p className="admin-item-title">{category.name}</p>
                      <p className="muted-text">
                        Порядок: {category.sortOrder} · {category.featured ? 'избранная' : 'обычная'}
                      </p>
                    </div>
                    <span className={`admin-category-visibility ${category.visible ? 'is-visible' : 'is-hidden'}`}>
                      {category.visible ? 'Видна' : 'Скрыта'}
                    </span>
                  </div>

                  <p className="muted-text admin-category-description">
                    {category.description || 'Описание не указано.'}
                  </p>

                  <div className="admin-actions">
                    <button type="button" className="ghost-button" onClick={() => openEditModal(category)}>
                      Изменить
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleDelete(category)}>
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
                <h2>{editingCategory ? 'Редактировать категорию' : 'Новая категория'}</h2>
                <p className="muted-text">
                  Категория управляет отображением разделов в header и публичной навигации.
                </p>
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
                  value={categoryForm.name}
                  onChange={(event) => handleFieldChange('name', event.target.value)}
                  required
                />
                {categoryErrors.name ? <span className="admin-field-error">{categoryErrors.name}</span> : null}
              </label>

              <label className="auth-field">
                Короткое описание
                <textarea
                  className="admin-textarea admin-category-textarea"
                  value={categoryForm.description}
                  onChange={(event) => handleFieldChange('description', event.target.value)}
                />
                {categoryErrors.description ? (
                  <span className="admin-field-error">{categoryErrors.description}</span>
                ) : null}
              </label>

              <div className="admin-grid-2">
                <label className="auth-field">
                  Порядок
                  <input
                    type="number"
                    step="1"
                    value={categoryForm.sortOrder}
                    onChange={(event) => handleFieldChange('sortOrder', event.target.value)}
                  />
                  {categoryErrors.sortOrder ? (
                    <span className="admin-field-error">{categoryErrors.sortOrder}</span>
                  ) : null}
                </label>
                <div className="admin-category-checkboxes">
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={categoryForm.visible}
                      onChange={(event) => handleFieldChange('visible', event.target.checked)}
                    />
                    <span>Показывать на витрине</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={categoryForm.featured}
                      onChange={(event) => handleFieldChange('featured', event.target.checked)}
                    />
                    <span>Показывать в главной группе header</span>
                  </label>
                </div>
              </div>

              <div className="admin-detail-actions">
                <button
                  type="submit"
                  className="accent-button"
                  disabled={isSaving || Object.keys(categoryErrors).length > 0}
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

export default CategoryManagementPanel;

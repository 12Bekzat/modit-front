export const allowedCatalogCategories = [
  'Мобильные телефоны и аксессуары',
  'Планшеты',
  'Смарт часы и браслеты',
  'Компьютеры и комплектующие',
  'Наушники и микрофоны',
  'Акустические системы',
  'Телевизоры и аксессуары',
  'Системы автономного электроснабжения',
  'Элементы питания',
  'Мультимедиа устройства',
  'Носители информации',
  'Сетевое и серверное оборудование, СХД',
  'Кабельные системы',
  'Системы безопасности'
];

const categoryDescriptions = {
  'Мобильные телефоны и аксессуары': 'Смартфоны, телефоны и полезные аксессуары',
  Планшеты: 'Планшеты для работы, учебы и развлечений',
  'Смарт часы и браслеты': 'Носимые устройства и фитнес-трекеры',
  'Компьютеры и комплектующие': 'ПК, ноутбуки, комплектующие и периферия',
  'Наушники и микрофоны': 'Персональный звук и устройства связи',
  'Акустические системы': 'Колонки, саундбары и аудиосистемы',
  'Телевизоры и аксессуары': 'Телевизоры, крепления и ТВ-аксессуары',
  'Системы автономного электроснабжения': 'ИБП, инверторы и автономное питание',
  'Элементы питания': 'Батарейки, аккумуляторы и зарядные решения',
  'Мультимедиа устройства': 'Медиаплееры, приставки и презентационное оборудование',
  'Носители информации': 'Накопители, карты памяти и внешние диски',
  'Сетевое и серверное оборудование, СХД': 'Сети, серверы и системы хранения данных',
  'Кабельные системы': 'Кабели, разъемы и коммутационные решения',
  'Системы безопасности': 'Видеонаблюдение, контроль доступа и сигнализация'
};

const allowedCategorySet = new Set(allowedCatalogCategories);

function normalizeCategoryName(value) {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim().replace(/\s{2,}/g, ' ');
  return normalized || null;
}

export function filterAllowedCategoryNames(values = []) {
  const incoming = new Set(
    values
      .map(normalizeCategoryName)
      .filter((item) => item && allowedCategorySet.has(item))
  );

  return allowedCatalogCategories.filter((item) => incoming.has(item));
}

export function sanitizeCategorySelection(values = []) {
  return filterAllowedCategoryNames(values);
}

export function buildAllowedCategoryNavigation(categories = []) {
  const categoryByName = new Map(
    categories
      .filter((item) => item && item.name)
      .map((item) => [normalizeCategoryName(item.name), item])
  );

  return allowedCatalogCategories.map((name, index) => {
    const category = categoryByName.get(name);

    return {
      id: category?.id ?? `allowed-category-${index}`,
      name,
      description: category?.description || categoryDescriptions[name] || 'Перейти в каталог',
      featured: index < 4,
      visible: true,
      sortOrder: index
    };
  });
}

export function buildAllowedCategoryCards(categories = [], tones = []) {
  return buildAllowedCategoryNavigation(categories).map((item, index) => ({
    title: item.name,
    subtitle: item.description,
    tone: tones.length > 0 ? tones[index % tones.length] : 'sun'
  }));
}

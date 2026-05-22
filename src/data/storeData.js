export const navLinks = [
  'Смартфоны',
  'Ноутбуки',
  'Телевизоры',
  'Крупная техника',
  'Гаджеты',
  'Дом и ремонт',
  'Акции'
];

export const categoryCards = [
  { title: 'Смартфоны', subtitle: 'Хиты 2026', tone: 'sun' },
  { title: 'Ноутбуки', subtitle: 'Для работы и игр', tone: 'mint' },
  { title: 'Телевизоры', subtitle: '4K и OLED', tone: 'ink' },
  { title: 'Наушники', subtitle: 'Шумоподавление', tone: 'peach' },
  { title: 'Пылесосы', subtitle: 'Умная уборка', tone: 'sand' },
  { title: 'Кофемашины', subtitle: 'Домашний бариста', tone: 'berry' },
  { title: 'Смарт-часы', subtitle: 'Спорт и стиль', tone: 'sky' },
  { title: 'Игровые консоли', subtitle: 'Новое поколение', tone: 'lime' }
];

export const promoCards = [
  {
    title: 'Месяц выгодных цен',
    text: 'Ежедневные скидки на технику для дома и офиса.',
    tag: 'До -35%',
    to: '/products?sort=price-desc'
  },
  {
    title: 'Рассрочка 0-0-12',
    text: 'Забирайте технику сейчас, платите частями.',
    tag: 'Без переплат',
    to: '/business'
  },
  {
    title: 'Сервис за 1 день',
    text: 'Установка и настройка прямо в день покупки.',
    tag: 'Экспресс',
    to: '/business'
  }
];

export const products = [
  {
    name: 'Нова X9 Про 256 ГБ',
    price: '249 990 KZT',
    oldPrice: '289 990 KZT',
    tag: 'Новинка',
    rating: '4.8/5',
    delivery: 'Доставка завтра'
  },
  {
    name: 'ЭйрСаунд Студио Макс',
    price: '129 990 KZT',
    oldPrice: '149 990 KZT',
    tag: 'Хит',
    rating: '4.9/5',
    delivery: 'Самовывоз сегодня'
  },
  {
    name: 'Вижн 55 OLED',
    price: '399 990 KZT',
    oldPrice: '459 990 KZT',
    tag: 'Лучшая цена',
    rating: '4.7/5',
    delivery: 'Доставка 2-3 дня'
  },
  {
    name: 'КлинБот S12',
    price: '179 990 KZT',
    oldPrice: '199 990 KZT',
    tag: 'Суперсила',
    rating: '4.6/5',
    delivery: 'Доставка завтра'
  },
  {
    name: 'ПалсБук 14 Эйр',
    price: '319 990 KZT',
    oldPrice: '349 990 KZT',
    tag: 'Выбор профи',
    rating: '4.8/5',
    delivery: 'Самовывоз сегодня'
  },
  {
    name: 'ХоумКул 12',
    price: '269 990 KZT',
    oldPrice: '299 990 KZT',
    tag: 'Сезон',
    rating: '4.5/5',
    delivery: 'Доставка 2-3 дня'
  },
  {
    name: 'ГеймБокс Нео',
    price: '229 990 KZT',
    oldPrice: '249 990 KZT',
    tag: 'Гейминг',
    rating: '4.9/5',
    delivery: 'Доставка завтра'
  },
  {
    name: 'СмартШеф Про',
    price: '139 990 KZT',
    oldPrice: '159 990 KZT',
    tag: 'Новинка',
    rating: '4.6/5',
    delivery: 'Самовывоз сегодня'
  }
];

export const perks = [
  {
    title: 'Экспресс доставка',
    text: 'В крупных городах за 24 часа.'
  },
  {
    title: 'Гарантия и сервис',
    text: 'Официальные бренды и поддержка.'
  },
  {
    title: 'Бонусная программа',
    text: 'Копите и тратьте бонусы.'
  },
  {
    title: 'Установка под ключ',
    text: 'Монтаж и настройка техники.'
  }
];

export const storeStats = [
  { label: '350+ брендов', value: 'Под рукой' },
  { label: '1200 пунктов', value: 'Самовывоза' },
  { label: '24/7 поддержка', value: 'Всегда рядом' }
];

export const filterChips = [
  { label: 'Сегодня', params: { delivery: 'сегодня' } },
  { label: 'Неделя', params: { sort: 'popular' } },
  { label: 'Хиты', params: { search: 'Хит' } },
  { label: 'Премиум', params: { search: 'Премиум' } }
];

export const drawerBuyerLinks = [
  { label: 'Заказы', to: '/profile' },
  { label: 'Избранное', to: '/products?ratingMin=4.5' },
  { label: 'Сравнение', to: '/products?sort=rating' },
  { label: 'Бонусы', to: '/profile' },
  { label: 'Сервис', to: '/business' }
];

export const footerCatalogLinks = ['Смартфоны', 'Ноутбуки', 'Техника для кухни', 'Игровые решения'];

export const footerBuyerLinks = [
  { label: 'Доставка и оплата', to: '/business' },
  { label: 'Гарантия', to: '/business' },
  { label: 'Возврат', to: '/business' },
  { label: 'Бонусы', to: '/profile' }
];

export const footerContacts = ['+7 707 000 00 00', 'support@technonord.kz', '09:00 - 23:00'];

export const catalogCategories = [
  'Смартфоны',
  'Планшеты',
  'Ноутбуки',
  'Телевизоры',
  'Аудио',
  'Кухня',
  'Умный дом',
  'Игровые решения',
  'Бытовая техника'
];

export const catalogBrands = [
  'Нова',
  'Вижн',
  'Пульс',
  'ЭйрСаунд',
  'КлинБот',
  'СмартШеф',
  'ГеймБокс',
  'Орион',
  'ТехноНорд'
];

export const catalogProducts = [
  {
    id: 1,
    name: 'Нова X9 Про 256 ГБ',
    category: 'Смартфоны',
    brand: 'Нова',
    price: 249990,
    oldPrice: 289990,
    rating: 4.8,
    inStock: true,
    delivery: 'завтра',
    tag: 'Новинка'
  },
  {
    id: 2,
    name: 'Нова Лайт 128 ГБ',
    category: 'Смартфоны',
    brand: 'Нова',
    price: 139990,
    oldPrice: 159990,
    rating: 4.6,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Хит'
  },
  {
    id: 3,
    name: 'Вижн 55 OLED',
    category: 'Телевизоры',
    brand: 'Вижн',
    price: 399990,
    oldPrice: 459990,
    rating: 4.7,
    inStock: true,
    delivery: '2-3 дня',
    tag: 'Лучшая цена'
  },
  {
    id: 4,
    name: 'Вижн 65 QLED',
    category: 'Телевизоры',
    brand: 'Вижн',
    price: 499990,
    oldPrice: 549990,
    rating: 4.8,
    inStock: false,
    delivery: '3-5 дней',
    tag: 'Премиум'
  },
  {
    id: 5,
    name: 'ПульсБук 14 Эйр',
    category: 'Ноутбуки',
    brand: 'Пульс',
    price: 319990,
    oldPrice: 349990,
    rating: 4.8,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Выбор профи'
  },
  {
    id: 6,
    name: 'ПульсБук 16 Студия',
    category: 'Ноутбуки',
    brand: 'Пульс',
    price: 429990,
    oldPrice: 479990,
    rating: 4.9,
    inStock: true,
    delivery: 'завтра',
    tag: 'Премиум'
  },
  {
    id: 7,
    name: 'КлинБот S12',
    category: 'Бытовая техника',
    brand: 'КлинБот',
    price: 179990,
    oldPrice: 199990,
    rating: 4.6,
    inStock: true,
    delivery: 'завтра',
    tag: 'Суперсила'
  },
  {
    id: 8,
    name: 'ХоумКул 12',
    category: 'Бытовая техника',
    brand: 'Орион',
    price: 269990,
    oldPrice: 299990,
    rating: 4.5,
    inStock: true,
    delivery: '2-3 дня',
    tag: 'Сезон'
  },
  {
    id: 9,
    name: 'СмартШеф Про',
    category: 'Кухня',
    brand: 'СмартШеф',
    price: 139990,
    oldPrice: 159990,
    rating: 4.6,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Новинка'
  },
  {
    id: 10,
    name: 'СмартШеф Мини',
    category: 'Кухня',
    brand: 'СмартШеф',
    price: 89990,
    oldPrice: 99990,
    rating: 4.4,
    inStock: true,
    delivery: 'завтра',
    tag: 'Компакт'
  },
  {
    id: 11,
    name: 'ГеймБокс Нео',
    category: 'Игровые решения',
    brand: 'ГеймБокс',
    price: 229990,
    oldPrice: 249990,
    rating: 4.9,
    inStock: true,
    delivery: 'завтра',
    tag: 'Гейминг'
  },
  {
    id: 12,
    name: 'ГеймБокс Порт',
    category: 'Игровые решения',
    brand: 'ГеймБокс',
    price: 159990,
    oldPrice: 179990,
    rating: 4.7,
    inStock: true,
    delivery: '2-3 дня',
    tag: 'Портатив'
  },
  {
    id: 13,
    name: 'ЭйрСаунд Студио Макс',
    category: 'Аудио',
    brand: 'ЭйрСаунд',
    price: 129990,
    oldPrice: 149990,
    rating: 4.9,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Хит'
  },
  {
    id: 14,
    name: 'ЭйрСаунд Лайт',
    category: 'Аудио',
    brand: 'ЭйрСаунд',
    price: 69990,
    oldPrice: 79990,
    rating: 4.5,
    inStock: false,
    delivery: '3-5 дней',
    tag: 'Легкость'
  },
  {
    id: 15,
    name: 'СмартДом Хаб 2',
    category: 'Умный дом',
    brand: 'ТехноНорд',
    price: 59990,
    oldPrice: 69990,
    rating: 4.4,
    inStock: true,
    delivery: 'сегодня',
    tag: 'База'
  },
  {
    id: 16,
    name: 'СмартДом Камера 4K',
    category: 'Умный дом',
    brand: 'ТехноНорд',
    price: 74990,
    oldPrice: 89990,
    rating: 4.6,
    inStock: true,
    delivery: 'завтра',
    tag: 'Безопасность'
  },
  {
    id: 17,
    name: 'Нова Таб 11',
    category: 'Планшеты',
    brand: 'Нова',
    price: 189990,
    oldPrice: 209990,
    rating: 4.5,
    inStock: true,
    delivery: '2-3 дня',
    tag: 'Универсал'
  },
  {
    id: 18,
    name: 'Вижн 32 Smart',
    category: 'Телевизоры',
    brand: 'Вижн',
    price: 189990,
    oldPrice: 209990,
    rating: 4.3,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Компакт'
  },
  {
    id: 19,
    name: 'ПульсБук 13 Слим',
    category: 'Ноутбуки',
    brand: 'Пульс',
    price: 259990,
    oldPrice: 289990,
    rating: 4.5,
    inStock: true,
    delivery: 'завтра',
    tag: 'Тонкий'
  },
  {
    id: 20,
    name: 'КлинБот Слим',
    category: 'Бытовая техника',
    brand: 'КлинБот',
    price: 129990,
    oldPrice: 149990,
    rating: 4.3,
    inStock: false,
    delivery: '3-5 дней',
    tag: 'Мини'
  },
  {
    id: 21,
    name: 'Орион Вэйв 2',
    category: 'Аудио',
    brand: 'Орион',
    price: 99990,
    oldPrice: 119990,
    rating: 4.4,
    inStock: true,
    delivery: '2-3 дня',
    tag: 'Баланс'
  },
  {
    id: 22,
    name: 'СмартДом Свет',
    category: 'Умный дом',
    brand: 'ТехноНорд',
    price: 19990,
    oldPrice: 24990,
    rating: 4.2,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Уют'
  },
  {
    id: 23,
    name: 'ПульсБук 15 Про',
    category: 'Ноутбуки',
    brand: 'Пульс',
    price: 359990,
    oldPrice: 399990,
    rating: 4.7,
    inStock: true,
    delivery: 'завтра',
    tag: 'Мощность'
  },
  {
    id: 24,
    name: 'Нова X9 Мини',
    category: 'Смартфоны',
    brand: 'Нова',
    price: 119990,
    oldPrice: 139990,
    rating: 4.4,
    inStock: true,
    delivery: 'сегодня',
    tag: 'Компакт'
  }
];







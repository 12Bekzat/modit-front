import { Link } from 'react-router-dom';

const businessBenefits = [
  {
    title: 'Удобное оформление',
    text: 'Простой и удобный интерфейс для подбора и заказа необходимого вам товара.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4.5 7.5v9L12 21l7.5-4.5v-9L12 3Zm0 0v18M4.5 7.5 12 12l7.5-4.5" />
      </svg>
    )
  },
  {
    title: 'Бесплатная доставка',
    text: 'Бесплатная доставка заказов от 50 000 тенге для наших клиентов по городу Алматы.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 16h11V8H8m5 8h3l2-5h3l1 5h-2M7 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM2 10h6M1 13h5" />
      </svg>
    )
  },
  {
    title: 'Выгодные предложения',
    text: 'В нашем интернет-магазине вы всегда сможете найти интересные и выгодные предложения для вашего бизнеса.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3c3 4 6 6.7 6 10.5A6 6 0 1 1 6 13.5C6 9.7 9 7 12 3Zm0 9c1.6 1.7 2.5 3 2.5 4.2a2.5 2.5 0 0 1-5 0C9.5 15 10.4 13.7 12 12Z" />
      </svg>
    )
  },
  {
    title: 'Скидки на товар',
    text: 'Гарантированно широкий ассортимент акционных товаров и специальных цен для закупок.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5 14.3 5l2.7-.2.9 2.6 2.3 1.5-1 2.5 1 2.6-2.3 1.4-.9 2.6-2.7-.2-2.3 1.5-2.3-1.5-2.7.2-.9-2.6L4.7 16l1-2.6-1-2.5L7 7.4l.9-2.6 2.7.2L12 3.5Zm-2.5 10 5-5m-4.6 1.1a.4.4 0 1 0 0-.8.4.4 0 0 0 0 .8Zm4.2 5.2a.4.4 0 1 0 0-.8.4.4 0 0 0 0 .8Z" />
      </svg>
    )
  }
];

function BusinessBenefitsSection() {
  return (
    <section className="section business-benefits">
      <div className="container business-benefits-inner">
        <div className="business-benefits-copy">
          <p className="hero-tag">Для бизнеса</p>
          <h2>Условия, удобные для юридических лиц</h2>
          <p className="muted-text">
            От быстрого оформления до специальных предложений. Блок можно использовать как
            входную точку на страницу для корпоративных клиентов.
          </p>
          <Link to="/business" className="accent-button">
            Подробнее для юрлиц
          </Link>
        </div>

        <div className="business-benefits-list">
          {businessBenefits.map((item) => (
            <article key={item.title} className="business-benefit-card">
              <div className="business-benefit-icon">{item.icon}</div>
              <div className="business-benefit-content">
                <h3>{item.title}</h3>
                <p className="muted-text">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BusinessBenefitsSection;

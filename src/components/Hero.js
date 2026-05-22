import { Link } from 'react-router-dom';
import { buildCatalogPath } from '../utils/catalogRouting';

function Hero({ storeStats }) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-content">
          <p className="hero-tag">Новый сезон 2026</p>
          <h1>Технодом нового уровня: умные решения для каждой комнаты</h1>
          <p className="hero-text">
            Соберите идеальный сетап: от смартфонов и ноутбуков до умной техники для дома.
            Минималистичный дизайн, быстрые поставки и топовые бренды.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="primary-button">
              Открыть каталог
            </Link>
            <Link to={buildCatalogPath({ sort: 'rating' })} className="ghost-button">
              Сравнить модели
            </Link>
          </div>
          <div className="hero-stats">
            {storeStats.map((stat) => (
              <div key={stat.label} className="stat">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <p className="hero-card-title">Ультра Саунд</p>
            <p className="hero-card-subtitle">Новые наушники</p>
            <span className="pill">-30%</span>
          </div>
          <div className="hero-device device-phone">
            <div className="device-screen" />
          </div>
          <div className="hero-device device-laptop">
            <div className="device-screen" />
          </div>
          <div className="hero-badge">Бестселлеры 2026</div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

import { Link } from 'react-router-dom';

function PromoSection({ promoCards }) {
  return (
    <section className="section promos">
      <div className="container grid promo-grid">
        {promoCards.map((item) => (
          <div key={item.title} className="promo-card">
            <div>
              <p className="promo-tag">{item.tag}</p>
              <h3>{item.title}</h3>
              <p className="muted-text">{item.text}</p>
            </div>
            <Link className="accent-button" to={item.to}>
              Подробнее
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PromoSection;

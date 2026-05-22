import { Link } from 'react-router-dom';

function PerksSection({ perks }) {
  return (
    <section className="section perks">
      <div className="container perks-inner">
        <div className="perks-intro">
          <h2>Сервис, который вы заслужили</h2>
          <p>
            Мы продумали все детали: от профессиональной консультации до аккуратной установки.
          </p>
          <Link to="/business" className="primary-button">
            Узнать о сервисе
          </Link>
        </div>
        <div className="perks-grid">
          {perks.map((item) => (
            <div key={item.title} className="perk-card">
              <div className="perk-icon" />
              <h3>{item.title}</h3>
              <p className="muted-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PerksSection;

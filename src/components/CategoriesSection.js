import { Link } from 'react-router-dom';
import { buildCatalogPath } from '../utils/catalogRouting';

function CategoriesSection({ categoryCards }) {
  return (
    <section className="section">
      <div className="container section-head">
        <div>
          <h2>Категории недели</h2>
          <p>Все популярные направления в одном месте.</p>
        </div>
        <Link to="/products" className="ghost-button">
          Все категории
        </Link>
      </div>
      <div className="container grid categories">
        {categoryCards.map((item, index) => (
          <Link
            key={item.title}
            to={buildCatalogPath({ categories: [item.title] })}
            className={`category-card tone-${item.tone}`}
          >
            <div>
              <p className="card-title">{item.title}</p>
              <p className="card-subtitle">{item.subtitle}</p>
            </div>
            <div className="card-index">0{index + 1}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoriesSection;

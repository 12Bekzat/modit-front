import { Link } from 'react-router-dom';
import { buildCatalogPath } from '../utils/catalogRouting';

function CategoriesSection({ categoryCards }) {
  return (
    <section className="section featured-tiles-section">
      <div className="container featured-tiles">
        {categoryCards.map((item) => (
          <Link
            key={item.title}
            to={buildCatalogPath(item.params || { categories: [item.title] })}
            className="featured-tile"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoriesSection;

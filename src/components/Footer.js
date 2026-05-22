import { Link } from 'react-router-dom';
import Brand from './Brand';
import { buildCatalogPath } from '../utils/catalogRouting';

function Footer({ footerCatalogLinks, footerBuyerLinks, footerContacts }) {
  return (
    <footer className="footer" id="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Brand title="modit" subtitle="Технологии для бизнеса и дома" />
          <p className="muted-text">
            Цифровой магазин техники с акцентом на сервис, скорость и простой выбор.
          </p>
        </div>
        <div className="footer-columns">
          <div>
            <p className="section-title">Каталог</p>
            {footerCatalogLinks.map((item) => (
              <Link key={item} to={buildCatalogPath({ categories: [item] })} className="footer-text-link">
                {item}
              </Link>
            ))}
          </div>
          <div>
            <p className="section-title">Покупателям</p>
            {footerBuyerLinks.map((item) => (
              <Link key={item.label} to={item.to} className="footer-text-link">
                {item.label}
              </Link>
            ))}
            <Link to="/business" className="footer-text-link">
              Юридическим лицам
            </Link>
          </div>
          <div>
            <p className="section-title">Контакты</p>
            {footerContacts.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>modit (c) 2026. Все права защищены.</p>
        <div className="footer-links">
          <a href="#site-footer">Политика</a>
          <a href="#site-footer">Публичная оферта</a>
          <Link to="/products">Карта сайта</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

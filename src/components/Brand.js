import { Link } from 'react-router-dom';

const logoSrc = `${process.env.PUBLIC_URL || ''}/logo.svg`;

function Brand({ title, subtitle, to = '/' }) {
  const content = (
    <>
      <span className="brand-mark" aria-hidden="true">
        <img src={logoSrc} alt="" className="brand-logo" />
      </span>
      <div>
        <p className="brand-title">{title}</p>
        <p className="brand-subtitle">{subtitle}</p>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="brand brand-link" aria-label={`${title} home`}>
        {content}
      </Link>
    );
  }

  return <div className="brand">{content}</div>;
}

export default Brand;

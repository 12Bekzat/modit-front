import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

const profileStats = [
  { label: 'Бонусы', value: '12 450' },
  { label: 'Заказов', value: '18' },
  { label: 'Любимые бренды', value: '7' }
];

const profileActions = [
  { title: 'Мои заказы', text: 'История покупок и статусы доставок.', to: '/cart' },
  { title: 'Адреса доставки', text: 'Быстрый выбор адресов и получателей.', to: '/cart' },
  { title: 'Бонусная программа', text: 'История начислений и списаний.', to: '/business' },
  { title: 'Подписки', text: 'Почтовые рассылки и персональные подборки.', to: '/' }
];

function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="profile-page">
      <div className="container profile-head">
        <div>
          <p className="hero-tag">Профиль</p>
          <h1>Добро пожаловать, {user.fullName.split(' ')[0]}</h1>
          <p className="muted-text">Управляйте заказами, бонусами и персональными настройками.</p>
        </div>
        <div className="profile-user">
          <div className="profile-avatar">{user.initials}</div>
          <div>
            <p className="profile-name">{user.fullName}</p>
            <p className="muted-text">{user.email}</p>
            <p className="muted-text">{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="container profile-stats">
        {profileStats.map((stat) => (
          <div key={stat.label} className="stat">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="container profile-grid">
        {profileActions.map((item) => (
          <div key={item.title} className="profile-card">
            <h3>{item.title}</h3>
            <p className="muted-text">{item.text}</p>
            <Link className="ghost-button" to={item.to}>
              Открыть
            </Link>
          </div>
        ))}
      </div>

      <div className="container profile-footer">
        <Brand title="modit" subtitle="Сервис поддержки" />
        <div className="profile-support">
          <p>Линия поддержки: +7 707 000 00 00</p>
          <span className="ghost-button profile-role">Роль: {user.role}</span>
          <button className="primary-button" type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

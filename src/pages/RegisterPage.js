import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/profile', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Brand title="modit" subtitle="Регистрация" />
        <p className="auth-subtitle">Создайте профиль, чтобы получать персональные предложения и отслеживать заказы.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Имя и фамилия
            <input
              type="text"
              placeholder="Иван Иванов"
              value={formData.fullName}
              onChange={handleChange('fullName')}
              minLength={2}
              required
            />
          </label>
          <label className="auth-field">
            Эл. почта
            <input
              type="email"
              placeholder="name@mail.kz"
              value={formData.email}
              onChange={handleChange('email')}
              required
            />
          </label>
          <label className="auth-field">
            Пароль
            <input
              type="password"
              placeholder="Придумайте пароль"
              value={formData.password}
              onChange={handleChange('password')}
              minLength={8}
              required
            />
          </label>
          <label className="auth-field">
            Телефон
            <input
              type="tel"
              placeholder="+7 (777) 000-00-00"
              value={formData.phone}
              onChange={handleChange('phone')}
              required
            />
          </label>
          {error ? <p className="form-message is-error">{error}</p> : null}
          <button className="accent-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Создаем аккаунт...' : 'Создать аккаунт'}
          </button>
        </form>
        <div className="auth-links">
          <span className="muted-text">Уже есть аккаунт?</span>
          <Link to="/login" className="ghost-button auth-ghost">
            Войти
          </Link>
        </div>
        <p className="auth-note">Ваши данные защищены и используются только для заказов.</p>
      </div>
    </div>
  );
}

export default RegisterPage;

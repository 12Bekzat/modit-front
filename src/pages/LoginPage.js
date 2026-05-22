import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/profile';

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Brand title="modit" subtitle="Вход в аккаунт" />
        <p className="auth-subtitle">Войдите, чтобы видеть заказы, бонусы и историю действий.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            Эл. почта
            <input
              type="email"
              placeholder="name@mail.kz"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="auth-field">
            Пароль
            <input
              type="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              minLength={8}
              required
            />
          </label>
          {error ? <p className="form-message is-error">{error}</p> : null}
          <button className="primary-button auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>
        <div className="auth-links">
          <a href="mailto:support@technonord.kz" className="ghost-button auth-ghost">
            Забыли пароль?
          </a>
          <Link to="/register" className="ghost-button auth-ghost">
            Создать аккаунт
          </Link>
        </div>
        <p className="auth-note">Нажимая "Войти", вы соглашаетесь с политикой магазина.</p>
      </div>
    </div>
  );
}

export default LoginPage;

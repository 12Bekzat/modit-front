import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ requiredRoles }) {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return (
      <div className="route-state">
        <div className="route-card">
          <p className="hero-tag">Авторизация</p>
          <h2>Проверяем сессию</h2>
          <p className="muted-text">Подождите, загружаем данные аккаунта.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

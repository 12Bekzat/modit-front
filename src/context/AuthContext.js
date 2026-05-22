import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/authApi';

const AUTH_STORAGE_KEY = 'magazine.auth';

const AuthContext = createContext(null);

function readStoredSession() {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
}

function persistSession(session) {
  if (!session) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }) {
  const initialSession = readStoredSession();
  const [token, setToken] = useState(initialSession?.accessToken ?? null);
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(initialSession?.accessToken));
  const [isInitialized, setIsInitialized] = useState(!initialSession?.accessToken);

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setIsInitialized(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const profile = await getCurrentUser(token);
        setUser(profile);
        persistSession({ accessToken: token, user: profile });
      } catch (error) {
        setToken(null);
        setUser(null);
        persistSession(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    restoreSession();
  }, [token]);

  const applyAuthResponse = (response) => {
    setToken(response.accessToken);
    setUser(response.user);
    persistSession({ accessToken: response.accessToken, user: response.user });
    return response.user;
  };

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    return applyAuthResponse(response);
  };

  const register = async (payload) => {
    const response = await registerUser(payload);
    return applyAuthResponse(response);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoading(false);
    setIsInitialized(true);
    persistSession(null);
  };

  const refreshProfile = async () => {
    if (!token) {
      return null;
    }

    const profile = await getCurrentUser(token);
    setUser(profile);
    persistSession({ accessToken: token, user: profile });
    return profile;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

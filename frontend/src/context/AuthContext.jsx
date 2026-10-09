import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('campusbrand-user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.data?.user) {
          setUser(response.data.user);
          localStorage.setItem('campusbrand-user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        // If unauthenticated on backend, clear stale local session
        if (err.response?.status === 401 && isMounted) {
          setUser(null);
          localStorage.removeItem('campusbrand-user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('campusbrand-user', JSON.stringify(userData));
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      localStorage.removeItem('campusbrand-user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginUser, logout: logoutUser, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getCurrentUser, logoutUser } from '../api/auth';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User, rememberMe: boolean) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

      if (storedToken) {
        try {
          const user = storedUser ? JSON.parse(storedUser) : await getCurrentUser();
          setToken(storedToken);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error initializing auth:', error);
          await logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, user: User, rememberMe: boolean) => {
    setToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.warn('Server logout failed, clearing client session', error);
    } finally {
      setToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      token, 
      isAuthenticated,
      setCurrentUser,
      setToken,
      login,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
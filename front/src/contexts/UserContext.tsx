import type React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types';
import { getUserByUsername } from '../services/api';
// contexts/UserContext.tsx
import { getCurrentUser, logoutUser } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;  // Добавляем флаг аутентификации
  setCurrentUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string, user: User, rememberMe: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Состояние аутентификации
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

      if (storedToken) {
        try {
          setToken(storedToken);
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setIsAuthenticated(true); 
          } else {
            const user = await getCurrentUser();
            setCurrentUser(user);
            setIsAuthenticated(!!user); 
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          logout();
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
      logout 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

import type React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types';
import { getUserByUsername } from '../services/api';

interface UserContextType {
  currentUser: { id: string; username?: string; status?: string } | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
}


const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is stored in local storage when the app loads
  const login = async (username: string): Promise<boolean> => {
    try {
      const user = await getUserByUsername(username);
      if (user && user.id) {  // Проверяем user.id вместо user.userId
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // В useEffect при загрузке:
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Добавляем проверку на наличие обязательных полей
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          console.warn('Invalid user data in localStorage');
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);
    
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, isAuthenticated, login, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

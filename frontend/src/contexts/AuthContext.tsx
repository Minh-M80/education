import React, { createContext, useContext, useState, useCallback } from 'react';
import { User } from '@/types/lms';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const loggedInUser: User = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          createdAt: new Date(),
        };
        setUser(loggedInUser);
        localStorage.setItem('lms_user', JSON.stringify(loggedInUser));
        localStorage.setItem('lms_token', data.token);
        return { success: true };
      } else {
        const text = await response.text();
        return { success: false, error: text || 'Đăng nhập thất bại' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const text = await response.text();
        return { success: false, error: text || 'Đăng ký thất bại' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

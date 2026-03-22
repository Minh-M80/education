import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('Initial State', () => {
    it('should have null user initially', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from localStorage if exists', () => {
      const savedUser = { id: 'u_123', email: 'test@test.com', fullName: 'Test User', createdAt: new Date() };
      localStorage.setItem('lms_user', JSON.stringify(savedUser));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.user).not.toBeNull();
    });
  });

  describe('login()', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.login('test@example.com', '123456');
        expect(response.success).toBe(true);
      });
      
      expect(result.current.user).not.toBeNull();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should fail login with short password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.login('test@example.com', '123');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Email hoặc mật khẩu không đúng');
      });
    });

    it('should fail login with empty email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.login('', '123456');
        expect(response.success).toBe(false);
      });
    });

    it('should save user to localStorage after login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', '123456');
      });
      
      expect(localStorage.getItem('lms_user')).not.toBeNull();
    });
  });

  describe('register()', () => {
    it('should register successfully with valid data', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.register('new@example.com', '123456', 'New User');
        expect(response.success).toBe(true);
      });
      
      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('new@example.com');
    });

    it('should fail register with existing email', async () => {
      // Setup: add existing email to store
      localStorage.setItem('lms_registered_emails', JSON.stringify(['existing@example.com']));
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.register('existing@example.com', '123456', 'Test User');
        expect(response.success).toBe(false);
        expect(response.error).toContain('Email này đã được đăng ký');
      });
    });

    it('should fail register with short password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.register('test@example.com', '123', 'Test User');
        expect(response.success).toBe(false);
      });
    });

    it('should fail register with empty fullName', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        const response = await result.current.register('test@example.com', '123456', '');
        expect(response.success).toBe(false);
      });
    });

    it('should save registered email to localStorage', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.register('new@example.com', '123456', 'New User');
      });
      
      const emails = JSON.parse(localStorage.getItem('lms_registered_emails') || '[]');
      expect(emails).toContain('new@example.com');
    });
  });

  describe('logout()', () => {
    it('should clear user on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Login first
      await act(async () => {
        await result.current.login('test@example.com', '123456');
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      // Then logout
      act(() => {
        result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should remove user from localStorage on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.login('test@example.com', '123456');
      });
      
      act(() => {
        result.current.logout();
      });
      
      expect(localStorage.getItem('lms_user')).toBeNull();
    });
  });
});

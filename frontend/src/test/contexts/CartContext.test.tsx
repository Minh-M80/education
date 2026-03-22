import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Course } from '@/types/lms';
import React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockCourse: Course = {
  id: '1',
  title: 'Test Course',
  description: 'Test Description',
  instructor: 'Test Instructor',
  thumbnail: 'https://example.com/image.jpg',
  price: 1000000,
  duration: '10 hours',
  level: 'Beginner',
  category: 'Programming',
  rating: 4.5,
  totalStudents: 100,
  totalLessons: 10,
  lessons: []
};

const mockCourse2: Course = {
  ...mockCourse,
  id: '2',
  title: 'Test Course 2',
  price: 2000000
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('useCart hook', () => {
    it('should throw error when used outside CartProvider', () => {
      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');
    });
  });

  describe('Initial State', () => {
    it('should have empty cart initially', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.items).toEqual([]);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('addToCart()', () => {
    it('should add course to cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].course.id).toBe('1');
      expect(result.current.itemCount).toBe(1);
    });

    it('should not add duplicate course', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse);
      });
      
      expect(result.current.items).toHaveLength(1);
    });

    it('should add multiple different courses', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse2);
      });
      
      expect(result.current.items).toHaveLength(2);
      expect(result.current.itemCount).toBe(2);
    });

    it('should calculate total price correctly', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse2);
      });
      
      expect(result.current.totalPrice).toBe(3000000); // 1000000 + 2000000
    });
  });

  describe('removeFromCart()', () => {
    it('should remove course from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse2);
      });
      
      expect(result.current.items).toHaveLength(2);
      
      act(() => {
        result.current.removeFromCart('1');
      });
      
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].course.id).toBe('2');
    });

    it('should update total price after removal', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse2);
      });
      
      act(() => {
        result.current.removeFromCart('1');
      });
      
      expect(result.current.totalPrice).toBe(2000000);
    });

    it('should handle removing non-existent course', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
      });
      
      act(() => {
        result.current.removeFromCart('999');
      });
      
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('clearCart()', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
        result.current.addToCart(mockCourse2);
      });
      
      expect(result.current.items).toHaveLength(2);
      
      act(() => {
        result.current.clearCart();
      });
      
      expect(result.current.items).toHaveLength(0);
      expect(result.current.itemCount).toBe(0);
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe('isInCart()', () => {
    it('should return true if course is in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
      });
      
      expect(result.current.isInCart('1')).toBe(true);
    });

    it('should return false if course is not in cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      expect(result.current.isInCart('1')).toBe(false);
    });

    it('should return false after course is removed', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      act(() => {
        result.current.addToCart(mockCourse);
      });
      
      expect(result.current.isInCart('1')).toBe(true);
      
      act(() => {
        result.current.removeFromCart('1');
      });
      
      expect(result.current.isInCart('1')).toBe(false);
    });
  });
});

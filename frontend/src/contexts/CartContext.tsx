import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Course } from '@/types/lms';
import { useAuth } from './AuthContext';

interface CartItem {
  course: Course;
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
  isInCart: (courseId: string) => boolean;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getCartKey = (userId: string | null) => {
  return userId ? `lms_cart_${userId}` : 'lms_cart_guest';
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart when user changes
  useEffect(() => {
    const cartKey = getCartKey(user?.id ?? null);
    const saved = localStorage.getItem(cartKey);
    setItems(saved ? JSON.parse(saved) : []);
  }, [user?.id]);

  const saveCart = useCallback((data: CartItem[]) => {
    const cartKey = getCartKey(user?.id ?? null);
    localStorage.setItem(cartKey, JSON.stringify(data));
  }, [user?.id]);

  const addToCart = useCallback((course: Course) => {
    setItems(prev => {
      if (prev.some(item => item.course.id === course.id)) {
        return prev;
      }
      const updated = [...prev, { course, addedAt: new Date() }];
      saveCart(updated);
      return updated;
    });
  }, [saveCart]);

  const removeFromCart = useCallback((courseId: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.course.id !== courseId);
      saveCart(updated);
      return updated;
    });
  }, [saveCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    const cartKey = getCartKey(user?.id ?? null);
    localStorage.removeItem(cartKey);
  }, [user?.id]);

  const isInCart = useCallback((courseId: string) => {
    return items.some(item => item.course.id === courseId);
  }, [items]);

  const totalPrice = items.reduce((sum, item) => sum + item.course.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      isInCart, 
      totalPrice,
      itemCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

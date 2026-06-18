import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Design } from '../data/mockData';
import { useNotification } from './NotificationContext';

interface CartItem {
  design: Design;
  licenseType: string;
}

interface CartContextType {
  items: CartItem[];
  wishlist: Design[];
  addToCart: (design: Design, licenseType: string) => void;
  removeFromCart: (designId: string) => void;
  clearCart: () => void;
  toggleWishlist: (design: Design) => void;
  isInWishlist: (designId: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useNotification();
  
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem('atelier_cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [wishlist, setWishlist] = useState<Design[]>(() => {
    const stored = localStorage.getItem('atelier_wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('atelier_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('atelier_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((design: Design, licenseType: string) => {
    setItems(prev => {
      const exists = prev.find(item => item.design.id === design.id);
      if (exists) return prev;
      return [...prev, { design, licenseType }];
    });
    showToast('Added to cart');
  }, [showToast]);

  const removeFromCart = useCallback((designId: string) => {
    setItems(prev => prev.filter(item => item.design.id !== designId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleWishlist = useCallback((design: Design) => {
    setWishlist(prev => {
      const exists = prev.some(d => d.id === design.id);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter(d => d.id !== design.id);
      } else {
        showToast('Added to wishlist');
        return [...prev, design];
      }
    });
  }, [showToast]);

  const isInWishlist = useCallback((designId: string) => {
    return wishlist.some(d => d.id === designId);
  }, [wishlist]);

  return (
    <CartContext.Provider value={{ items, wishlist, addToCart, removeFromCart, clearCart, toggleWishlist, isInWishlist }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

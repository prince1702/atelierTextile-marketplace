import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Design } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface CartItem {
  design: Design;
  licenseType: string;
}

interface CartContextType {
  items: CartItem[];
  wishlist: Design[];
  isLoading: boolean;
  addToCart: (design: Design, licenseType: string) => Promise<void>;
  removeFromCart: (designId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (design: Design) => Promise<void>;
  isInWishlist: (designId: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { showToast } = useNotification();
  const { user, isAuthenticated } = useAuth();
  
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync cart and wishlist when user logs in/out
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user?.role === 'customer') {
        setIsLoading(true);
        try {
          const [cartData, wishlistData] = await Promise.all([
            api.cart.get(),
            api.wishlist.get()
          ]);
          setItems(cartData.items.map(item => ({
            design: item.design,
            licenseType: item.licenseType
          })));
          setWishlist(wishlistData.designs);
        } catch (error) {
          console.error('Failed to sync cart and wishlist with server:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setItems([]);
        setWishlist([]);
      }
    };

    fetchUserData();
  }, [user, isAuthenticated]);

  const addToCart = useCallback(async (design: Design, licenseType: string) => {
    if (!isAuthenticated) {
      showToast('Please login to add designs to cart', 'warning');
      return;
    }
    if (user?.role !== 'customer') {
      showToast('Only customers can purchase designs', 'warning');
      return;
    }

    try {
      await api.cart.add(design.id, licenseType);
      setItems(prev => {
        const exists = prev.find(item => item.design.id === design.id);
        if (exists) return prev;
        return [...prev, { design, licenseType }];
      });
      showToast(`Added '${design.title}' to cart`);
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Failed to add to cart';
      showToast(msg, 'error');
    }
  }, [isAuthenticated, user, showToast]);

  const removeFromCart = useCallback(async (designId: string) => {
    try {
      await api.cart.remove(designId);
      setItems(prev => prev.filter(item => item.design.id !== designId));
      showToast('Removed item from cart', 'info');
    } catch (error) {
      showToast('Failed to remove item from cart', 'error');
    }
  }, [showToast]);

  const clearCart = useCallback(async () => {
    try {
      await api.cart.clear();
      setItems([]);
    } catch (error) {
      showToast('Failed to clear cart', 'error');
    }
  }, [showToast]);

  const toggleWishlist = useCallback(async (design: Design) => {
    if (!isAuthenticated) {
      showToast('Please login to add designs to wishlist', 'warning');
      return;
    }
    if (user?.role !== 'customer') {
      showToast('Only customers can manage wishlists', 'warning');
      return;
    }

    try {
      const response = await api.wishlist.toggle(design.id);
      if (response.action === 'added') {
        setWishlist(prev => [...prev, design]);
        showToast(`Added '${design.title}' to wishlist`);
      } else {
        setWishlist(prev => prev.filter(d => d.id !== design.id));
        showToast(`Removed '${design.title}' from wishlist`, 'info');
      }
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  }, [isAuthenticated, user, showToast]);

  const isInWishlist = useCallback((designId: string) => {
    return wishlist.some(d => d.id === designId);
  }, [wishlist]);

  return (
    <CartContext.Provider value={{ items, wishlist, isLoading, addToCart, removeFromCart, clearCart, toggleWishlist, isInWishlist }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

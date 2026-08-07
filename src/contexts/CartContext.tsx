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
  
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('texdesigner_cart') || localStorage.getItem('atelier_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Save cart items to localStorage on change
  useEffect(() => {
    localStorage.setItem('texdesigner_cart', JSON.stringify(items));
  }, [items]);

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
          
          // Filter out any null designs (in case they were deleted/inactive)
          const apiItems = (cartData.items || [])
            .filter(item => item && item.design)
            .map(item => ({
              design: item.design,
              licenseType: item.licenseType
            }));

          // Merge local items with API items
          const merged = [...items];
          apiItems.forEach(apiItem => {
            const exists = merged.some(localItem => localItem.design.id === apiItem.design.id);
            if (!exists) {
              merged.push(apiItem);
            }
          });

          // Upload any local items that are missing on the server
          const missingOnServer = items.filter(localItem => 
            !apiItems.some(apiItem => apiItem.design.id === localItem.design.id)
          );

          if (missingOnServer.length > 0) {
            try {
              await Promise.all(
                missingOnServer.map(item => api.cart.add(item.design.id, item.licenseType))
              );
            } catch (syncErr) {
              console.warn('Failed to sync some local items to server:', syncErr);
            }
          }
            
          setItems(merged);
          setWishlist(wishlistData.designs || []);
        } catch (error) {
          console.error('Failed to sync cart and wishlist with server:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Only clear if the user is truly logged out (no token in localStorage)
        if (!localStorage.getItem('texdesigner_token') && !localStorage.getItem('atelier_token')) {
          setItems([]);
          setWishlist([]);
          localStorage.removeItem('texdesigner_cart');
          localStorage.removeItem('atelier_cart');
        }
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

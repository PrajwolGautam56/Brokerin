import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartService } from '../services/cartService';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const FurnitureCartContext = createContext();

export function FurnitureCartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('furniture_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load cart from localStorage:', error);
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Define syncWithBackend before useEffect that uses it
  const syncWithBackend = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      
      // Transform backend cart to match our format
      const backendItems = response.data?.items || response.items || [];
      const transformedItems = backendItems.map(item => ({
        id: item.product_id || item._id,
        name: item.product_name || item.name,
        image: item.photos?.[0] || item.image,
        price: {
          rent_monthly: item.monthly_price || item.price?.rent_monthly,
          sell_price: item.sell_price || item.price?.sell_price,
          rent: item.monthly_price || item.price?.rent,
          buy: item.sell_price || item.price?.buy,
          deposit: item.deposit || item.price?.deposit
        },
        mode: item.listing_type === 'Sell' ? 'buy' : 'rent',
        quantity: item.quantity || 1
      }));
      
      setItems(transformedItems);
    } catch (error) {
      logger.error('Failed to sync cart with backend:', error);
      // Keep localStorage cart on failure
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync with backend on mount if logged in
  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend().catch(error => {
        logger.error('Failed to sync cart on mount:', error);
        // Continue with localStorage cart on error
      });
    }
  }, [isAuthenticated, syncWithBackend]);

  // Save to localStorage (for both authenticated and non-authenticated users as backup)
  useEffect(() => {
    try {
      localStorage.setItem('furniture_cart', JSON.stringify(items));
    } catch (error) {
      logger.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addItem = async (item) => {
    // Always add to localStorage first for immediate feedback
    const key = `${item.id}-${item.mode}`;
    let wasNewItem = false;
    let previousQuantity = 0;
    
    setItems((prev) => {
      const existing = prev.find((i) => `${i.id}-${i.mode}` === key);
      if (existing) {
        previousQuantity = existing.quantity;
        return prev.map((i) =>
          `${i.id}-${i.mode}` === key ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      wasNewItem = true;
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });

    // Also sync to backend if authenticated
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.addToCart(item.id, item.quantity || 1, item.mode);
        await syncWithBackend();
        toast.success('Added to cart!');
      } catch (error) {
        // Get detailed error information
        const errorData = error.response?.data || error.details;
        
        // Revert the optimistic update - remove the item we just added
        setItems((prev) => {
          if (wasNewItem) {
            // Remove the item we just added
            return prev.filter((i) => `${i.id}-${i.mode}` !== key);
          } else {
            // Revert to previous quantity
            return prev.map((i) =>
              `${i.id}-${i.mode}` === key ? { ...i, quantity: previousQuantity } : i
            );
          }
        });
        
        // Show specific error message from backend
        const errorMessage = errorData?.message || error.message || 'Failed to add to cart';
        toast.error(errorMessage, { duration: 4000 });
        
        // Show helpful suggestion if available
        if (errorData?.suggestion) {
          setTimeout(() => {
            toast(errorData.suggestion, { 
              duration: 6000,
              icon: 'ℹ️'
            });
          }, 1500);
        }
        
        // Log for debugging
        logger.error('Failed to sync cart to backend:', {
          error: errorMessage,
          details: errorData,
          product_id: item.id,
          product_name: item.name,
          availability: errorData?.availability,
          status: errorData?.status,
          listing_type: errorData?.listing_type,
          available_stock: errorData?.available_stock,
          suggestion: errorData?.suggestion
        });
        
        // Error is fully handled - don't re-throw to avoid uncaught promise rejection
        // The toast notifications and state reversion are sufficient feedback
      } finally {
        setLoading(false);
      }
    } else {
      // For non-authenticated users, just show success
      toast.success('Added to cart!');
    }
  };

  const removeItem = async (id, mode) => {
    // Remove from localStorage immediately for instant feedback
    setItems((prev) => prev.filter((i) => !(i.id === id && i.mode === mode)));

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.removeItem(id);
        // Refresh cart from backend to ensure sync
        await syncWithBackend();
      } catch (error) {
        logger.error('Failed to remove item from backend:', error);
        // Don't throw - item is already removed from localStorage
      } finally {
        setLoading(false);
      }
    }
  };

  const updateQuantity = async (id, mode, quantity) => {
    // Update localStorage immediately
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.mode === mode ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.updateItem(id, quantity);
        await syncWithBackend();
      } catch (error) {
        logger.error('Failed to update quantity on backend:', error);
        // Don't throw - quantity is already updated in localStorage
      } finally {
        setLoading(false);
      }
    }
  };

  const clearCart = async () => {
    // Clear localStorage immediately
    setItems([]);

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.clearCart();
      } catch (error) {
        logger.error('Failed to clear cart on backend:', error);
        // Don't throw - cart is already cleared in localStorage
      } finally {
        setLoading(false);
      }
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <FurnitureCartContext.Provider
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        totalItems,
        loading,
        syncWithBackend
      }}
    >
      {children}
    </FurnitureCartContext.Provider>
  );
}

export const useFurnitureCart = () => useContext(FurnitureCartContext);



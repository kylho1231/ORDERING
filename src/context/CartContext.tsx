import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Order } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, specialInstructions?: string) => void;
  updateQuantity: (productId: string, quantity: number, instructions?: string) => void;
  removeFromCart: (productId: string, instructions?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  customerOrders: Order[];
  addCustomerOrder: (order: Order) => void;
  formatPrice: (amount: number) => string;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'lovely_eatery_cart_v1';
const CUSTOMER_ORDERS_KEY = 'lovely_eatery_orders_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [customerOrders, setCustomerOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_ORDERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(customerOrders));
    } catch (e) {
      console.error('Failed to persist orders:', e);
    }
  }, [customerOrders]);

  const addToCart = (product: Product, quantity: number = 1, specialInstructions: string = '') => {
    if (!product.available || quantity <= 0) return;

    setItems((prev) => {
      const instructionsKey = (specialInstructions || '').trim().toLowerCase();
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && (it.specialInstructions || '').trim().toLowerCase() === instructionsKey
      );

      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity,
        };
        return next;
      } else {
        return [...prev, { product, quantity, specialInstructions: specialInstructions.trim() }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, instructions: string = '') => {
    setItems((prev) => {
      const instrKey = (instructions || '').trim().toLowerCase();
      if (quantity <= 0) {
        return prev.filter(
          (it) => !(it.product.id === productId && (it.specialInstructions || '').trim().toLowerCase() === instrKey)
        );
      }
      return prev.map((it) => {
        if (it.product.id === productId && (it.specialInstructions || '').trim().toLowerCase() === instrKey) {
          return { ...it, quantity };
        }
        return it;
      });
    });
  };

  const removeFromCart = (productId: string, instructions: string = '') => {
    const instrKey = (instructions || '').trim().toLowerCase();
    setItems((prev) =>
      prev.filter(
        (it) => !(it.product.id === productId && (it.specialInstructions || '').trim().toLowerCase() === instrKey)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const addCustomerOrder = (order: Order) => {
    setCustomerOrders((prev) => {
      const filtered = prev.filter((o) => o.id !== order.id && o.order_number !== order.order_number);
      return [order, ...filtered];
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const formatPrice = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        customerOrders,
        addCustomerOrder,
        formatPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { addCartItem, clearCart, fetchCart, removeCartItem, updateCartItem } from '../services/cartApi';
import { toProductSnapshot } from '../utils/productSnapshot';

const CART_STORAGE_KEY = 'magazine.cart';

const CartContext = createContext(null);

function readStoredCart() {
  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch (error) {
    return [];
  }
}

function persistStoredCart(items) {
  if (!items || items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

function normalizeCartResponse(response) {
  return response?.items ?? [];
}

function mapProductToGuestItem(product, quantity) {
  const snapshot = toProductSnapshot(product);
  return {
    ...snapshot,
    quantity,
    lineTotal: Number(snapshot.price) * quantity
  };
}

export function CartProvider({ children }) {
  const { token, isAuthenticated, isInitialized } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    let isCancelled = false;

    const bootstrapCart = async () => {
      setIsLoading(true);

      if (!isAuthenticated || !token) {
        const guestItems = readStoredCart();
        if (!isCancelled) {
          setItems(guestItems);
          setIsLoading(false);
        }
        return;
      }

      const guestItems = readStoredCart();
      persistStoredCart([]);

      try {
        for (const item of guestItems) {
          await addCartItem(token, {
            product: toProductSnapshot(item),
            quantity: item.quantity
          });
        }

        const response = await fetchCart(token);
        if (!isCancelled) {
          setItems(normalizeCartResponse(response));
        }
      } catch (error) {
        if (guestItems.length > 0) {
          persistStoredCart(guestItems);
        }
        if (!isCancelled) {
          setItems([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    bootstrapCart();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isInitialized, token]);

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity), 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0), [items]);

  const addItem = async (product, quantity = 1) => {
    if (quantity <= 0) {
      return;
    }

    const snapshot = toProductSnapshot(product);

    if (isAuthenticated && token) {
      const response = await addCartItem(token, {
        product: snapshot,
        quantity
      });
      setItems(normalizeCartResponse(response));
      return;
    }

    const existingItem = items.find((item) => item.productCode === snapshot.productCode);
    const nextQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (nextQuantity > Number(snapshot.availableQuantity)) {
      throw new Error(`Доступно только ${snapshot.availableQuantity} шт.`);
    }

    const nextItems = existingItem
      ? items.map((item) =>
          item.productCode === snapshot.productCode
            ? { ...item, quantity: nextQuantity, lineTotal: Number(item.price) * nextQuantity }
            : item
        )
      : [mapProductToGuestItem(product, quantity), ...items];

    persistStoredCart(nextItems);
    setItems(nextItems);
  };

  const updateQuantity = async (productCode, quantity) => {
    if (quantity <= 0) {
      await removeItem(productCode);
      return;
    }

    if (isAuthenticated && token) {
      const response = await updateCartItem(token, productCode, { quantity });
      setItems(normalizeCartResponse(response));
      return;
    }

    const targetItem = items.find((item) => item.productCode === productCode);
    if (targetItem && quantity > Number(targetItem.availableQuantity)) {
      throw new Error(`Доступно только ${targetItem.availableQuantity} шт.`);
    }

    const nextItems = items.map((item) =>
      item.productCode === productCode
        ? {
            ...item,
            quantity,
            lineTotal: Number(item.price) * quantity
          }
        : item
    );

    persistStoredCart(nextItems);
    setItems(nextItems);
  };

  const removeItem = async (productCode) => {
    if (isAuthenticated && token) {
      const response = await removeCartItem(token, productCode);
      setItems(normalizeCartResponse(response));
      return;
    }

    setItems((current) => {
      const nextItems = current.filter((item) => item.productCode !== productCode);
      persistStoredCart(nextItems);
      return nextItems;
    });
  };

  const clearAllItems = async () => {
    if (isAuthenticated && token) {
      await clearCart(token);
      setItems([]);
      return;
    }

    persistStoredCart([]);
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalQuantity,
        subtotal,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart: clearAllItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider.');
  }

  return context;
}

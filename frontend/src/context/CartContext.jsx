import { createContext, useState, useCallback, useEffect } from 'react';
import APIService from '../services/api';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;

  // ── Fetch real cart from backend ──────────────────────────────
  const syncCart = useCallback(async () => {
    if (!token) {
      setCartItems([]);
      return;
    }
    try {
      const data = await APIService.getCart(token);
      setCartItems(data?.items || []);
    } catch {
      setCartItems([]);
    }
  }, [token]);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  // Allow any component to trigger a re-sync via custom event
  useEffect(() => {
    window.addEventListener("cartUpdated", syncCart);
    return () => window.removeEventListener("cartUpdated", syncCart);
  }, [syncCart]);

  // ── Add item ──────────────────────────────────────────────────
  // APIService.addToCart({ productId, quantity }, token)
  const addToCart = useCallback(async (product) => {
    if (!token) return;
    try {
      await APIService.addToCart({ productId: product.id, quantity: 1 }, token);
      await syncCart();
    } catch (err) {
      console.error("addToCart failed:", err);
    }
  }, [token, syncCart]);

  // ── Remove item ───────────────────────────────────────────────
  // APIService.removeCartItem(cartItemId, token)  ← cart row id, NOT product id
  const removeFromCart = useCallback(async (cartItemId) => {
    if (!token) return;
    try {
      await APIService.removeCartItem(cartItemId, token);
      await syncCart();
    } catch (err) {
      console.error("removeFromCart failed:", err);
    }
  }, [token, syncCart]);

  // ── Update quantity ───────────────────────────────────────────
  // APIService.updateCartItem(cartItemId, quantity, token)
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (!token) return;
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    try {
      await APIService.updateCartItem(cartItemId, quantity, token);
      await syncCart();
    } catch (err) {
      console.error("updateQuantity failed:", err);
    }
  }, [token, removeFromCart, syncCart]);

  // ── Clear cart ────────────────────────────────────────────────
  // APIService.clearCart(token)
  const clearCart = useCallback(async () => {
    if (!token) return;
    try {
      await APIService.clearCart(token);
      setCartItems([]);
    } catch (err) {
      console.error("clearCart failed:", err);
    }
  }, [token]);

  // ── Count: sum quantities from real API data ──────────────────
  const getCartCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  // ── Total price ───────────────────────────────────────────────
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.Product?.price || item.price || 0);
      return total + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getTotalPrice,
    syncCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

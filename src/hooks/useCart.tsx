import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, MenuItem, AddOn } from '../types';
import { supabase } from '../lib/supabaseClient';
import CONFIG from '../config/config';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (menuItem: MenuItem, selectedAddOns: AddOn[], quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getShippingCost: () => number;
  applyCoupon: (
    code: string
  ) => Promise<{ success: boolean; discount: number; message: string }>;
  couponDiscount: number;
  appliedCoupon: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = 'lulu_k_cart';

// ✅ מקור אחד בלבד - ללא כפילויות
const FREE_SHIPPING_THRESHOLD = CONFIG.FREE_SHIPPING_THRESHOLD;
const SHIPPING_COST = CONFIG.DELIVERY_FEE;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [cartItems]);

  const addToCart = (menuItem: MenuItem, selectedAddOns: AddOn[], quantity: number) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.menuItem.id === menuItem.id &&
          JSON.stringify(item.selectedAddOns) === JSON.stringify(selectedAddOns)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { menuItem, selectedAddOns, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.menuItem.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponDiscount(0);
    setAppliedCoupon(null);
  };

  const getTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const addOnsPrice = item.selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
      return total + (item.menuItem.price + addOnsPrice) * item.quantity;
    }, 0);
    return Math.max(0, subtotal - couponDiscount);
  };

  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  const getShippingCost = () => {
    const totalAfterDiscount = getTotalPrice();
    return totalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  };

  const applyCoupon = async (code: string) => {
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !coupon) return { success: false, discount: 0, message: 'קוד קופון לא תקין' };

      const now = new Date();
      const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
      if (expiresAt && now > expiresAt) return { success: false, discount: 0, message: 'הקופון פג תוקף' };

      const subtotal = cartItems.reduce((total, item) => {
        const addOnsPrice = item.selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
        return total + (item.menuItem.price + addOnsPrice) * item.quantity;
      }, 0);

      let discount = 0;
      if (coupon.discount_percent) discount = (subtotal * coupon.discount_percent) / 100;
      else if (coupon.discount_amount) discount = coupon.discount_amount;

      setCouponDiscount(discount);
      setAppliedCoupon(code.toUpperCase());
      return { success: true, discount, message: 'הקופון הופעל!' };
    } catch (error) {
      return { success: false, discount: 0, message: 'שגיאה בהפעלת הקופון' };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
        getTotalPrice, getTotalItems, getShippingCost, applyCoupon,
        couponDiscount, appliedCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

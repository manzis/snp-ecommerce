import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType, addToCart, updateCartItem, removeCartItem, mergeCart, fetchCart, clearCartRemote } from '@/services/cartService';
import type { Coupon } from '@/services/couponService';

interface CartState {
  items: CartItemType[];
  isLoading: boolean;
  userId: string | null;
  setUserId: (id: string | null) => void;
  loadCart: () => Promise<void>;
  addItem: (item: CartItemType) => void;
  removeItem: (item: CartItemType) => void;
  updateQuantity: (item: CartItemType, quantity: number) => void;
  mergeCartOnLogin: (userId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getCouponDiscount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      userId: null,
      coupon: null,

      setUserId: (userId) => set({ userId }),

      loadCart: async () => {
        const { userId } = get();
        if (!userId) return; 
        set({ isLoading: true });
        const dbItems = await fetchCart(userId);
        set({ items: dbItems, isLoading: false });
      },

      addItem: (item) => {
        const { items, userId } = get();
        const existing = items.find(i => i.id === item.id);
        const newItems = [...items];

        if (existing) {
          existing.quantity += item.quantity;
          set({ items: newItems });
          if (userId) updateCartItem(userId, existing, existing.quantity);
        } else {
          newItems.push(item);
          set({ items: newItems });
          if (userId) addToCart(item, userId);
        }
      },

      removeItem: (item) => {
        const { items, userId } = get();
        set({ items: items.filter(i => i.id !== item.id) });
        if (userId) removeCartItem(userId, item);
      },

      updateQuantity: (item, quantity) => {
        if (quantity < 1) {
          get().removeItem(item);
          return;
        }
        const { items, userId } = get();
        const newItems = items.map(i => i.id === item.id ? { ...i, quantity } : i);
        set({ items: newItems });
        if (userId) updateCartItem(userId, item, quantity);
      },

      mergeCartOnLogin: async (userId) => {
        set({ isLoading: true, userId });
        const { items } = get();
        if (items.length > 0) {
          await mergeCart(items, userId);
        }
        const dbItems = await fetchCart(userId);
        set({ items: dbItems, isLoading: false });
      },

      clearCart: async () => {
        const { userId } = get();
        set({ items: [], coupon: null });
        if (userId) await clearCartRemote(userId);
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      getCouponDiscount: () => {
        const { coupon, items } = get();
        if (!coupon) return 0;
        
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        // 1. Min Cart Value check
        if (subtotal < coupon.min_cart_value) return 0;

        // 2. Eligibility & Calculation
        let eligibleAmount = subtotal;
        if (coupon.product_id) {
          const eligibleItems = items.filter(item => item.product_id === coupon.product_id);
          if (eligibleItems.length === 0) return 0;
          eligibleAmount = eligibleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        }

        let discount = 0;
        if (coupon.type === 'percentage') {
          discount = (eligibleAmount * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        
        // 3. Apply Max Discount Cap
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }

        return Math.min(discount, eligibleAmount);
      }
    }),
    {
      name: 'snp-cart-storage',
      // only persist items and userId. Hydration manages the rest.
      partialize: (state) => ({ 
        items: state.items, 
        userId: state.userId,
        coupon: state.coupon
      })
    }
  )
);

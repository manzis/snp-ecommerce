import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemType, addToCart, updateCartItem, removeCartItem, removeBundleItems, mergeCart, fetchCart, clearCartRemote } from '@/services/cartService';

import type { Coupon } from '@/services/couponService';

interface CartState {
  items: CartItemType[];
  isLoading: boolean;
  userId: string | null;
  setUserId: (id: string | null) => void;
  loadCart: () => Promise<void>;
  addItem: (item: CartItemType) => void;
  addItemsBatch: (items: CartItemType[]) => Promise<void>;
  removeItem: (item: CartItemType) => void;

  updateQuantity: (item: CartItemType, quantity: number) => void;
  mergeCartOnLogin: (userId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshLocalCartOnMount: () => Promise<void>;
  reverifyCartPrices: () => Promise<void>;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getCouponDiscount: () => number;

  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      userId: null,
      coupon: null,
      isCartOpen: false,

      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      setUserId: (userId) => set({ userId }),

      loadCart: async () => {
        const { userId } = get();
        if (!userId) return;
        set({ isLoading: true });
        const dbItems = await fetchCart(userId);
        set({ items: dbItems, isLoading: false });
      },

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(i => i.id === item.id);
          const newItems = [...state.items];

          if (existingIndex > -1) {
            const existing = { ...newItems[existingIndex] };
            existing.quantity += item.quantity;
            // Sum bundle discounts when merging identical units in same bundle
            existing.bundle_discount = item.bundle_discount || 0;
            newItems[existingIndex] = existing;
            if (state.userId) updateCartItem(state.userId, existing, existing.quantity);
          } else {
            newItems.push(item);
            if (state.userId) addToCart(item, state.userId);
          }

          return { items: newItems, coupon: null };
        });
      },


      addItemsBatch: async (newBatch) => {
        const { userId, items } = get();
        let updatedItems = [...items];

        newBatch.forEach(item => {
          const existingIndex = updatedItems.findIndex(i => i.id === item.id);
          if (existingIndex > -1) {
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + item.quantity,
              // Sum bundle discounts during batch merging
              bundle_discount: item.bundle_discount || 0
            };
          } else {
            updatedItems.push(item);
          }
        });

        set({ items: updatedItems, coupon: null });

        if (userId) {
          // Use mergeCart to sync the full batch state to database in one go
          await mergeCart(newBatch, userId);
        }
      },

      removeItem: (item) => {
        const { items, userId } = get();


        if (item.bundle_id) {
          // Atomic Bundle Removal: Remove ALL items associated with this bundle
          const newItems = items.filter(i => i.bundle_id !== item.bundle_id);
          set({ items: newItems, coupon: null });
          if (userId) removeBundleItems(userId, item.bundle_id);
        } else {
          // Standard Individual Item Removal
          const newItems = items.filter(i => i.id !== item.id);
          set({ items: newItems, coupon: null });
          if (userId) removeCartItem(userId, item);
        }
      },


      updateQuantity: (item, quantity) => {
        if (quantity < 1) {
          get().removeItem(item);
          return;
        }
        const { items, userId } = get();

        let newItems: CartItemType[];

        if (item.bundle_id) {
          // Atomic Bundle Quantity Update: Update ALL items in the bundle
          newItems = items.map(i => {
            if (i.bundle_id === item.bundle_id) {
              const newBundleDiscount = i.bundle_discount || 0;

              const updatedItem = { ...i, quantity, bundle_discount: newBundleDiscount };
              if (userId) updateCartItem(userId, updatedItem, quantity);
              return updatedItem;
            }
            return i;
          });
        } else {
          // Standard Individual Item Quantity Update
          newItems = items.map(i => i.id === item.id ? { ...i, quantity } : i);
          if (userId) updateCartItem(userId, item, quantity);
        }

        set({ items: newItems, coupon: null });
      },


      mergeCartOnLogin: async (newUserId) => {
        const { items, userId, isLoading } = get();
        if (isLoading) return;

        // If the user hasn't changed, just refresh the cart from DB.
        // Don't merge, because 'items' in store are already a local copy of DB items.
        if (userId === newUserId) {
          const finalItems = await fetchCart(newUserId);
          set({ items: finalItems });
          return;
        }

        set({ isLoading: true, userId: newUserId });

        try {
          // If there are local items, push all of them to DB. 
          // mergeCart service automatically handles summing quantities for items that exist in both Local + DB
          if (items.length > 0) {
            await mergeCart(items, newUserId);
          }

          // Always fetch final state from DB as the single source of truth
          const finalItems = await fetchCart(newUserId);
          set({ items: finalItems });
        } finally {
          set({ isLoading: false });
        }
      },


      clearCart: async () => {
        const { userId } = get();
        set({ items: [], coupon: null });
        if (userId) await clearCartRemote(userId);
      },

      reverifyCartPrices: async () => {
        const { userId, loadCart, refreshLocalCartOnMount } = get();
        if (userId) {
          await loadCart();
        } else {
          await refreshLocalCartOnMount();
        }
      },

      refreshLocalCartOnMount: async () => {
        const { items, isLoading, userId } = get();
        if (isLoading || items.length === 0 || userId) return;
        
        set({ isLoading: true });
        try {
          // Dynamic import to avoid circular dependencies if any
          const { refreshCartItemsPrices } = await import('@/services/cartService');
          const refreshedItems = await refreshCartItemsPrices(items);
          set({ items: refreshedItems });
        } finally {
          set({ isLoading: false });
        }
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
        userId: state.userId
      })
    }
  )
);

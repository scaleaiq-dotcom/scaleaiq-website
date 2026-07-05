import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  pricingType: "free" | "one_time" | "subscription" | "coming_soon";
  thumbnailUrl: string;
  gradient?: string;
  category: string;
  quantity: number;
}

/** Coupon applied to the cart — single source of truth shared by the cart
 *  drawer and the checkout page, so it's applied once and shown everywhere. */
export interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      coupon: null,

      addItem: (item) => {
        const exists = get().items.find(i => i.id === item.id);
        if (exists) {
          set({ isOpen: true });
          return;
        }
        set(state => ({ items: [...state.items, { ...item, quantity: 1 }], isOpen: true }));
      },

      removeItem: (id) =>
        set(state => ({ items: state.items.filter(i => i.id !== id) })),

      clearCart: () => set({ items: [], coupon: null }),

      setCoupon: (coupon) => set({ coupon }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "scaleaiq-cart" }
  )
);

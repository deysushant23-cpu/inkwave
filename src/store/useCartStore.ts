import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  sku: string;
  size: string;
  color: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  custom_print_metadata?: {
    uploaded_design: string;
    scale: number;
    rotate: number;
    top: number;
    left: number;
    color: string;
  } | null;
}


interface CartState {
  items: CartItem[];
  isCartDrawerOpen: boolean;
  appliedCoins: number;
  couponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setCartDrawerOpen: (isOpen: boolean) => void;
  setAppliedCoins: (coins: number) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartDrawerOpen: false,
      appliedCoins: 0,
      couponCode: null,
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
            ),
            isCartDrawerOpen: true
          };
        }
        return { items: [...state.items, newItem], isCartDrawerOpen: true };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
      setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),
      setAppliedCoins: (coins) => set({ appliedCoins: coins }),
      setCouponCode: (code) => set({ couponCode: code }),
      clearCart: () => set({ items: [], appliedCoins: 0, couponCode: null }),
    }),
    {
      name: 'inkwave-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

import { create } from 'zustand';

interface WishlistState {
  items: string[];
  isLoaded: boolean;
  setWishlist: (items: string[]) => void;
  toggleWish: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  items: [],
  isLoaded: false,
  setWishlist: (items) => set({ items, isLoaded: true }),
  toggleWish: (productId) => set((state) => {
    const isWished = state.items.includes(productId);
    return {
      items: isWished
        ? state.items.filter(id => id !== productId)
        : [...state.items, productId]
    };
  })
}));

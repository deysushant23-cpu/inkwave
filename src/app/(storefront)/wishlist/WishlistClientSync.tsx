'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function WishlistClientSync({ initialWishlist }: { initialWishlist: string[] }) {
  const setWishlist = useWishlistStore(state => state.setWishlist);
  const isLoaded = useWishlistStore(state => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      setWishlist(initialWishlist);
    }
  }, [initialWishlist, isLoaded, setWishlist]);

  return null;
}

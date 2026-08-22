'use client';

import { useEffect } from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { getWishlistAction } from '@/app/actions/wishlist';
import { useAuthStore } from '@/store/useAuthStore';

export default function WishlistGlobalSync() {
  const user = useAuthStore(state => state.user);
  const isSignedIn = !!user;
  const setWishlist = useWishlistStore(state => state.setWishlist);
  const isLoaded = useWishlistStore(state => state.isLoaded);

  useEffect(() => {
    if (isSignedIn && !isLoaded) {
      getWishlistAction().then((res) => {
        if (res.success && res.wishlist) {
          setWishlist(res.wishlist);
        }
      });
    } else if (!isSignedIn && isLoaded) {
      // Clear wishlist on logout
      setWishlist([]);
    }
  }, [isSignedIn, isLoaded, setWishlist]);

  return null;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Search, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUiStore } from '@/store/useUiStore';

export default function MobileDock({ showPrintLab = true }: { showPrintLab?: boolean }) {
  const pathname = usePathname();
  const cartItemsCount = useCartStore((state) => state.items.length);
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems?.length || 0;
  const setSearchModalOpen = useUiStore((state) => state.setSearchModalOpen);

  // Do not show dock on admin or checkout pages to avoid UI collision
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  const isHome = pathname === '/';
  const isShop = pathname?.startsWith('/collections') || pathname?.startsWith('/category');
  const isWishlist = pathname?.startsWith('/wishlist');

  return (
    <nav 
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 shadow-[0_-8px_25px_rgba(0,0,0,0.7)]"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isHome ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110 text-white' : ''}`} />
          <span className="text-[9px] uppercase font-mono tracking-wider">Home</span>
        </Link>

        {/* 2. Shop / Collections */}
        <Link 
          href="/collections" 
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isShop ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Layers className={`w-5 h-5 transition-transform ${isShop ? 'scale-110 text-white' : ''}`} />
          <span className="text-[9px] uppercase font-mono tracking-wider">Shop</span>
        </Link>

        {/* 3. Search */}
        <button 
          onClick={() => setSearchModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95"
          aria-label="Search Catalog"
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] uppercase font-mono tracking-wider">Search</span>
        </button>

        {/* 4. Wishlist */}
        <Link 
          href="/wishlist" 
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isWishlist ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className={`w-5 h-5 transition-transform ${isWishlist ? 'scale-110 text-white' : ''}`} />
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center font-mono">
              {wishlistCount}
            </span>
          )}
          <span className="text-[9px] uppercase font-mono tracking-wider">Wishlist</span>
        </Link>

        {/* 5. Cart / Bag Trigger */}
        <button 
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-95"
          aria-label="Open Shopping Bag"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartItemsCount > 0 && (
            <span className="absolute top-0 right-1.5 w-3.5 h-3.5 bg-white text-black rounded-full text-[8px] font-black flex items-center justify-center font-mono">
              {cartItemsCount}
            </span>
          )}
          <span className="text-[9px] uppercase font-mono tracking-wider">Bag</span>
        </button>

      </div>
    </nav>
  );
}

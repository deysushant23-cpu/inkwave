'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, Wand2, Heart, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';

export default function MobileDock({ showPrintLab = true }: { showPrintLab?: boolean }) {
  const pathname = usePathname();
  const cartItemsCount = useCartStore((state) => state.items.length);
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems.length;

  // Do not show dock on admin or checkout pages to avoid UI collision
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  const isHome = pathname === '/';
  const isShowcase = pathname?.startsWith('/showcase');
  const isCustomPrint = pathname?.startsWith('/custom-print');
  const isWishlist = pathname?.startsWith('/wishlist');

  return (
    <nav 
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--bg)]/95 backdrop-blur-xl border-t border-[var(--line)] px-3 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home */}
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 p-1.5 rounded-none transition-all ${
            isHome ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform ${isHome ? 'scale-110' : ''}`} />
          <span className="text-[10px] uppercase font-mono tracking-wider">Home</span>
        </Link>

        {/* Showcase */}
        <Link 
          href="/showcase" 
          className={`flex flex-col items-center gap-1 p-1.5 rounded-none transition-all ${
            isShowcase ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          <Sparkles className={`w-5 h-5 transition-transform ${isShowcase ? 'scale-110' : ''}`} />
          <span className="text-[10px] uppercase font-mono tracking-wider">Drops</span>
        </Link>

        {/* Custom Print (Conditional) */}
        {showPrintLab && (
          <Link 
            href="/custom-print" 
            className={`flex flex-col items-center gap-1 p-1.5 rounded-none transition-all ${
              isCustomPrint ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
            }`}
          >
            <Wand2 className={`w-5 h-5 transition-transform ${isCustomPrint ? 'scale-110' : ''}`} />
            <span className="text-[10px] uppercase font-mono tracking-wider">Print Lab</span>
          </Link>
        )}

        {/* Wishlist */}
        <Link 
          href="/wishlist" 
          className={`relative flex flex-col items-center gap-1 p-1.5 rounded-none transition-all ${
            isWishlist ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-dim)] hover:text-[var(--text)]'
          }`}
        >
          <Heart className={`w-5 h-5 transition-transform ${isWishlist ? 'scale-110' : ''}`} />
          {wishlistCount > 0 && (
            <span className="absolute 0 top-0.5 right-2 w-4 h-4 bg-rose-500 text-white rounded-none text-[9px] font-black flex items-center justify-center font-mono">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] uppercase font-mono tracking-wider">Saved</span>
        </Link>

        {/* Cart Trigger */}
        <button 
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1.5 rounded-none text-[var(--text-dim)] hover:text-[var(--accent)] transition-all cursor-pointer"
          aria-label="Open Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartItemsCount > 0 && (
            <span className="absolute 0 top-0.5 right-1.5 w-4 h-4 bg-[var(--accent)] text-[var(--bg)] rounded-none text-[9px] font-black flex items-center justify-center font-mono">
              {cartItemsCount}
            </span>
          )}
          <span className="text-[10px] uppercase font-mono tracking-wider">Bag</span>
        </button>

      </div>
    </nav>
  );
}

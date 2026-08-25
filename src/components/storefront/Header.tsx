'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Category } from '@/types/database';
import SearchModal from './SearchModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Menu, 
  X, 
  Search, 
  Heart, 
  ShoppingBag, 
  Sparkles, 
  Wand2, 
  Layers, 
  User, 
  ArrowRight, 
  Home, 
  Truck 
} from 'lucide-react';

// Animation Variants for Smooth Cascading Stagger in Drawer
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -30, rotate: -2, filter: 'blur(3px)' },
  show: { 
    opacity: 1, 
    x: 0,
    rotate: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 }
  }
};

export default function Header({ 
  categories = [],
  showPrintLab = true 
}: { 
  categories?: Category[];
  showPrintLab?: boolean;
}) {
  const { user, setAuthModalOpen } = useAuthStore();
  const pathname = usePathname();
  const cartItemsCount = useCartStore((state) => state.items.length);
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems?.length || 0;
  const router = useRouter();
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavClick = (e?: React.MouseEvent, href?: string) => {
    setMenuOpen(false);
  };

  // Scroll detection for sticky header backdrop styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when side menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Escape key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close side menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const allCategories = categories.filter(c => c.is_active !== false);

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
        <div className="wrap flex items-center justify-between min-h-[40px] sm:min-h-[44px]">
          
          {/* ════════════════════════════════════════════════════════════════
              1. LEFT CORNER: HAMBURGER BUTTON + LOGO MARK + BRAND NAME
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Hamburger Menu Trigger */}
            <button 
              className="p-3 sm:p-2.5 -ml-2 sm:-ml-2 rounded-xl text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--line)]/50 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95 shrink-0 z-50 relative"
              aria-label="Open Navigation Menu"
              onClick={() => setMenuOpen(true)}
            >
              <div className="w-7 h-5 flex flex-col justify-between items-start relative transition-transform duration-300 group-hover:scale-105">
                <span className="w-7 h-[2.5px] bg-current rounded-full transition-all duration-300" />
                <span className="w-5 h-[2.5px] bg-current rounded-full transition-all duration-300 group-hover:w-7" />
                <span className="w-7 h-[2.5px] bg-current rounded-full transition-all duration-300" />
              </div>
              <span className="hidden md:inline text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[var(--text)]">
                Menu
              </span>
            </button>

            {/* Left Corner Logo Lockup */}
            <Link 
              href="/" 
              className="logo-lockup group flex items-center gap-2 sm:gap-2.5 py-1 select-none"
              aria-label="Inkwave Home"
            >
              {/* Animated Logo Mark with Liquid Glow */}
              <div className="relative flex items-center justify-center shrink-0">
                <div className="ink-sink-mark w-8 h-8 sm:w-10 sm:h-10 rounded-full p-1 bg-black/40 border border-white/10 flex items-center justify-center shadow-md backdrop-blur-sm relative">
                  <Image 
                    src="/logo.png" 
                    alt="Inkwave Logo" 
                    fill
                    sizes="40px"
                    priority
                    className="object-contain invert brightness-150 transition-all duration-500 group-hover:scale-110 group-hover:brightness-200" 
                  />
                </div>
                <span className="absolute inset-0 rounded-full bg-[var(--accent)]/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>

              {/* Sunk-in Ink Typography */}
              <div className="relative flex flex-col justify-center overflow-hidden shrink-0">
                <span className="logo-brand-text font-display text-lg sm:text-2xl md:text-[24px] tracking-[0.08em] leading-none uppercase whitespace-nowrap">
                  INKWAVE
                </span>
                <span className="ink-liquid-line absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </Link>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              2. RIGHT CORNER: SEARCH, WISHLIST & CART BAG ALIGNED TOGETHER
              ════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search Icon */}
            <button 
              className="icon-btn p-1.5 rounded-full hover:text-[var(--accent)] transition-all cursor-pointer active:scale-90" 
              aria-label="Search" 
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon */}
            <Link 
              href="/wishlist" 
              className="icon-btn relative p-1.5 rounded-full hover:text-[var(--accent)] transition-all active:scale-90 hidden sm:flex" 
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center font-mono shadow-sm animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button 
              className="icon-btn relative p-1.5 rounded-full hover:text-[var(--accent)] transition-all cursor-pointer active:scale-90" 
              aria-label="Cart"
              onClick={() => setCartDrawerOpen(true)}
            >
              <ShoppingBag className="w-5 h-5" />
              <span className={`bag-count ${cartItemsCount > 0 ? 'show' : ''}`}>
                {cartItemsCount}
              </span>
            </button>

          </div>

        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════
          HIGH-PERFORMANCE SIDE OPENING HAMBURGER DRAWER (WITH RICH MOTION)
          ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Smooth Backdrop Overlay with Fade */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[600]"
            />

            {/* Left Sliding Drawer Panel with Super Quick Motion */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
              className="fixed top-0 left-0 h-[100dvh] w-[85vw] sm:w-[350px] bg-black z-[601] shadow-2xl flex flex-col border-r border-white/10 overflow-hidden"
            >
              {/* Drawer Top Brand Bar */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
                <Link 
                  href="/" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <span className="font-display text-lg uppercase font-bold tracking-widest text-white">
                    INKWAVE
                  </span>
                </Link>
                
                <button 
                  className="p-2 text-white hover:opacity-60 transition-opacity cursor-pointer active:scale-95"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 overscroll-contain relative z-10">
                
                {/* 1. Quick Search Trigger */}
                <div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/30 transition-all text-left cursor-pointer active:scale-[0.98]"
                  >
                    <Search className="w-3.5 h-3.5 text-white/40" />
                    <span>Search styles, fits...</span>
                  </button>
                </div>

                {/* 2. Main Store Navigation */}
                <div className="space-y-1 pt-2">
                  <Link 
                    href="/" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between py-2 text-sm uppercase font-bold tracking-wider text-white border-b border-transparent hover:border-white/20 transition-all"
                  >
                    <span>Home</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link 
                    href="/collections" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between py-2 text-sm uppercase font-bold tracking-wider text-white border-b border-transparent hover:border-white/20 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      Immersive Store
                      <span className="text-[8px] font-mono font-bold uppercase bg-white text-black px-1.5 py-0.5 rounded-sm">
                        REELS
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <Link 
                    href="/showcase" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between py-2 text-sm uppercase font-bold tracking-wider text-white border-b border-transparent hover:border-white/20 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      Showcase & Drops
                      <span className="text-[8px] font-mono font-bold uppercase bg-white text-black px-1.5 py-0.5 rounded-sm">
                        HOT
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  {showPrintLab && (
                    <Link 
                      href="/custom-print" 
                      onClick={() => setMenuOpen(false)} 
                      className="group relative flex items-center justify-between py-2 text-sm uppercase font-bold tracking-wider text-white border-b border-transparent hover:border-white/20 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        3D Print Lab
                        <span className="text-[8px] font-mono font-bold uppercase bg-white text-black px-1.5 py-0.5 rounded-sm">
                          CUSTOM
                        </span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )}
                </div>

                {/* 3. Shop by Category (Dynamic Categories from DB) */}
                <div className="pt-6 border-t border-white/10 space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                    Shop Categories
                  </span>
                  
                  <div className="space-y-1">
                    {allCategories.map(category => (
                      <a 
                        key={category.id} 
                        href={`/category/${category.slug}`} 
                        onClick={(e) => handleNavClick(e, `/category/${category.slug}`)}
                        className="group flex items-center justify-between py-2 text-xs uppercase font-medium tracking-wide text-white/80 hover:text-white transition-colors"
                      >
                        <span>{category.name}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* 4. Customer Care & Essential Redirect Pages */}
                <div className="pt-6 border-t border-white/10 space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40 font-bold block mb-1">
                    Help & Orders
                  </span>

                  <div className="space-y-1">
                    <Link 
                      href="/track-order" 
                      onClick={() => setMenuOpen(false)} 
                      className="group flex items-center justify-between py-2 text-xs uppercase font-medium tracking-wide text-white/80 hover:text-white transition-colors"
                    >
                      <span>Track Your Order</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    <Link 
                      href="/wishlist" 
                      onClick={() => setMenuOpen(false)} 
                      className="group flex items-center justify-between py-2 text-xs uppercase font-medium tracking-wide text-white/80 hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        Saved Wishlist
                        {wishlistCount > 0 && (
                          <span className="bg-white text-black font-bold px-1.5 py-0.5 rounded-sm text-[8px]">
                            {wishlistCount}
                          </span>
                        )}
                      </span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* 5. Account & Profile Hub in the Sidebar Menu */}
              <div 
                className="p-5 border-t border-white/10 bg-black shrink-0"
                style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
              >
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">
                          {user.email?.split('@')[0] || 'Vanguard'}
                        </span>
                        <span className="text-[9px] font-mono text-white/40 truncate max-w-[150px]">
                          {user.email || user.phone || 'Verified'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-[10px] font-mono font-bold text-white hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                      Profile
                    </Link>
                  </div>
                ) : (
                  <button 
                    className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/90 transition-all cursor-pointer active:scale-95"
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    <User className="w-4 h-4" />
                    Sign In / Join
                  </button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

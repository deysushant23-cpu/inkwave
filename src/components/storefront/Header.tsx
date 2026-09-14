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
import { useUiStore } from '@/store/useUiStore';
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

  const searchModalOpen = useUiStore((state) => state.searchModalOpen);
  const setSearchModalOpen = useUiStore((state) => state.setSearchModalOpen);

  const isSearchActive = searchOpen || searchModalOpen;
  const setCombinedSearchOpen = (open: boolean) => {
    setSearchOpen(open);
    setSearchModalOpen(open);
  };

  const allCategories = categories.filter(c => c.is_active !== false);

  // Dynamic Category Slugs
  const tshirtsCat = allCategories.find(c => {
    const s = (c.slug || '').toLowerCase();
    const n = (c.name || '').toLowerCase();
    return s.includes('t-shirt') || s.includes('tshirt') || s.includes('tee') || n.includes('t-shirt') || n.includes('tshirt') || n.includes('tee');
  });
  const tshirtsHref = tshirtsCat ? `/category/${tshirtsCat.slug}` : '/collections';

  const bottomsCat = allCategories.find(c => {
    const s = (c.slug || '').toLowerCase();
    const n = (c.name || '').toLowerCase();
    return s.includes('bottom') || s.includes('jean') || s.includes('pant') || s.includes('cargo') || s.includes('denim') || n.includes('bottom') || n.includes('jean') || n.includes('pant') || n.includes('cargo') || n.includes('denim');
  });
  const bottomsHref = bottomsCat ? `/category/${bottomsCat.slug}` : '/collections';

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/category/')) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
        <div className="wrap flex items-center justify-between min-h-[44px]">
          
          {/* ════════════════════════════════════════════════════════════════
              1. LEFT: HAMBURGER (MOBILE/ALL) + BRAND LOGO LOCKUP
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Hamburger Menu Trigger (Mobile & Quick Drawer) */}
            <button 
              className="lg:hidden p-2 sm:p-2.5 -ml-2 rounded-xl text-[var(--text)] hover:text-[var(--accent)] hover:bg-[var(--line)]/50 transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-95 shrink-0 z-50 relative"
              aria-label="Open Navigation Menu"
              onClick={() => setMenuOpen(true)}
            >
              <div className="w-6 h-4 flex flex-col justify-between items-start relative transition-transform duration-300 group-hover:scale-105">
                <span className="w-6 h-[2px] bg-current rounded-full transition-all duration-300" />
                <span className="w-4 h-[2px] bg-current rounded-full transition-all duration-300 group-hover:w-6" />
                <span className="w-6 h-[2px] bg-current rounded-full transition-all duration-300" />
              </div>
            </button>

            {/* Left Corner Logo Lockup */}
            <Link 
              href="/" 
              className="logo-lockup group flex items-center gap-2.5 sm:gap-3 py-1 select-none"
              aria-label="Inkwave Home"
            >
              <div className="relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9">
                <Image 
                  src="/logo.png" 
                  alt="Inkwave Logo" 
                  fill
                  sizes="36px"
                  priority
                  className="object-contain invert brightness-200 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                />
              </div>

              <div className="relative flex flex-col justify-center shrink-0">
                <span className="logo-brand-text font-display text-lg sm:text-2xl md:text-[22px] tracking-[0.1em] font-black uppercase whitespace-nowrap text-white group-hover:text-[var(--accent)] transition-colors duration-300">
                  INKWAVE
                </span>
                <span className="ink-liquid-line absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              2. DESKTOP CENTER NAVIGATION LINKS (CLEAN & EDITORIAL)
          ════════════════════════════════════════════════════════════════ */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link 
              href="/collections" 
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all relative ${
                isLinkActive('/collections') 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>SHOP</span>
              {isLinkActive('/collections') && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
              )}
            </Link>

            <Link 
              href={tshirtsHref} 
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all relative ${
                pathname === tshirtsHref 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>T-SHIRTS</span>
              {pathname === tshirtsHref && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
              )}
            </Link>

            <Link 
              href={bottomsHref} 
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all relative ${
                pathname === bottomsHref 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>BOTTOMS</span>
              {pathname === bottomsHref && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
              )}
            </Link>

            <Link 
              href="/showcase" 
              className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all relative ${
                isLinkActive('/showcase') 
                  ? 'text-white' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1">
                <span>NEW ARRIVALS</span>
              </span>
              {isLinkActive('/showcase') && (
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
              )}
            </Link>

            {showPrintLab && (
              <Link 
                href="/custom-print" 
                className={`ml-1 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 border ${
                  isLinkActive('/custom-print')
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-white/5 text-neutral-300 border-white/15 hover:border-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                <Wand2 className="w-3 h-3 text-[var(--accent)]" />
                <span>3D LAB</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  ₹600
                </span>
              </Link>
            )}
          </nav>

          {/* ════════════════════════════════════════════════════════════════
              3. RIGHT: SEARCH, ACCOUNT, WISHLIST & CART BAG
          ════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            
            {/* Search Icon */}
            <button 
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-90" 
              aria-label="Search Catalog" 
              onClick={() => setCombinedSearchOpen(true)}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Account Icon / Link */}
            {user ? (
              <Link 
                href="/profile" 
                className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-90 hidden sm:flex items-center justify-center"
                aria-label="User Profile"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-90 hidden sm:flex items-center justify-center cursor-pointer"
                aria-label="Sign In"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Wishlist Icon */}
            <Link 
              href="/wishlist" 
              className="relative p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all active:scale-90 hidden sm:flex items-center justify-center" 
              aria-label="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center font-mono shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button 
              className="relative p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer active:scale-90 flex items-center justify-center" 
              aria-label="Shopping Bag"
              onClick={() => setCartDrawerOpen(true)}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white text-black rounded-full text-[9px] font-black flex items-center justify-center font-mono shadow-sm">
                  {cartItemsCount}
                </span>
              )}
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
                  className="flex items-center gap-2.5 group"
                >
                  <div className="relative w-6 h-6 shrink-0">
                    <Image 
                      src="/logo.png" 
                      alt="Inkwave Logo" 
                      fill
                      sizes="24px"
                      className="object-contain invert brightness-200" 
                    />
                  </div>
                  <span className="font-display text-lg uppercase font-bold tracking-widest text-white group-hover:text-[var(--accent)] transition-colors">
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
                    href="/#immersive-store" 
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

      <SearchModal isOpen={isSearchActive} onClose={() => setCombinedSearchOpen(false)} />
    </>
  );
}

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
              transition={{ duration: 0.25 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[600]"
            />

            {/* Left Sliding Drawer Panel with 3D Spring Perspective Motion */}
            <motion.div 
              initial={{ x: '-100%', rotateY: -10, skewX: -1, opacity: 0 }}
              animate={{ x: 0, rotateY: 0, skewX: 0, opacity: 1 }}
              exit={{ x: '-100%', rotateY: -10, skewX: -1, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 230, mass: 0.85 }}
              style={{ transformOrigin: 'left center', perspective: 1200 }}
              className="fixed top-0 left-0 h-[100dvh] w-[85vw] sm:w-[380px] max-w-[420px] bg-black/90 sm:bg-black/85 backdrop-blur-3xl z-[601] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col border-r border-white/10 overflow-hidden relative"
            >
              {/* Floating Premium Ambient Glow Orbs */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div 
                  animate={{
                    scale: [1, 1.15, 1],
                    x: [0, 30, 0],
                    y: [0, -20, 0],
                    rotate: [0, 90, 0],
                  }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[var(--accent)]/10 blur-[60px]"
                />
                <motion.div 
                  animate={{
                    scale: [1, 1.2, 1],
                    x: [0, -30, 0],
                    y: [0, 40, 0],
                    rotate: [0, -90, 0],
                  }}
                  transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[var(--accent)]/5 blur-[80px]"
                />
              </div>

              {/* Glowing Neon Edge Trim */}
              <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent opacity-75 shadow-[0_0_15px_var(--accent)] pointer-events-none z-10" />

              {/* Drawer Top Brand Bar */}
              <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-black/30 shrink-0 relative z-10">
                <Link 
                  href="/" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-full p-1 bg-black/60 border border-white/10 flex items-center justify-center shadow-xs group-hover:border-[var(--accent)] transition-colors relative">
                    <Image 
                      src="/logo.png" 
                      alt="Inkwave" 
                      fill
                      sizes="32px"
                      className="object-contain invert brightness-150" 
                    />
                  </div>
                  <span className="font-display text-xl uppercase font-bold tracking-widest text-[var(--text)]">
                    INKWAVE
                  </span>
                </Link>
                
                <button 
                  className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--accent)] hover:rotate-90 hover:text-[var(--accent)] text-[var(--text)] transition-all duration-300 cursor-pointer active:scale-90"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Navigation Body with Staggered Cascading Elements */}
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-5 overscroll-contain relative z-10"
              >
                
                {/* 1. Quick Search Trigger */}
                <motion.div variants={itemVariants}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4.5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--accent)]/30 hover:bg-white/[0.05] transition-all text-left shadow-xs cursor-pointer active:scale-98"
                  >
                    <Search className="w-4 h-4 text-[var(--accent)]" />
                    <span>Search styles, fits, products...</span>
                  </button>
                </motion.div>

                {/* 2. Main Store Navigation */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--accent)] font-bold block mb-2 px-2">
                    Direct Navigation
                  </span>

                  <Link 
                    href="/" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl font-display text-lg uppercase font-bold text-[var(--text)] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-[var(--accent)]/20 hover:text-[var(--accent)] transition-all active:translate-x-1"
                  >
                    <span className="flex items-center gap-3.5 pl-1">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/10 transition-colors">
                        <Home className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      Home
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--text-dim)] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link 
                    href="/collections" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl font-display text-lg uppercase font-bold text-[var(--text)] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-[var(--accent)]/20 hover:text-[var(--accent)] transition-all active:translate-x-1"
                  >
                    <span className="flex items-center gap-3.5 pl-1">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/10 transition-colors">
                        <Sparkles className="w-4 h-4 text-[var(--accent)] animate-pulse" />
                      </div>
                      Immersive Store
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 px-2 py-0.5 rounded-full shrink-0">
                      REELS & SALES
                    </span>
                  </Link>

                  <Link 
                    href="/showcase" 
                    onClick={() => setMenuOpen(false)} 
                    className="group relative flex items-center justify-between p-3.5 rounded-2xl font-display text-lg uppercase font-bold text-[var(--text)] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-[var(--accent)]/20 hover:text-[var(--accent)] transition-all active:translate-x-1"
                  >
                    <span className="flex items-center gap-3.5 pl-1">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/10 transition-colors">
                        <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      </div>
                      Showcase & Drops
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase bg-amber-400/15 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full animate-pulse shrink-0">
                      HOT
                    </span>
                  </Link>

                  {showPrintLab && (
                    <Link 
                      href="/custom-print" 
                      onClick={() => setMenuOpen(false)} 
                      className="group relative flex items-center justify-between p-3.5 rounded-2xl font-display text-lg uppercase font-bold text-[var(--text)] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-[var(--accent)]/20 hover:text-[var(--accent)] transition-all active:translate-x-1"
                    >
                      <span className="flex items-center gap-3.5 pl-1">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/10 transition-colors">
                          <Wand2 className="w-4 h-4 text-purple-400" />
                        </div>
                        3D Print Lab
                      </span>
                      <span className="text-[9px] font-mono font-bold uppercase bg-purple-400/15 text-purple-400 border border-purple-400/30 px-2 py-0.5 rounded-full shrink-0">
                        CUSTOM
                      </span>
                    </Link>
                  )}
                </motion.div>

                {/* 3. Shop by Category (Dynamic Categories from DB) */}
                <motion.div variants={itemVariants} className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold block">
                      Shop Categories
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-dim)]">
                      {allCategories.length} Categories
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    {allCategories.map(category => (
                      <a 
                        key={category.id} 
                        href={`/category/${category.slug}`} 
                        onClick={(e) => handleNavClick(e, `/category/${category.slug}`)}
                        className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-[var(--text)] bg-white/[0.01] border border-white/[0.02] hover:text-[var(--accent)] hover:bg-white/[0.04] hover:border-[var(--accent)]/10 transition-all active:translate-x-1"
                      >
                        <span className="flex items-center gap-3">
                          <Layers className="w-3.5 h-3.5 text-[var(--text-dim)]" />
                          {category.name}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)] opacity-40" />
                      </a>
                    ))}
                  </div>
                </motion.div>

                {/* 4. Customer Care & Essential Redirect Pages */}
                <motion.div variants={itemVariants} className="pt-4 border-t border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold block mb-1 px-2">
                    Help & Orders
                  </span>

                  <Link 
                    href="/track-order" 
                    onClick={() => setMenuOpen(false)} 
                    className="flex items-center justify-between p-3 rounded-xl text-xs font-mono uppercase tracking-wider text-[var(--text)] bg-white/[0.01] border border-white/[0.02] hover:text-[var(--accent)] hover:bg-white/[0.04] hover:border-[var(--accent)]/10 transition-all active:translate-x-1"
                  >
                    <span className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-[var(--accent)]" /> Track Your Order
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)] opacity-40" />
                  </Link>

                  <Link 
                    href="/wishlist" 
                    onClick={() => setMenuOpen(false)} 
                    className="flex items-center justify-between p-3 rounded-xl text-xs font-mono uppercase tracking-wider text-[var(--text)] bg-white/[0.01] border border-white/[0.02] hover:text-[var(--accent)] hover:bg-white/[0.04] hover:border-[var(--accent)]/10 transition-all active:translate-x-1"
                  >
                    <span className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-rose-500" /> Saved Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </motion.div>

              </motion.div>

              {/* 5. Account & Profile Hub in the Sidebar Menu */}
              <div 
                className="p-4 sm:p-5 border-t border-white/5 bg-black/60 backdrop-blur-md shrink-0 relative z-10"
                style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
              >
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-black flex items-center justify-center font-bold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[var(--text)] truncate max-w-[170px]">
                          {user.email?.split('@')[0] || 'Streetwear VIP'}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-dim)] truncate max-w-[170px]">
                          {user.email || user.phone || 'Verified Member'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-alt)] border border-white/5 text-xs font-mono font-bold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all active:scale-95"
                    >
                      Profile
                    </Link>
                  </div>
                ) : (
                  <button 
                    className="w-full py-3.5 rounded-2xl bg-[var(--accent)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-[var(--accent)]/20 active:scale-98"
                    onClick={() => {
                      setMenuOpen(false);
                      setAuthModalOpen(true);
                    }}
                  >
                    <User className="w-4 h-4" />
                    Sign In / Join Vanguard
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

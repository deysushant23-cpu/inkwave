'use client';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingBag, ArrowRight, Check, X, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  index: number;
  isBig?: boolean;
  viewMode?: 'grid' | 'list';
}

const APPAREL_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'OS', 'FREE SIZE'];
const JEANS_ORDER = ['28', '30', '32', '34', '36', '38', '40'];

export default function ProductCard({ product, index, isBig = false, viewMode = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWish = useWishlistStore((state) => state.toggleWish);
  
  const [mounted, setMounted] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isWished = mounted && wishlistItems ? wishlistItems.includes(product.id) : false;
  
  // 3D Tilt & Hover State
  const [tiltStyle, setTiltStyle] = useState({ transform: '', mouseX: '50%', mouseY: '50%' });
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic Badges & Pricing Matrix
  const variants = product.product_variants || [];
  const price = product.base_price || product.price || 0;
  const rawCompare = product.compare_at_price ?? product.compareAtPrice ?? variants.find((v: any) => v.compare_at_price)?.compare_at_price ?? null;
  const wasPrice = rawCompare && Number(rawCompare) > Number(price) ? Number(rawCompare) : null;
  const discountPercent = wasPrice ? Math.round(((Number(wasPrice) - Number(price)) / Number(wasPrice)) * 100) : (product.discount_percent ?? null);

  const isOnSale = Boolean(product.is_sale || product.isSale || (wasPrice && wasPrice > price) || product.customBadge?.toUpperCase() === 'SALE');
  const saleBadgeText = product.sale_badge_text || (isOnSale ? 'SALE' : null);

  // Determine active badge
  let activeBadge: { label: string; className: string } | null = null;
  if (isOnSale) {
    activeBadge = {
      label: saleBadgeText || 'SALE',
      className: 'bg-[#FF1E56] text-white font-black shadow-[0_4px_14px_rgba(255,30,86,0.5)] border border-white/20'
    };
  } else if (product.customBadge) {
    activeBadge = {
      label: product.customBadge,
      className: 'bg-white text-black font-extrabold shadow-md'
    };
  } else if (product.is_drop) {
    activeBadge = {
      label: 'LIMITED DROP',
      className: 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/20'
    };
  } else if (product.is_new || product.isNew) {
    activeBadge = {
      label: 'NEW',
      className: 'bg-white text-black font-extrabold shadow-md'
    };
  } else if (product.is_bestseller) {
    activeBadge = {
      label: 'BESTSELLER',
      className: 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/20'
    };
  }

  const primaryImg = (Array.isArray(product.images) && product.images[0]) || product.overlay_mask_url || product.image_url || '';
  const secondaryImg = (Array.isArray(product.images) && product.images[1]) || null;

  // Extract distinct sizes with stock info
  const rawCat = product.categories?.name || '';
  const isJeansCat = rawCat.toLowerCase().includes('jean') || rawCat.toLowerCase().includes('pant') || rawCat.toLowerCase().includes('bottom');
  const sizePreset = isJeansCat ? JEANS_ORDER : APPAREL_ORDER;

  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean))).sort((a: any, b: any) => {
    const idxA = sizePreset.indexOf(a);
    const idxB = sizePreset.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return a.localeCompare(b);
  });

  const handleExecuteAdd = (sizeToSelect?: string) => {
    let targetVariant = null;
    if (sizeToSelect) {
      targetVariant = variants.find((v: any) => v.size === sizeToSelect);
    }
    if (!targetVariant && variants.length > 0) {
      targetVariant = variants[0];
    }

    const itemPrice = targetVariant?.price_override ?? product.base_price ?? product.price ?? 0;
    const itemSize = sizeToSelect || targetVariant?.size || 'OS';
    const itemSku = targetVariant?.sku || product.sku || '';
    const itemVariantId = targetVariant?.id || product.id;

    addItem({
      id: `${product.id}-${itemVariantId}`,
      product_id: product.id,
      variant_id: itemVariantId,
      title: product.title || product.name,
      price: itemPrice,
      quantity: 1,
      image_url: primaryImg,
      sku: itemSku,
      size: itemSize,
      color: targetVariant?.color || null
    });

    setIsAddedSuccess(true);
    setIsQuickAddOpen(false);
    toast.success(`Added ${product.title || 'item'} (${itemSize}) to bag`);
    setCartDrawerOpen(true);

    setTimeout(() => {
      setIsAddedSuccess(false);
    }, 2000);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If multiple sizes exist, open in-card size picker
    if (availableSizes.length > 1) {
      setIsQuickAddOpen(prev => !prev);
    } else {
      // 1 size or no variant breakdown -> add immediately
      handleExecuteAdd(availableSizes[0] as string | undefined);
    }
  };

  const handleWishToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWish(product.id);
    
    const res = await toggleWishlistAction(product.id);
    if (!res.success) {
      const errorMsg = res.error === 'Unauthorized' ? 'Please login first to save items to your wishlist' : (res.error || 'Please login first to save items to your wishlist');
      toast.error(errorMsg);
      toggleWish(product.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    
    const rotateX = (yPct - 0.5) * -8; 
    const rotateY = (xPct - 0.5) * 8;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
      mouseX: `${xPct * 100}%`,
      mouseY: `${yPct * 100}%`
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)', mouseX: '50%', mouseY: '50%' });
  };

  const name = product.title || product.name;

  // Safe category label extraction
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  const categoryLabel = rawCat || (!isUUID(product.category_id || '') ? product.category_id?.replace('cat_', '')?.replace(/-/g, ' ') : '') || 'STREETWEAR';

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div 
        className="group relative flex flex-row items-center sm:items-stretch gap-3 sm:gap-6 w-full bg-neutral-950/80 hover:bg-neutral-900/90 border border-white/10 hover:border-white/25 p-3 sm:p-5 rounded-2xl transition-all duration-300 shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 3:4 Left Thumbnail */}
        <Link 
          href={`/product/${product.slug || product.id}`} 
          className="relative w-28 sm:w-40 md:w-48 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-white/25"
        >
          {activeBadge && (
            <span className={`absolute top-2 left-2 z-20 text-[8px] sm:text-[9px] tracking-wider px-2 py-0.5 rounded-full uppercase font-black ${activeBadge.className}`}>
              {activeBadge.label}
            </span>
          )}
          {primaryImg ? (
            <Image
              src={primaryImg}
              alt={name || 'Product'}
              fill
              sizes="(max-width: 640px) 120px, 200px"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-[10px]">
              No Image
            </div>
          )}
        </Link>

        {/* Right Info Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                {categoryLabel}
              </span>
              <button 
                type="button" 
                onClick={handleWishToggle} 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isWished ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
                }`}
                aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className="w-4 h-4" fill={isWished ? "currentColor" : "none"} />
              </button>
            </div>

            <Link href={`/product/${product.slug || product.id}`} className="block group/title">
              <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white group-hover/title:text-neutral-300 transition-colors line-clamp-1 sm:line-clamp-2">
                {name}
              </h3>
            </Link>

            <div className="flex items-center gap-2 font-mono flex-wrap pt-0.5">
              <span className="text-sm sm:text-base md:text-lg font-bold text-white">
                {formatPrice(price)}
              </span>
              {wasPrice && (
                <span className="text-xs sm:text-sm text-neutral-400 line-through">
                  {formatPrice(wasPrice)}
                </span>
              )}
              {discountPercent && discountPercent > 0 && (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Available Sizes preview */}
            {availableSizes.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Sizes:</span>
                <div className="flex items-center gap-1">
                  {availableSizes.slice(0, 5).map((s: any) => (
                    <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3">
            <button 
              type="button"
              onClick={handleQuickAddClick} 
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black hover:bg-neutral-200 font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isAddedSuccess ? 'Added ✓' : 'Add to Bag'}</span>
            </button>
            <Link 
              href={`/product/${product.slug || product.id}`} 
              className="px-4 sm:px-5 py-2 sm:py-2.5 border border-white/20 hover:border-white text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <span>View Piece</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid View Layout
  return (
    <div 
      className={`group relative flex flex-col w-full min-w-0 ${isBig ? 'md:col-span-2' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...tiltStyle,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
      } as React.CSSProperties}
    >
      <div className="relative w-full">
        {/* Strictly Locked 3:4 Media Box */}
        <div 
          className="relative w-full rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
          style={{ aspectRatio: '3 / 4', width: '100%' }}
        >
          {/* Badge */}
          {activeBadge && (
            <span className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 text-[8px] sm:text-[9px] tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md uppercase font-black leading-none ${activeBadge.className}`}>
              {activeBadge.label}
            </span>
          )}
          
          {/* Wishlist Button */}
          <button 
            type="button"
            onClick={handleWishToggle}
            suppressHydrationWarning
            className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 cursor-pointer ${
              isWished 
                ? 'text-rose-500 scale-105 border-rose-500/30' 
                : 'text-white/80 hover:text-white hover:scale-105'
            }`}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={isWished ? "currentColor" : "none"} />
          </button>

          {/* Primary & Secondary Images */}
          <Link href={`/product/${product.slug || product.id}`} className="block absolute inset-0 w-full h-full overflow-hidden">
            {primaryImg ? (
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={primaryImg} 
                  alt={name || 'Product'} 
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={`object-cover object-center transition-all duration-500 group-hover:scale-105 block ${
                    secondaryImg && isHovered ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {secondaryImg && (
                  <Image 
                    src={secondaryImg} 
                    alt={`${name || 'Product'} - alternate view`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover object-center absolute inset-0 transition-all duration-500 group-hover:scale-105 block ${
                      isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 text-neutral-600 font-mono text-[10px] uppercase">
                No Image
              </div>
            )}
          </Link>
          
          {/* Mobile Quick-Add Floating Touch Button */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            aria-label="Quick Add to Bag"
            className="sm:hidden absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white text-black shadow-lg flex items-center justify-center active:scale-90 transition-transform cursor-pointer font-bold"
          >
            {isAddedSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Plus className="w-4 h-4" />}
          </button>

          {/* Desktop Quick-Add Slide-up Bar */}
          <div className="hidden sm:block absolute bottom-2.5 left-2.5 right-2.5 z-20 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickAddClick}
              className={`w-full py-2.5 px-3 bg-white text-black hover:bg-neutral-200 active:scale-98 font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isAddedSuccess ? 'bg-emerald-400 text-black' : ''
              }`}
            >
              {isAddedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          </div>

          {/* ── INTERACTIVE SIZE SELECTOR DRAWER / OVERLAY ── */}
          <AnimatePresence>
            {isQuickAddOpen && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 z-30 bg-black/95 backdrop-blur-xl p-3 border-t border-white/20 rounded-b-2xl flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                    Select Size:
                  </span>
                  <button 
                    onClick={() => setIsQuickAddOpen(false)}
                    className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close size selector"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {availableSizes.map((size: any) => {
                    const variantForSize = variants.find((v: any) => v.size === size);
                    const stock = variantForSize ? (variantForSize.stock_quantity - (variantForSize.reserved_stock || 0)) : 1;
                    const isOutOfStock = stock <= 0;

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleExecuteAdd(size)}
                        className={`py-1.5 px-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all border text-center ${
                          isOutOfStock 
                            ? 'opacity-30 border-white/10 line-through text-neutral-600 cursor-not-allowed bg-transparent' 
                            : 'bg-white/10 hover:bg-white hover:text-black border-white/20 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
      
      {/* Product Details Area */}
      <div className="mt-2.5 flex flex-col gap-0.5 px-0.5 text-left">
        <Link href={`/product/${product.slug || product.id}`} className="group/title">
          <h3 
            className="text-xs sm:text-sm font-bold text-white truncate group-hover/title:text-neutral-300 transition-colors leading-snug"
            title={name}
          >
            {name}
          </h3>
        </Link>
        <p className="text-[9px] sm:text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider truncate leading-tight">
          {categoryLabel}
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 font-mono flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-white">
            {formatPrice(price)}
          </span>
          {wasPrice && (
            <span className="text-[10px] sm:text-xs text-neutral-400 line-through">
              {formatPrice(wasPrice)}
            </span>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 leading-none">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

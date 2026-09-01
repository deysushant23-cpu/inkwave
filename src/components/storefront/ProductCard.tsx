'use client';

import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  index: number;
  isBig?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, index, isBig = false, viewMode = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const setCartDrawerOpen = useCartStore((state) => state.setCartDrawerOpen);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWish = useWishlistStore((state) => state.toggleWish);
  
  const [mounted, setMounted] = useState(false);
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const firstVariant = variants && variants.length > 0 ? variants[0] : null;
    const itemPrice = firstVariant?.price_override ?? product.base_price ?? product.price ?? 0;
    const itemSize = firstVariant?.size || 'OS';
    const itemSku = firstVariant?.sku || product.sku || '';
    const itemVariantId = firstVariant?.id || product.id;

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
      color: firstVariant?.color || null
    });
    
    setCartDrawerOpen(true);
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
  const rawCat = product.categories?.name;
  const categoryLabel = rawCat || (!isUUID(product.category_id || '') ? product.category_id?.replace('cat_', '')?.replace(/-/g, ' ') : '') || 'STREETWEAR';

  // List View Layout
  if (viewMode === 'list') {
    return (
      <div 
        className="group relative flex flex-row items-center sm:items-stretch gap-3 sm:gap-6 w-full bg-neutral-950/60 hover:bg-neutral-900/80 border border-white/10 hover:border-white/25 p-3 sm:p-5 rounded-2xl transition-all duration-300 shadow-md"
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
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-wider">
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

            {/* Available Sizes preview if present */}
            {variants.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Sizes:</span>
                <div className="flex items-center gap-1">
                  {variants.slice(0, 5).map((v: any) => (
                    <span key={v.id} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-neutral-300">
                      {v.size || 'OS'}
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
              onClick={handleQuickAdd} 
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-black hover:bg-neutral-200 font-bold font-mono text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag</span>
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
      <Link href={`/product/${product.slug || product.id}`} className="block relative w-full">
        {/* Strictly Locked 3:4 Media Box */}
        <div 
          className="relative w-full rounded-none overflow-hidden bg-neutral-900 border border-white/10 transition-all duration-300 group-hover:border-white/25 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          style={{ aspectRatio: '3 / 4', width: '100%' }}
        >
          {/* Badge */}
          {activeBadge && (
            <span className={`absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-20 text-[8px] sm:text-[10px] tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-none uppercase leading-none ${activeBadge.className}`}>
              {activeBadge.label}
            </span>
          )}
          
          {/* Wishlist Button */}
          <button 
            type="button"
            onClick={handleWishToggle}
            suppressHydrationWarning
            className={`absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 z-20 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center transition-all duration-300 ${
              isWished 
                ? 'text-rose-500 scale-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' 
                : 'text-white/85 hover:text-white hover:scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
            }`}
            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg 
              viewBox="0 0 24 24" 
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isWished ? 'scale-110' : 'group-hover:scale-110'}`}
              fill={isWished ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth={isWished ? "0" : "2"}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>

          {/* Images with Absolute Strict Fill */}
          {primaryImg ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden">
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
          
          {/* Mobile Quick-Add Floating Touch Button (+ Icon) */}
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label="Quick Add"
            className="sm:hidden absolute bottom-2.5 right-2.5 z-20 w-7 h-7 rounded-none bg-white text-black shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 3 }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>

          {/* Desktop Quick-Add Slide-up Button */}
          <div className="hidden sm:block absolute bottom-3 left-3 right-3 z-20 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-neutral-200 active:scale-98 font-bold text-xs uppercase tracking-wider rounded-none shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2.5 }}>
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Quick add
            </button>
          </div>
        </div>
      </Link>
      
      {/* Product Details Area */}
      <div className="mt-2 sm:mt-2.5 flex flex-col gap-0.5 sm:gap-1 px-0.5 text-left">
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
            <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-none border border-emerald-500/20 leading-none">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

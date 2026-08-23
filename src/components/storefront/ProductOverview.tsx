'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { toggleWishlistAction } from '@/app/actions/wishlist';
import { subscribeToRestockAction } from '@/app/actions/notify';
import { formatPrice } from '@/lib/utils';
import { 
  ShoppingBag, 
  Zap, 
  Heart, 
  Ruler, 
  ZoomIn, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Check, 
  X,
  Layers,
  Scissors,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import PincodeDeliveryChecker from '@/components/storefront/PincodeDeliveryChecker';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const JEANS_SIZES = ['26', '28', '30', '32', '34', '36', '38'];
const FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDnYTdoMDJP7N9ElHyVkd01fqa1Ih0IrDsBQEie4IcxABAxvP30z7Tra3_I0qX6E_nICHdevsFI9s0WL2kTovn9oU98mIf4XvZOHMEDQxNSXYa_AsHsP8_4-8PQ0a7ofbGUlmgG3Pduq_2dreLpHjy19V3b85Iyl6LmZIvBCn5YIpf4lG484UQFSTgyyFU76oFvnmqMe6hViOtrdYCxVZcFJutw9KqlPKJFhaRTPwSkGT44UqbQI9sg';

function isJeans(cat: string) {
  const l = cat.toLowerCase();
  return l.includes('jean') || l.includes('denim') || l.includes('pant') || l.includes('trouser') || l.includes('bottom');
}

function orderedSizes(sizes: string[], jeans: boolean) {
  const preset = jeans ? JEANS_SIZES : APPAREL_SIZES;
  return [...sizes.filter(s => preset.includes(s)).sort((a, b) => preset.indexOf(a) - preset.indexOf(b)),
          ...sizes.filter(s => !preset.includes(s)).sort()];
}

/* ── component ────────────────────────────────────────────────────────────── */
export default function ProductOverview({
  product,
  variants,
  categoryName = 'Product',
  averageRating = '0.0',
  reviewCount = 0,
}: {
  product: any;
  variants: any[];
  categoryName?: string;
  averageRating?: string | number;
  reviewCount?: number;
}) {
  const router = useRouter();
  const { addItem, setCartDrawerOpen } = useCartStore();

  /* images */
  const rawImgs: string[] =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.overlay_mask_url || product.image_url].filter(Boolean);
  const allImages = rawImgs.length > 0 ? rawImgs : [FALLBACK];
  const total = allImages.length;

  const [activeIdx, setActiveIdx] = useState(0);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const [zoomed, setZoomed] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('fabric');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  /* filter variants */
  const activeProductVariants = variants.filter(v => v.status !== 'disabled');

  /* size */
  const jeansMode = isJeans(categoryName);
  const rawSizes = Array.from(new Set(activeProductVariants.map(v => v.size).filter(Boolean)));
  const displaySizes = orderedSizes(rawSizes, jeansMode).length > 0
    ? orderedSizes(rawSizes, jeansMode)
    : jeansMode ? JEANS_SIZES.slice(0, 5) : ['S', 'M', 'L', 'XL', 'XXL'];

  const [selectedSize, setSelectedSize] = useState<string | null>(displaySizes[0] || null);
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWish = useWishlistStore((state) => state.toggleWish);
  const isWishlisted = wishlistItems.includes(product.id);

  const selectedVariant = activeProductVariants.find(v => v.size === selectedSize);
  const price = selectedVariant?.price_override ?? product.base_price ?? product.price ?? 0;
  const rawComparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price ?? product.compareAtPrice ?? null;
  const original = rawComparePrice !== null && Number(rawComparePrice) > Number(price) ? Number(rawComparePrice) : null;
  const discount = original ? Math.round(((original - price) / original) * 100) : null;

  const stockQty = selectedVariant ? (selectedVariant.stock_quantity - (selectedVariant.reserved_stock || 0)) : null;
  const oos = stockQty !== null && stockQty <= 0;
  const lowStock = stockQty !== null && stockQty > 0 && stockQty <= 5;

  /* gallery nav */
  const goTo = useCallback((n: number, d: 1 | -1 = 1) => {
    setSlideDir(d);
    setActiveIdx((n + total) % total);
  }, [total]);

  // Ensure page starts at top of Product Overview on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Safely scroll thumbnail strip inside its own container without scrolling window viewport
  useEffect(() => {
    if (activeIdx === 0) return;
    const rail = thumbsRef.current;
    if (!rail) return;
    const target = rail.children[activeIdx] as HTMLElement;
    if (target) {
      rail.scrollTo({ top: target.offsetTop - 10, behavior: 'smooth' });
    }
  }, [activeIdx]);

  /* touch swipe */
  const tx = useRef(0);

  /* add to cart */
  const handleAddToCart = () => {
    if (!selectedSize) { 
      toast.error('Please select a size first'); 
      return false; 
    }
    if (oos) { 
      toast.error('This size is currently out of stock'); 
      return false; 
    }
    addItem({
      id: `${product.id}-${selectedVariant?.id ?? selectedSize}`,
      product_id: product.id,
      variant_id: selectedVariant?.id ?? '',
      title: product.title ?? product.name,
      sku: selectedVariant?.sku ?? '',
      size: selectedSize,
      color: selectedVariant?.color ?? null,
      price,
      quantity: 1,
      image_url: allImages[0],
    });
    toast.success(`Added ${selectedSize} to your bag!`);
    setCartDrawerOpen(true);
    return true;
  };

  /* notify me */
  const handleNotifyMe = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedSize) return;

    if (!showNotifyForm) {
      setShowNotifyForm(true);
      return;
    }

    if (!notifyEmail) {
      toast.error('Please enter your email to get notified');
      return;
    }

    setIsNotifying(true);
    const formData = new FormData();
    formData.append('email', notifyEmail);
    formData.append('product_id', product.id);
    if (selectedVariant?.id) formData.append('variant_id', selectedVariant.id);

    const res = await subscribeToRestockAction(formData);
    
    if (res.success) {
      toast.success(`You're on the list! We'll notify ${notifyEmail} when size ${selectedSize} is back.`);
      setShowNotifyForm(false);
      setNotifyEmail('');
    } else {
      toast.error(res.error || 'Failed to save notification request.');
    }
    setIsNotifying(false);
  };

  /* buy now (direct checkout) */
  const handleBuyNow = () => {
    if (!selectedSize) { 
      toast.error('Please select a size first'); 
      return; 
    }
    if (oos) { 
      toast.error('This size is currently out of stock'); 
      return; 
    }
    addItem({
      id: `${product.id}-${selectedVariant?.id ?? selectedSize}`,
      product_id: product.id,
      variant_id: selectedVariant?.id ?? '',
      title: product.title ?? product.name,
      sku: selectedVariant?.sku ?? '',
      size: selectedSize,
      color: selectedVariant?.color ?? null,
      price,
      quantity: 1,
      image_url: allImages[0],
    });
    router.push('/checkout');
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-60%' : '60%', opacity: 0 }),
  };

  const handleWishToggle = async () => {
    toggleWish(product.id);
    const res = await toggleWishlistAction(product.id);
    if (!res.success) {
      toast.error(res.error || 'Please login to save items to your wishlist');
      toggleWish(product.id);
    }
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  return (
    <div className="pdp-page">
      {/* ════════════════════════════════════════════════════════════════
          HERO  —  Gallery (left)  +  Info panel (right)
      ════════════════════════════════════════════════════════════════ */}
      <div className="pdp-wrap pdp-hero">

        {/* ── Left: Gallery ──────────────────────────────────────────── */}
        <div className="pdp-left">

          {/* Thumbnail rail */}
          <div className="pdp-rail" ref={thumbsRef}>
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i >= activeIdx ? 1 : -1)}
                className="pdp-rail-thumb"
                data-active={i === activeIdx}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img} alt="" />
                {i === allImages.length - 1 && total > 4 && (
                  <span className="pdp-rail-more">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Main image */}
          <div
            className="pdp-main group"
            onTouchStart={e => { tx.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const d = tx.current - e.changedTouches[0].clientX;
              if (Math.abs(d) > 40) d > 0 ? goTo(activeIdx + 1, 1) : goTo(activeIdx - 1, -1);
            }}
          >
            {/* Slide */}
            <AnimatePresence initial={false} custom={slideDir} mode="popLayout">
              <motion.img
                key={activeIdx}
                src={allImages[activeIdx]}
                alt={product.title || product.name}
                custom={slideDir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.25, 1, 0.35, 1] }}
                className="pdp-main-img"
                draggable={false}
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {(product.is_sale || product.sale_badge_text || (original !== null && original > price)) && (
                <span className="px-3.5 py-1 bg-[#FF1E56] text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_14px_rgba(255,30,86,0.5)] border border-white/25 backdrop-blur-xs">
                  {product.sale_badge_text || 'SALE'}
                </span>
              )}
              {product.is_drop && (
                <span className="px-3 py-1 bg-[var(--accent)] text-[var(--bg)] text-[11px] font-mono font-bold uppercase tracking-wider rounded-md shadow-lg backdrop-blur-md">
                  LIMITED DROP
                </span>
              )}
              <span className="px-3 py-1 bg-black/60 text-white text-[11px] font-mono uppercase tracking-wider rounded-md backdrop-blur-md border border-white/10">
                {activeIdx + 1} / {total}
              </span>
            </div>

            {/* Zoom icon */}
            <button
              className="pdp-zoom-btn"
              onClick={() => setZoomed(true)}
              aria-label="Zoom image"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            {/* Mobile Dots */}
            {total > 1 && (
              <div className="pdp-dots-row">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i >= activeIdx ? 1 : -1)}
                    className="pdp-dot-btn"
                    data-active={i === activeIdx}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Info ─────────────────────────────────────────────── */}
        <div className="pdp-right">

          {/* Category crumb */}
          <div className="flex items-center justify-between">
            <p className="pdp-crumb">
              {categoryName || 'STREETWEAR'} · INKWAVE ARCHIVE
            </p>
            <span className="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-full border border-[var(--accent)]/20">
              IN STOCK • READY TO SHIP
            </span>
          </div>

          {/* Title */}
          <h1 className="pdp-h1">{product.title || product.name}</h1>

          {/* Rating & Reviews */}
          <div className="pdp-rating flex items-center gap-3 select-none">
            <div className="pdp-stars">
              {[1, 2, 3, 4, 5].map(s => {
                const isActive = s <= Math.round(parseFloat(String(averageRating || '0')));
                return (
                  <svg key={s} viewBox="0 0 24 24" className="pdp-star"
                    fill={isActive ? "var(--accent)" : "none"} 
                    stroke={isActive ? "var(--accent)" : "var(--line)"} 
                    strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                );
              })}
            </div>
            <span className="pdp-rating-text">
              {reviewCount > 0 ? `${averageRating} ★ (${reviewCount} verified reviews)` : 'No reviews yet'}
            </span>
            <button 
              type="button"
              onClick={() => {
                document.getElementById('product-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-mono text-[var(--accent)] hover:underline ml-2 cursor-pointer uppercase tracking-wider bg-transparent border-0 outline-none p-0"
            >
              Write a Review
            </button>
          </div>

          {/* Price row */}
          <div className="pdp-price-row">
            <span className="pdp-price">{formatPrice(price)}</span>
            {original !== null && <span className="pdp-price-was">{formatPrice(original)}</span>}
            {discount !== null && <span className="pdp-discount-badge">{discount}% OFF</span>}
            <span className="text-xs text-[var(--text-dim)] ml-auto font-mono">Taxes Included</span>
          </div>

          {/* Short description */}
          <p className="pdp-desc">
            {product.description || 'Engineered heavyweight streetwear crafted from premium combed cotton with an architectural oversized drop-shoulder fit.'}
          </p>

          {/* Streetwear Highlight Chips */}
          <div className="flex flex-wrap gap-2 my-4">
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--accent)]" /> {jeansMode ? '14 OZ RIGID DENIM' : '240 GSM FRENCH TERRY'}
            </span>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[var(--accent)]" /> OVERSIZED BOXY FIT
            </span>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> BIO-WASHED PRE-SHRUNK
            </span>
          </div>

          <div className="pdp-divider" />

          {/* Size selector */}
          <div className="pdp-size-block">
            <div className="pdp-size-header">
              <span className="pdp-size-label">
                Select Size: <strong className="text-[var(--accent)] ml-1">{selectedSize || '—'} {oos && '(Not Available)'}</strong>
              </span>
              <button 
                onClick={() => setIsSizeGuideOpen(true)}
                className="pdp-size-guide group"
              >
                <Ruler className="w-3.5 h-3.5 text-[var(--accent)] group-hover:rotate-12 transition-transform" /> 
                <span>Size Guide & Measurements</span>
              </button>
            </div>

            <div className="pdp-size-grid">
              {displaySizes.map(size => {
                const v = activeProductVariants.find(vv => vv.size === size);
                const available = v ? (v.stock_quantity - (v.reserved_stock || 0)) : null;
                const outOfStock = available !== null && available <= 0;
                const sel = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`pdp-size-pill relative overflow-hidden ${outOfStock ? 'opacity-60 text-neutral-400' : ''}`}
                    data-selected={sel}
                    data-oos={outOfStock}
                  >
                    {size}
                    {outOfStock && (
                      <span className="absolute bottom-0 left-0 w-full text-[8px] leading-tight text-center bg-black/80 text-white font-bold py-0.5 pointer-events-none uppercase tracking-widest z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.5)]">
                        N/A
                      </span>
                    )}
                    {available !== null && available > 0 && available <= 3 && !sel && (
                      <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            {lowStock && (
              <div className="mt-3 flex items-center gap-2 text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>Hurry! Only {stockQty} item{stockQty > 1 ? 's' : ''} left in size {selectedSize}</span>
              </div>
            )}
          </div>

          {/* Dual Action Buttons: Add to Bag + 1-Click Buy Now or Notify Me */}
          <div className="flex flex-col gap-3 mb-6">
            {oos ? (
              <div className="flex gap-3">
                {showNotifyForm ? (
                  <form onSubmit={handleNotifyMe} className="flex-1 flex gap-2">
                    <input 
                      type="email" 
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="Enter your email" 
                      className="flex-1 h-[52px] w-full rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] px-4 text-xs font-mono focus:border-[var(--accent)] outline-none transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isNotifying}
                      className="h-[52px] px-6 rounded-xl bg-[var(--text)] text-[var(--bg)] font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      {isNotifying ? '...' : 'Notify'}
                    </button>
                  </form>
                ) : (
                  <button
                    className="flex-1 h-[52px] rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] text-white hover:bg-[var(--line)] hover:text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    onClick={() => setShowNotifyForm(true)}
                  >
                    <Bell className="w-5 h-5 text-[var(--accent)]" />
                    Notify Me When Restocked
                  </button>
                )}
                {/* Wishlist Button */}
                <button
                  className="pdp-wish-btn"
                  onClick={handleWishToggle}
                  aria-label="Wishlist"
                  data-active={isWishlisted}
                >
                  <Heart className="w-5 h-5" fill={isWishlisted ? 'var(--accent)' : 'none'} stroke="currentColor" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  {/* Add to Bag */}
                  <button
                    className="pdp-add-btn flex-1 flex items-center justify-center gap-2.5 font-bold uppercase tracking-wider"
                    onClick={handleAddToCart}
                    data-selected={!!selectedSize}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    {!selectedSize ? 'Select a Size' : 'Add to Bag'}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    className="pdp-wish-btn"
                    onClick={handleWishToggle}
                    aria-label="Wishlist"
                    data-active={isWishlisted}
                  >
                    <Heart className="w-5 h-5" fill={isWishlisted ? 'var(--accent)' : 'none'} stroke="currentColor" />
                  </button>
                </div>

                {/* Instant Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="w-full h-[52px] rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-extrabold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  BUY IT NOW • FAST CHECKOUT
                </button>
              </>
            )}
          </div>

          {/* Real Dynamic Pincode Delivery & Arrival Date Estimator */}
          <PincodeDeliveryChecker />


          {/* Trust Badges */}
          <div className="pdp-badges mt-6">
            <div className="pdp-badge-item">
              <ShieldCheck className="pdp-badge-icon-svg text-[var(--accent)]" />
              <div>
                <p className="pdp-badge-label">100% Authentic</p>
                <p className="pdp-badge-sub">Direct from Inkwave Lab</p>
              </div>
            </div>
            <div className="pdp-badge-item">
              <Truck className="pdp-badge-icon-svg text-[var(--accent)]" />
              <div>
                <p className="pdp-badge-label">Free Delivery</p>
                <p className="pdp-badge-sub">Orders above ₹2000</p>
              </div>
            </div>
            <div className="pdp-badge-item">
              <RotateCcw className="pdp-badge-icon-svg text-[var(--accent)]" />
              <div>
                <p className="pdp-badge-label">7-Day Exchange</p>
                <p className="pdp-badge-sub">Doorstep pickup</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          INTERACTIVE SIZE GUIDE MODAL
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-6 right-6 p-2 bg-[var(--bg-alt)] hover:bg-[var(--line)] text-[var(--text-dim)] hover:text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">
                    {jeansMode ? 'Bottoms & Denim Size Guide' : 'Oversized Streetwear Size Guide'}
                  </h3>
                  <p className="text-xs text-[var(--text-dim)] font-mono">Measurements in Inches (Garment Dimensions)</p>
                </div>
              </div>

              {/* Sizing Table */}
              <div className="border border-[var(--line)] rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[var(--bg-alt)] text-[var(--accent)] uppercase border-b border-[var(--line)] font-bold">
                    {jeansMode ? (
                      <tr>
                        <th className="p-3.5">Size</th>
                        <th className="p-3.5">Waist (in)</th>
                        <th className="p-3.5">Inseam (in)</th>
                        <th className="p-3.5">Rise (in)</th>
                        <th className="p-3.5">Thigh (in)</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-3.5">Size</th>
                        <th className="p-3.5">Chest (in)</th>
                        <th className="p-3.5">Length (in)</th>
                        <th className="p-3.5">Shoulder (in)</th>
                        <th className="p-3.5">Sleeve (in)</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] text-[var(--text)]">
                    {jeansMode ? (
                      <>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">28</td><td className="p-3.5">29-30</td><td className="p-3.5">30</td><td className="p-3.5">11.5</td><td className="p-3.5">23</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">30</td><td className="p-3.5">31-32</td><td className="p-3.5">30.5</td><td className="p-3.5">12</td><td className="p-3.5">24</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">32</td><td className="p-3.5">33-34</td><td className="p-3.5">31</td><td className="p-3.5">12.5</td><td className="p-3.5">25</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">34</td><td className="p-3.5">35-36</td><td className="p-3.5">31.5</td><td className="p-3.5">13</td><td className="p-3.5">26</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">36</td><td className="p-3.5">37-38</td><td className="p-3.5">32</td><td className="p-3.5">13.5</td><td className="p-3.5">27</td></tr>
                      </>
                    ) : (
                      <>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">S</td><td className="p-3.5">42</td><td className="p-3.5">28</td><td className="p-3.5">21.5</td><td className="p-3.5">9.0</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">M</td><td className="p-3.5">44</td><td className="p-3.5">29</td><td className="p-3.5">22.5</td><td className="p-3.5">9.5</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">L</td><td className="p-3.5">46</td><td className="p-3.5">30</td><td className="p-3.5">23.5</td><td className="p-3.5">10.0</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">XL</td><td className="p-3.5">48</td><td className="p-3.5">31</td><td className="p-3.5">24.5</td><td className="p-3.5">10.5</td></tr>
                        <tr className="hover:bg-[var(--bg-alt)]/50"><td className="p-3.5 font-bold">XXL</td><td className="p-3.5">50</td><td className="p-3.5">32</td><td className="p-3.5">25.5</td><td className="p-3.5">11.0</td></tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* How to Measure */}
              <div className="bg-[var(--bg-alt)] p-4 rounded-2xl border border-[var(--line)] text-xs text-[var(--text-dim)] space-y-1.5">
                <p className="font-bold text-[var(--text)] uppercase tracking-wider">How to Measure:</p>
                {jeansMode ? (
                  <>
                    <p>• <strong>Waist:</strong> Lay jeans flat, measure across the waistband, then multiply by 2.</p>
                    <p>• <strong>Inseam:</strong> Measure the inside seam of the leg, starting from the crotch down to the ankle hem.</p>
                    <p>• <strong>Rise:</strong> Measure from the crotch seam up to the top of the front waistband.</p>
                    <p>• <strong>Thigh:</strong> Measure straight across the leg width, 1 inch below the crotch seam.</p>
                  </>
                ) : (
                  <>
                    <p>• <strong>Chest:</strong> Measure across the fullest part of the chest from armpit to armpit.</p>
                    <p>• <strong>Length:</strong> Measure from the highest point of the shoulder seam straight down to the bottom hem.</p>
                    <p>• <strong>Shoulder:</strong> Measure straight across the back from shoulder seam to shoulder seam.</p>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          FULLSCREEN LIGHTBOX ZOOM
      ════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            className="pdp-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
          >
            <button 
              onClick={() => setZoomed(false)} 
              className="absolute top-6 right-6 p-3 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={allImages[activeIdx]} alt="" className="pdp-lightbox-img" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE STICKY BOTTOM ACTION BAR (Smart E-Commerce Conversion)
      ════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[var(--bg)]/95 backdrop-blur-xl border-t border-[var(--line)] p-3 px-4 flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono text-[var(--text-dim)]">
            {selectedSize ? `Size: ${selectedSize}` : 'Select Size'}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-extrabold text-[var(--text)]">
              {formatPrice(price)}
            </span>
            {original && (
              <span className="font-mono text-xs text-[var(--text-dim)] line-through">
                {formatPrice(original)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[220px] justify-end">
          {oos ? (
            showNotifyForm ? (
              <form onSubmit={handleNotifyMe} className="flex-1 flex gap-2">
                <input 
                  type="email" 
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="Email" 
                  className="w-24 flex-shrink-0 h-11 rounded-xl bg-[var(--bg)] border border-[var(--line)] px-3 text-[10px] font-mono focus:border-[var(--accent)] outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isNotifying}
                  className="flex-1 h-11 rounded-xl bg-[var(--text)] text-[var(--bg)] font-bold text-[10px] uppercase tracking-wider disabled:opacity-50 flex items-center justify-center"
                >
                  {isNotifying ? '...' : 'Submit'}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNotifyForm(true)}
                className="flex-1 h-11 rounded-xl bg-[var(--bg-alt)] border border-[var(--line)] text-[var(--text)] font-bold text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Bell className="w-3.5 h-3.5 text-[var(--accent)]" />
                Notify Me
              </button>
            )
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className="flex-1 h-11 rounded-xl bg-[var(--accent)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[var(--accent)]/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
              
              <button
                onClick={handleBuyNow}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md shadow-amber-400/20"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                Buy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

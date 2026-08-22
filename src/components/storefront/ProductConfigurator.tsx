'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/types/database';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Ruler } from 'lucide-react';
import { toast } from 'sonner';

// ─── Size presets ──────────────────────────────────────────────────────────────
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const JEANS_SIZES   = ['26', '28', '30', '32', '34', '36', '38'];

/** Returns true if the category looks like bottoms/jeans/pants */
function isJeansCategory(categoryName: string): boolean {
  const lower = categoryName.toLowerCase();
  return (
    lower.includes('jean') ||
    lower.includes('denim') ||
    lower.includes('pant') ||
    lower.includes('trouser') ||
    lower.includes('bottom')
  );
}

/** Resolve size order for display */
function orderedSizes(sizes: string[], isJeans: boolean): string[] {
  const preset = isJeans ? JEANS_SIZES : APPAREL_SIZES;
  const inPreset = sizes.filter(s => preset.includes(s));
  const extra    = sizes.filter(s => !preset.includes(s));
  // sort preset by its index, extras alphabetically
  return [
    ...inPreset.sort((a, b) => preset.indexOf(a) - preset.indexOf(b)),
    ...extra.sort(),
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductConfigurator({
  product,
  variants,
  categoryName = '',
}: {
  product: Product & { [key: string]: any };
  variants: ProductVariant[];
  categoryName?: string;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const isJeans   = isJeansCategory(categoryName);
  const rawSizes   = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
  const sizeList   = orderedSizes(rawSizes, isJeans);

  // If DB has no variants yet, show a sensible default set
  const fallbackSizes = isJeans ? JEANS_SIZES : ['M', 'L', 'XL', 'XXL'];
  const displaySizes  = sizeList.length > 0 ? sizeList : fallbackSizes;

  const selectedVariant = variants.find(v => v.size === selectedSize);
  const currentPrice    = selectedVariant?.price_override ?? product.base_price ?? product.price ?? 0;
  const rawCompare      = selectedVariant?.compare_at_price ?? product.compare_at_price ?? product.compareAtPrice ?? null;
  const originalPrice   = rawCompare !== null && Number(rawCompare) > Number(currentPrice) ? Number(rawCompare) : null;
  const discountPercent = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;

  const stockQty = selectedVariant?.stock_quantity ?? null;
  const lowStock = stockQty !== null && stockQty > 0 && stockQty < 5;
  const outOfStock = stockQty === 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first');
      return;
    }
    if (outOfStock) {
      toast.error('This size is out of stock');
      return;
    }

    const imageUrl =
      (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : null) ||
      product.overlay_mask_url ||
      product.image_url ||
      '';

    addItem({
      id: `${product.id}-${selectedVariant?.id ?? selectedSize}`,
      product_id: product.id,
      variant_id: selectedVariant?.id ?? '',
      title: product.title ?? product.name,
      sku: selectedVariant?.sku ?? '',
      size: selectedSize,
      color: selectedVariant?.color ?? null,
      price: currentPrice,
      quantity: 1,
      image_url: imageUrl,
    });

    toast.success(`Added ${selectedSize} to cart!`);
  };

  return (
    <div className="space-y-7">
      {/* ── Price ── */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {formatPrice(currentPrice)}
        </span>
        {originalPrice !== null && (
          <span
            className="text-base line-through opacity-40 font-medium"
            style={{ color: 'var(--text-dim)' }}
          >
            {formatPrice(originalPrice)}
          </span>
        )}
        {discountPercent !== null && (
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* ── Size Selector ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-dim)' }}>
            {isJeans ? 'Select Waist (inches)' : 'Select Size'}
          </span>
          <button className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80 transition-opacity">
            <Ruler className="w-3 h-3" />
            Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {displaySizes.map(size => {
            const variantForSize = variants.find(v => v.size === size);
            const oos = variantForSize?.stock_quantity === 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                disabled={oos}
                onClick={() => setSelectedSize(isSelected ? null : size)}
                className="relative transition-all duration-200"
                style={{
                  minWidth: isJeans ? '3.5rem' : '3rem',
                  height: '3rem',
                  padding: '0 0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  letterSpacing: '0.05em',
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : `1.5px solid var(--line)`,
                  background: isSelected
                    ? 'var(--accent)'
                    : oos
                    ? 'transparent'
                    : 'var(--bg-card)',
                  color: isSelected
                    ? 'var(--accent-text)'
                    : oos
                    ? 'var(--text-dim)'
                    : 'var(--text)',
                  cursor: oos ? 'not-allowed' : 'pointer',
                  textDecoration: oos ? 'line-through' : 'none',
                  boxShadow: isSelected ? `0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent)` : 'none',
                }}
              >
                {size}
                {/* Out-of-stock diagonal slash */}
                {oos && (
                  <span
                    className="absolute inset-0 rounded-[9px] overflow-hidden pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% - 0.5px), rgba(255,255,255,0.15) calc(50% + 0.5px), transparent calc(50% + 0.5px))',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Stock warning */}
        {lowStock && (
          <p className="mt-2.5 text-xs font-semibold text-amber-400 animate-pulse">
            ⚠ Only {stockQty} left in size {selectedSize}
          </p>
        )}
        {outOfStock && selectedSize && (
          <p className="mt-2.5 text-xs font-semibold text-red-400">
            Size {selectedSize} is sold out
          </p>
        )}
      </div>

      {/* ── Product Details ── */}
      <div
        className="rounded-xl p-4 space-y-3 text-sm"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p className="font-semibold text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
          Product Details
        </p>

        {product.description && (
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {product.description}
          </p>
        )}

        <ul className="space-y-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {isJeans ? (
            <>
              <li className="flex gap-2"><span>•</span><span>Premium denim fabric with stretch comfort</span></li>
              <li className="flex gap-2"><span>•</span><span>Waist sizes 28–36 inches available</span></li>
              <li className="flex gap-2"><span>•</span><span>Machine wash cold, do not bleach</span></li>
            </>
          ) : (
            <>
              <li className="flex gap-2"><span>•</span><span>High-quality fabric with a structured fit</span></li>
              <li className="flex gap-2"><span>•</span><span>Available in sizes M through XXL</span></li>
              <li className="flex gap-2"><span>•</span><span>Cold wash inside out, air dry</span></li>
            </>
          )}
        </ul>
      </div>

      {/* ── Shipping Badges ── */}
      <div
        className="flex flex-wrap gap-4 py-4 border-y"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <path d="M16 8h4l3 5v4h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
          Fast Shipping
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Authenticity Secured
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Easy Returns
        </div>
      </div>


      {/* ── Add to Cart ── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 md:p-0 md:relative md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t md:border-0 z-40"
        style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
      >
        <button
          onClick={handleAddToCart}
          disabled={outOfStock && !!selectedSize}
          className="w-full font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 text-sm uppercase tracking-widest"
          style={{
            background: selectedSize ? 'var(--accent)' : 'var(--bg-card)',
            color: selectedSize ? 'var(--accent-text)' : 'var(--text)',
            border: selectedSize ? 'none' : '1.5px solid var(--line)',
            opacity: outOfStock && !!selectedSize ? 0.4 : 1,
          }}
        >
          <ShoppingBag className="w-5 h-5" />
          {!selectedSize
            ? 'Select a Size'
            : outOfStock
            ? 'Out of Stock'
            : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

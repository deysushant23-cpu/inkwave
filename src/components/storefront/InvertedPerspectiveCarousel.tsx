'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  slug: string;
  title?: string;
  name?: string;
  images?: string[];
  overlay_mask_url?: string;
  price?: number;
  base_price?: number;
  compare_at_price?: number;
  compareAtPrice?: number;
  product_variants?: any[];
}

export default function InvertedPerspectiveCarousel({ products }: { products: Product[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // The continuous progress value (0 to products.length - 1)
  const progress = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dragStartProgress = useRef(0);

  if (!products || products.length === 0) return null;

  const getImageUrl = (product: Product) => {
    return product.overlay_mask_url || (product.images && product.images[0]) || 'https://via.placeholder.com/800x1200';
  };

  const handleDragStart = () => {
    dragStartProgress.current = progress.get();
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
    const swipePower = (info.offset.x) + (info.velocity.x * 0.2);
    const moveAmount = -swipePower / 300; 
    let nextProgress = dragStartProgress.current + moveAmount;
    
    nextProgress = Math.round(nextProgress);
    
    const N = products.length;
    let normalizedIndex = ((nextProgress % N) + N) % N;
    setActiveIndex(normalizedIndex);
    
    animate(progress, nextProgress, {
      type: 'spring',
      stiffness: 200,
      damping: 25,
      mass: 1
    });
  };

  const handleDrag = (e: any, info: PanInfo) => {
    const currentProgress = dragStartProgress.current - (info.offset.x / 300);
    progress.set(currentProgress);
  };

  return (
    <div 
      className="relative w-full h-[460px] sm:h-[560px] md:h-[700px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing z-10" 
      style={{ 
        perspective: '1200px',
        isolation: 'isolate',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)'
      }}
      ref={containerRef}
    >
      <motion.div 
        className="relative w-full max-w-7xl h-full flex items-center justify-center" 
        style={{ transformStyle: 'preserve-3d' }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={handleDrag}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {products.map((product, index) => {
          // Circular shortest-distance diff
          const diff = useTransform(progress, (p) => {
            const N = products.length;
            let d = (index - p) % N;
            if (d > N / 2) d -= N;
            if (d < -N / 2) d += N;
            return d;
          });
          
          // Absolute diff for symmetric properties like scale and opacity
          const absDiff = useTransform(diff, (d) => Math.abs(d));

          // Hide if too far
          const opacity = useTransform(absDiff, [0, 1, 2, 3], [1, 1, 0.4, 0]);

          // Scale goes down as they move away from center
          const scale = useTransform(absDiff, [0, 1, 2, 3], [1, 0.9, 0.8, 0.7]);
          
          // Z offset pushes them back
          const zOffset = useTransform(absDiff, [0, 1, 2, 3], [0, -150, -300, -450]);

          // X offset moves them left/right. 
          // Center is 0. Left item (diff=-1) goes to -220px. Right item (diff=1) goes to 220px.
          // X offset moves them left/right. 
          // Center is 0. Left item (diff=-1) goes to -220px. Right item (diff=1) goes to 220px.
          const xSpacing = isMobile ? 110 : 260;
          const xOffset = useTransform(diff, (d) => d * xSpacing);

          // Rotate Y creates the inverted perspective "V" shape
          // Center is 0. Left item (diff < 0) rotates right (positive). Right item (diff > 0) rotates left (negative).
          const rotateY = useTransform(diff, [-2, -1, 0, 1, 2], [60, 50, 0, -50, -60]);

          // Dynamic Z-index to ensure center items are always on top
          const zIndex = useTransform(absDiff, (d) => 10 - Math.round(d));
          
          // Inactive overlay darkness
          const overlayOpacity = useTransform(absDiff, [0, 0.5, 1], [0, 0.2, 0.5]);
          
          // Detail overlay opacity (only fully visible when near center)
          const detailOpacity = useTransform(absDiff, [0, 0.2, 0.5], [1, 0, 0]);
          const detailY = useTransform(absDiff, [0, 0.5], [0, 20]);

          // Calculate accurate dynamic price set by admin
          const price = product.base_price ?? product.product_variants?.[0]?.price_override ?? product.price ?? 0;
          const rawCompare = product.compare_at_price ?? product.compareAtPrice ?? product.product_variants?.find((v: any) => v.compare_at_price)?.compare_at_price ?? null;
          const wasPrice = rawCompare && Number(rawCompare) > Number(price) ? Number(rawCompare) : null;
          const discountPercent = wasPrice ? Math.round(((Number(wasPrice) - Number(price)) / Number(wasPrice)) * 100) : null;

          return (
            <motion.div
              key={product.id}
              className="absolute w-[225px] sm:w-[320px] md:w-[420px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl bg-surface-container border border-white/10 pointer-events-none"
              style={{
                x: xOffset,
                z: zOffset,
                rotateY,
                scale,
                opacity,
                zIndex
              }}
            >
              <img
                src={getImageUrl(product)}
                alt={product.title || product.name || 'Product'}
                className="w-full h-full object-cover"
              />
              
              {/* Inactive Dark Overlay */}
              <motion.div 
                className="absolute inset-0 bg-black pointer-events-none"
                style={{ opacity: overlayOpacity }}
              />

              {/* Active Info Reveal */}
              <motion.div 
                className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center text-center pointer-events-none"
                style={{ opacity: detailOpacity, y: detailY }}
              >
                <h3 className="font-headline-sm text-white text-base sm:text-xl md:text-2xl tracking-wide mb-1 sm:mb-2 uppercase line-clamp-2">
                  {product.title || product.name}
                </h3>
                
                {/* Dynamic Price Display */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-5 font-mono">
                  <span className="text-white font-bold text-sm sm:text-lg md:text-xl">
                    {formatPrice(price)}
                  </span>
                  {wasPrice !== null && (
                    <span className="text-white/50 line-through text-xs sm:text-sm md:text-base">
                      {formatPrice(wasPrice)}
                    </span>
                  )}
                  {discountPercent !== null && discountPercent > 0 && (
                    <span className="text-[9px] sm:text-xs font-bold text-amber-400 bg-amber-400/15 px-1.5 sm:px-2 py-0.5 rounded border border-amber-400/30">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                
                <Link href={`/product/${product.slug}`} className="pointer-events-auto">
                  <Button variant="outline" className="rounded-none bg-white/10 hover:bg-white text-white hover:text-black border-white/20 backdrop-blur-md px-5 py-2.5 sm:px-8 sm:py-5 font-label-caps tracking-widest transition-all text-[10px] sm:text-xs">
                    VIEW DETAILS
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Carousel Dots */}
      <div className="absolute bottom-6 flex gap-3 z-50">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              const current = progress.get();
              const N = products.length;
              let d = (idx - current) % N;
              if (d > N / 2) d -= N;
              if (d < -N / 2) d += N;
              const nextProgress = current + d;
              
              setActiveIndex(idx);
              animate(progress, nextProgress, { type: 'spring', stiffness: 200, damping: 25, mass: 1 });
            }}
            className={`h-1.5 transition-all duration-500 rounded-full ${idx === activeIndex ? 'w-10 bg-primary' : 'w-3 bg-white/30 hover:bg-white/60'}`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

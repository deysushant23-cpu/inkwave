'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const FITS_DATA = [
  {
    id: 'fit-01',
    title: 'NIGHT CRAWLER',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop'
    ],
    items: [
      { name: 'Fathom Overshirt', price: 8900, slug: 'fathom-overshirt', type: 'SHIRT' },
      { name: 'Riptide Tee', price: 2400, slug: 'riptide-tee', type: 'T-SHIRT' },
      { name: 'Slate Selvedge Denim', price: 6500, slug: 'slate-selvedge-denim', type: 'JEANS' }
    ]
  },
  {
    id: 'fit-02',
    title: 'URBAN NOMAD',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'
    ],
    items: [
      { name: 'Monsoon Cargo Jeans', price: 7200, slug: 'monsoon-cargo-jeans', type: 'JEANS' },
      { name: 'Static Crew Tee', price: 5400, slug: 'static-crew-tee', type: 'T-SHIRT' }
    ]
  }
];


/* ── Sliding Image Component ────────────────────────────────────────────── */
function SlidingImagePanel({ images, parallaxY }: { images: string[]; parallaxY: any }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 4500); // auto-slide every 4.5s
    return () => clearInterval(interval);
  }, [images]);

  const activeImg = images[idx] || images[0];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.85, ease: [0.25, 1, 0.35, 1] }}
          className="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center"
          style={{ backgroundImage: `url(${activeImg})`, y: parallaxY }}
        />
      </AnimatePresence>
      
      {/* Indicator dots for multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-2 h-2 transition-all duration-300"
              style={{
                background: i === idx ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transform: i === idx ? 'scale(1.2)' : 'scale(1)',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Section Component ─────────────────────────────────────────────── */
export default function CuratedFits({ fits }: { fits?: any }) {
  const displayFits = fits || FITS_DATA;
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { addItem, setCartDrawerOpen } = useCartStore();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  const handleAddAllToCart = (fit: any) => {
    if (!fit.items || fit.items.length === 0) return;
    
    fit.items.forEach((item: any) => {
      addItem({
        id: `${item.slug}-assigned`,
        product_id: item.slug,
        variant_id: '',
        title: item.name,
        sku: '',
        size: 'M', // default size
        color: null,
        price: item.price,
        quantity: 1,
        image_url: fit.images?.[0] || fit.image // fallback
      });
    });

    toast.success(`Added all items from "${fit.title}" to bag!`);
    setCartDrawerOpen(true);
  };

  return (
    <section className="py-12 md:py-24 bg-[var(--bg)] relative overflow-hidden" ref={containerRef}>
      <div className="max-w-container-max mx-auto px-4 sm:px-8 md:px-12">
        
        {/* Header */}
        <div className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 border-b border-[var(--line)] pb-6 md:pb-8">
          <div>
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-2 sm:mb-4 block">
              Curated Selections
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-6xl uppercase font-bold text-[var(--text)] tracking-tighter">
              Shop The Look
            </h2>
          </div>
          <Link href="/showcase" className="group flex items-center gap-2 font-bold text-xs sm:text-sm tracking-widest uppercase text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
            View All Pieces <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-col gap-12 md:gap-24">
          {displayFits.map((fit: any, idx: number) => {
            const lookImages = fit.images || (fit.image ? [fit.image] : []);
            return (
              <div key={fit.id} className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-6 sm:gap-12 lg:gap-24 items-stretch`}>
                
                {/* Image Side - Sharp Edges & Slideshow */}
                <div className="w-full lg:w-1/2 relative h-[320px] sm:h-[460px] md:h-[650px] overflow-hidden group border border-[var(--line)] rounded-xl lg:rounded-none">
                  <SlidingImagePanel images={lookImages} parallaxY={parallaxY} />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  
                  {/* Coordinates / Meta */}
                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] text-white/80 tracking-widest bg-black/40 px-2.5 py-1 sm:px-3 sm:py-1.5 border border-white/10 z-10 rounded">
                    DROP 04 // FIT-{String(idx + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* Products Side */}
                <div className="w-full lg:w-1/2 flex flex-col justify-between py-1 sm:py-2">
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl md:text-5xl uppercase font-bold text-[var(--text)] mb-4 sm:mb-8 tracking-tighter">
                      {fit.title}
                    </h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {fit.items.map((item: any, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.4 }}
                          viewport={{ once: true, margin: "-100px" }}
                          key={item.slug}
                        >
                          <Link 
                            href={`/product/${item.slug}`}
                            className="flex items-center justify-between p-3.5 sm:p-5 bg-[var(--bg-card)] border border-[var(--line)] hover:border-[var(--accent)] transition-all group rounded-xl lg:rounded-none"
                          >
                            <div>
                              <div className="font-mono text-[9px] text-[var(--text-dim)] tracking-[0.15em] mb-1 uppercase">{item.type}</div>
                              <div className="font-bold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{item.name}</div>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-6">
                              <div className="font-mono font-bold text-[var(--text)] text-xs sm:text-sm">{formatPrice(item.price)}</div>
                              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[var(--bg-alt)] flex items-center justify-center border border-[var(--line)] group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-transparent transition-colors rounded-lg lg:rounded-none">
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 sm:mt-8 lg:mt-0">
                    <button 
                      onClick={() => handleAddAllToCart(fit)}
                      className="w-full bg-[var(--text)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--bg)] py-4 sm:py-5 font-bold tracking-widest uppercase text-xs transition-colors duration-300 rounded-xl lg:rounded-none"
                    >
                      Add All To Cart
                    </button>
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

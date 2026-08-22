'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Product {
  id: string;
  slug: string;
  title?: string;
  name?: string;
  images?: string[];
  overlay_mask_url?: string;
}

export default function ScrollRevealGallery({ 
  products,
  customImages
}: { 
  products: Product[];
  customImages?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Pick top 4 products or custom images
  const displayProducts = products.slice(0, 4);
  const getImageUrl = (index: number) => {
    if (customImages && customImages[index] && customImages[index].trim().length > 0) {
      return customImages[index];
    }
    const product = displayProducts[index];
    if (!product) return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop';
    return (product.images && product.images[0]) || product.overlay_mask_url || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop';
  };

  // Scale and translate transforms
  const scaleImage = useTransform(scrollYProgress, [0, 0.8], [1, 4]); 

  // Diagonal translations to spread images to the corners of the viewport
  const x1 = useTransform(scrollYProgress, [0, 0.8], ['0vw', '-40vw']);
  const y1 = useTransform(scrollYProgress, [0, 0.8], ['0vh', '-40vh']);
  
  const x2 = useTransform(scrollYProgress, [0, 0.8], ['0vw', '40vw']);
  const y2 = useTransform(scrollYProgress, [0, 0.8], ['0vh', '-40vh']);

  const x3 = useTransform(scrollYProgress, [0, 0.8], ['0vw', '-40vw']);
  const y3 = useTransform(scrollYProgress, [0, 0.8], ['0vh', '40vh']);

  const x4 = useTransform(scrollYProgress, [0, 0.8], ['0vw', '40vw']);
  const y4 = useTransform(scrollYProgress, [0, 0.8], ['0vh', '40vh']);

  // Rotate for extra dynamism
  const rotate1 = useTransform(scrollYProgress, [0, 0.8], [0, -10]);
  const rotate2 = useTransform(scrollYProgress, [0, 0.8], [0, 10]);
  const rotate3 = useTransform(scrollYProgress, [0, 0.8], [0, -5]);
  const rotate4 = useTransform(scrollYProgress, [0, 0.8], [0, 5]);

  const transforms = [
    { x: x1, y: y1, rotate: rotate1 },
    { x: x2, y: y2, rotate: rotate2 },
    { x: x3, y: y3, rotate: rotate3 },
    { x: x4, y: y4, rotate: rotate4 }
  ];

  // The central title fades in as the images spread apart
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const titleScale = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1]);

  return (
    <div ref={containerRef} className="h-[250vh] w-full relative bg-surface">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        
        {/* Background Reveal Text */}
        <motion.div 
          style={{ opacity: titleOpacity, scale: titleScale }}
          className="absolute inset-0 flex flex-col items-center justify-center z-0 px-4 text-center"
        >
          <h1 className="font-headline-lg text-4xl sm:text-7xl md:text-[140px] text-on-surface uppercase leading-none tracking-tighter">
            DISCOVER
          </h1>
          <h2 className="font-headline-lg text-2xl sm:text-5xl md:text-[90px] text-on-surface-variant uppercase leading-none tracking-tighter">
            THE NEW ERA
          </h2>
        </motion.div>

        {/* The 4 expanding images */}
        <div className="relative w-[220px] h-[280px] sm:w-[320px] sm:h-[400px] md:w-[400px] md:h-[500px] z-10 pointer-events-none">
          {[0, 1, 2, 3].map((index) => {
            const product = displayProducts[index];
            const isLeft = index === 0 || index === 2;
            const isTop = index === 0 || index === 1;
            
            return (
              <motion.div
                key={product?.id || index}
                style={{
                  x: transforms[index].x,
                  y: transforms[index].y,
                  rotate: transforms[index].rotate,
                  scale: scaleImage,
                  transformOrigin: 'center center'
                }}
                className={`absolute w-1/2 h-1/2 p-2 ${isLeft ? 'left-0' : 'right-0'} ${isTop ? 'top-0' : 'bottom-0'}`}
              >
                <div className="w-full h-full relative rounded-lg overflow-hidden shadow-2xl bg-surface-container border border-white/5">
                  {(() => {
                    const mediaUrl = getImageUrl(index);
                    const isVideo = mediaUrl.split('?')[0].split('#')[0].toLowerCase().endsWith('.mp4') ||
                                    mediaUrl.split('?')[0].split('#')[0].toLowerCase().endsWith('.webm') ||
                                    mediaUrl.split('?')[0].split('#')[0].toLowerCase().endsWith('.mov') ||
                                    mediaUrl.includes('/video/upload/');
                    if (isVideo) {
                      return (
                        <video
                          src={mediaUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                        />
                      );
                    }
                    return (
                      <img
                        src={mediaUrl}
                        alt={product?.title || product?.name || 'Showcase'}
                        className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                      />
                    );
                  })()}
                  <div className="absolute inset-0 bg-black/10" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Start Overlay (Fades out when scrolled) */}
        <motion.div 
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          className="absolute bottom-12 flex flex-col items-center z-20 pointer-events-none"
        >
          <span className="font-label-caps text-on-surface-variant text-[12px] tracking-widest mb-4">SCROLL TO REVEAL</span>
          <svg className="w-6 h-6 animate-bounce" style={{ color: 'var(--text)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

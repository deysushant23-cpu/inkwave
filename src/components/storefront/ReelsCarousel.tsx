'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Reel {
  id: string;
  videoUrl: string;
  productSlug: string;
  title: string;
}

export default function ReelsCarousel({ reels }: { reels: Reel[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (!reels || reels.length === 0) return null;

  return (
    <div className="w-full py-8 md:py-16 overflow-hidden">
      <div className="flex items-center gap-6 px-4 md:px-12 pb-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar" ref={containerRef}>
        {reels.map((reel) => (
          <Link 
            key={reel.id}
            href={`/product/${reel.productSlug}`}
            className="flex-shrink-0 w-[80vw] sm:w-[280px] md:w-[320px] aspect-[9/16] relative rounded-2xl overflow-hidden snap-center group cursor-pointer block hover:scale-[1.01] transition-transform duration-300"
            style={{ border: '1px solid var(--line)' }}
          >
            {/* Video */}
            <video
              src={reel.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-white font-display text-2xl font-bold uppercase tracking-tighter mb-4 leading-none">
                {reel.title}
              </h3>
              
              <Button variant="outline" className="w-full rounded-full border-white/30 text-white group-hover:bg-white group-hover:text-black font-label-caps tracking-widest text-xs transition-colors py-6">
                SHOP THIS DROP
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

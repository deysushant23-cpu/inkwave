'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import ProductCard from './ProductCard';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedProductGridProps {
  products: any[];
}

export default function AnimatedProductGrid({ products }: AnimatedProductGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('.product-card-wrap');
    
    if (cards.length > 0) {
      gsap.fromTo(cards, 
        { opacity: 0, y: 40 },
        {
          opacity: 1, 
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          }
        }
      );
    }
  }, { scope: containerRef, dependencies: [products] });

  if (products.length === 0) {
    return (
      <div className="text-center py-16 sm:py-24 cat-hero-animate px-4">
        <div className="text-5xl sm:text-6xl mb-4">🏷️</div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-white">
          No drops yet
        </h2>
        <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto">
          Check back soon — fresh drops are on the way.
        </p>
        <Link 
          href="/" 
          className="inline-block mt-6 px-6 py-3 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider transition-all hover:scale-105 bg-white text-black"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 items-start w-full"
    >
      {products.map((product, i) => (
        <div
          key={product.id}
          className="product-card-wrap w-full min-w-0 flex flex-col"
        >
          <ProductCard product={product} index={i} />
        </div>
      ))}
    </div>
  );
}

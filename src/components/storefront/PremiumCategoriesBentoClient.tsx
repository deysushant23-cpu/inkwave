'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface CategoryCardProps {
  id?: string;
  title: string;
  tag: string;
  bgImage: string;
  link: string;
  is_active?: boolean;
  className?: string;
  large?: boolean;
}

export default function PremiumCategoriesBentoClient({ categories }: { categories: CategoryCardProps[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="cat-strip">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.id || i}
          className="cat-panel"
          animate={{
            flex: hovered === i ? 2.6 : hovered !== null ? 0.65 : 1,
          }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.35, 1] }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <Link href={cat.link || '#'} className="cat-panel-inner group">
            {/* Background image or Fallback Graphic */}
            <motion.div
              className="cat-panel-bg bg-zinc-900"
              style={{ 
                backgroundImage: cat.bgImage ? `url(${cat.bgImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              animate={{ scale: hovered === i ? 1.07 : 1 }}
              transition={{ duration: 0.65, ease: [0.25, 1, 0.35, 1] }}
            />

            {/* Gradient overlay — darkens bottom always */}
            <div className="cat-panel-gradient" />

            {/* Index */}
            <span className="cat-panel-index">{String(i + 1).padStart(2, '0')}</span>

            {/* Content block — always at bottom */}
            <div className="cat-panel-content">
              {/* Category title — always visible */}
              <h3 className="cat-panel-title">{cat.title}</h3>

              {/* CTA — slides in on hover, always visible on mobile */}
              <AnimatePresence>
                {(hovered === i || isMobile) && (
                  <motion.span
                    className="cat-panel-cta"
                    initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {cat.tag || 'Explore'}
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

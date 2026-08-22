'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Scroll3DEffect({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // When entering the viewport from the bottom, it's tilted backwards (rotateX: 15deg), and slightly scaled down.
  // When leaving from the top, it tilts forward (rotateX: -15deg) and scales down.
  // In the center (0.5), it is completely flat and normal scale.
  
  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], ['25deg', '0deg', '0deg', '-25deg']);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.85, 1, 1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], ['100px', '0px', '0px', '-100px']);

  if (isMobile) {
    return (
      <div ref={ref} className={`relative w-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative w-full ${className}`} style={{ perspective: '1500px' }}>
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y,
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
        className="w-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

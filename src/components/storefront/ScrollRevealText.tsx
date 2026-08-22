'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export default function ScrollRevealText({ text, className = '' }: ScrollRevealTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealPerc, setRevealPerc] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const { top, height } = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is vertically in the viewport
      // Start revealing when the top of the element hits 80% of the viewport height
      // Fully revealed when the top of the element hits 40% of the viewport height
      const start = windowHeight * 0.8;
      const end = windowHeight * 0.4;
      
      if (top > start) {
        setRevealPerc(0);
      } else if (top < end) {
        setRevealPerc(100);
      } else {
        const percentage = ((start - top) / (start - end)) * 100;
        setRevealPerc(percentage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal-text ${className}`}
      style={{ '--reveal-perc': `${revealPerc}%` } as React.CSSProperties}
    >
      {text}
    </div>
  );
}

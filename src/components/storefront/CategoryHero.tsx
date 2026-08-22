'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface CategoryHeroProps {
  title: string;
  description?: string;
  bannerConfig?: { url?: string; type?: 'image' | 'video' };
}

// Scrambled Matrix Text Component
const MatrixText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => 'X'));
  
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    const iterations = 15;
    let currentIteration = 0;
    
    const interval = setInterval(() => {
      setDisplayText(prev => 
        prev.map((_, i) => {
          // If we've passed the reveal point for this character, show the real one
          if (currentIteration > i * 2) {
            return text[i];
          }
          // Otherwise show a random character
          return chars[Math.floor(Math.random() * chars.length)];
        })
      );
      
      currentIteration++;
      
      // Stop when all characters are revealed
      if (currentIteration > (text.length * 2) + iterations) {
        clearInterval(interval);
        setDisplayText(text.split(''));
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="flex flex-wrap justify-center overflow-visible px-4 relative z-10">
      {displayText.map((char, index) => (
        <span
          key={index}
          className={`font-display font-extrabold uppercase tracking-tighter mix-blend-difference inline-block transition-colors duration-300 ${
            char === text[index] ? 'text-white' : 'text-[var(--accent)]'
          }`}
          style={{
            fontSize: 'clamp(2.2rem, 8.5vw, 9rem)',
            lineHeight: '0.9',
            marginRight: char === ' ' ? 'clamp(0.6rem, 2vw, 2rem)' : '0'
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default function CategoryHero({ title, description, bannerConfig }: CategoryHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  // Parallax effects
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '150%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0, 0]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden flex flex-col items-center justify-center w-full min-h-[35vh] sm:min-h-[50vh] pt-24 pb-10 sm:pt-32 sm:pb-20"
      style={{ background: 'var(--bg)', perspective: '1000px' }}
    >
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 w-full h-full"
        style={{ y: bgY }}
      >
        {bannerConfig?.url ? (
          <>
            {bannerConfig.type === 'video' ? (
              <video
                src={bannerConfig.url}
                autoPlay loop muted playsInline
                className="w-full h-full object-cover opacity-60"
              />
            ) : (
              <img
                src={bannerConfig.url}
                alt={`${title} hero`}
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to top, var(--bg) 0%, transparent 50%, var(--bg)/0.5 100%)',
              }}
            />
          </>
        ) : (
          <div
            className="absolute rounded-full blur-3xl opacity-30"
            style={{
              width: '600px', height: '600px',
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              animation: 'heroBlobPulse 6s ease-in-out infinite',
            }}
          />
        )}
      </motion.div>

      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 mb-6"
      >
        <span
          className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Collection
        </span>
      </motion.div>

      {/* Matrix Decode Title */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
          zIndex: 10
        }}
      >
        <MatrixText text={title} />
      </motion.div>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ y: textY, opacity: textOpacity, zIndex: 10 }}
          className="relative mt-6 max-w-xl mx-auto text-base md:text-lg text-center px-4 mix-blend-difference text-gray-300 font-mono tracking-wide"
        >
          {description}
        </motion.p>
      )}
    </section>
  );
}

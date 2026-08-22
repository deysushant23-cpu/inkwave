'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface Slide {
  id: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  title: string;
  subtitle: string;
  btnText: string;
  btnLink: string;
}

interface HeroCarouselProps {
  slides: Slide[];
  hideText?: boolean;
  autoplaySpeed?: number;
}

export default function HeroCarousel({ slides = [], hideText = false, autoplaySpeed = 6000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoplaySpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPlaying, autoplaySpeed, current]);

  if (!slides || slides.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[current];

  // Wrap the slide in a link if text is hidden, making the entire media responsive area clickable
  const SlideContent = (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Media */}
      {currentSlide.mediaType === 'video' ? (
        <video
          key={currentSlide.mediaUrl}
          src={currentSlide.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        />
      ) : (
        <img
          src={currentSlide.mediaUrl}
          alt={currentSlide.title || 'Streetwear banner'}
          className="absolute inset-0 w-full h-full object-cover animate-hero-ken-burns scale-[1.02]"
        />
      )}

      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-black/35 z-[1]" />

      {/* Slide Text Content overlay (rendered if hideText is false) */}
      {!hideText && (currentSlide.title || currentSlide.subtitle || currentSlide.btnText) && (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col items-start text-left mt-16 sm:mt-24">
          {currentSlide.subtitle && currentSlide.subtitle.trim() && (
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-bold mb-3 bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-[var(--accent)]/20">
              {currentSlide.subtitle}
            </span>
          )}
          {currentSlide.title && currentSlide.title.trim() && (
            <h1 className="font-display text-4xl sm:text-6xl md:text-8xl font-black uppercase text-white tracking-tight leading-none max-w-4xl select-none mb-6">
              {currentSlide.title}
            </h1>
          )}
          {currentSlide.btnText && currentSlide.btnText.trim() && (
            <Link
              href={currentSlide.btnLink || '/catalog'}
              className="btn-immersive text-xs sm:text-sm px-8 py-3.5 bg-white text-black font-bold uppercase tracking-widest rounded-none transition-all hover:bg-black hover:text-white border border-white"
            >
              {currentSlide.btnText}
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-[60vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] bg-black border-b border-[var(--line)] overflow-hidden group">
      {/* Clickable Area Wrapper */}
      {hideText ? (
        <Link href={currentSlide.btnLink || '/catalog'} className="block w-full h-full">
          {SlideContent}
        </Link>
      ) : (
        SlideContent
      )}

      {/* Navigation Arrow Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-white hover:text-black hover:border-white cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:bg-white hover:text-black hover:border-white cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel Footer Panel (Indicators & Controls) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">


        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                className={`w-8 h-1 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === current ? 'bg-[var(--accent)]' : 'bg-white/30'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ambient CSS animations for image zooming */}
      <style jsx global>{`
        @keyframes heroKenBurns {
          0% {
            transform: scale(1.02) translate(0, 0);
          }
          50% {
            transform: scale(1.10) translate(1%, -0.5%);
          }
          100% {
            transform: scale(1.02) translate(0, 0);
          }
        }
        .animate-hero-ken-burns {
          animation: heroKenBurns 36s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PremiumButton from './PremiumButton';
import Magnetic from './Magnetic';
import { Film, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  config?: {
    heroEyebrow?: string;
    heroTitle1?: string;
    heroTitle2?: string;
    heroLede?: string;
    heroMediaType?: 'none' | 'image' | 'video';
    heroMediaUrl?: string;
    heroMediaPoster?: string;
    heroMediaDarkness?: number; // 0 to 100
    heroMediaVignette?: boolean;
    heroMediaBlur?: number; // 0 to 12
    heroMediaKenBurns?: boolean;
    heroCtaPrimaryText?: string;
    heroCtaPrimaryLink?: string;
    heroCtaSecondaryText?: string;
    heroCtaSecondaryLink?: string;
    [key: string]: any;
  };
}

export default function HeroSection({ config }: HeroSectionProps) {
  const [videoError, setVideoError] = useState(false);

  const eyebrow = config?.heroEyebrow || 'SS26 — Vol. 01 — New Arrivals';
  const title1 = config?.heroTitle1 || 'Wear the';
  const title2 = config?.heroTitle2 || 'Current.';
  const lede = config?.heroLede || 'Premium readymade apparel. Designed for everyday comfort and effortless style.';

  const mediaType = config?.heroMediaType || 'none';
  const mediaUrl = config?.heroMediaUrl?.trim() || '';
  const mediaPoster = config?.heroMediaPoster?.trim() || '';
  const darkness = typeof config?.heroMediaDarkness === 'number' ? config.heroMediaDarkness : 45;
  const hasVignette = config?.heroMediaVignette !== false;
  const blurAmount = config?.heroMediaBlur || 0;
  const kenBurns = config?.heroMediaKenBurns !== false;

  const ctaPrimaryText = config?.heroCtaPrimaryText || 'Shop New Drops';
  const ctaPrimaryLink = config?.heroCtaPrimaryLink || '#new';
  const rawSecondaryText = config?.heroCtaSecondaryText || '';
  const rawSecondaryLink = config?.heroCtaSecondaryLink || '';
  const ctaSecondaryText = (rawSecondaryText && rawSecondaryText !== 'View Lookbook') ? rawSecondaryText : 'Browse Catalog';
  const ctaSecondaryLink = (rawSecondaryLink && rawSecondaryLink !== '#lookbook') ? rawSecondaryLink : '/';

  const hasActiveMedia = (mediaType === 'image' || mediaType === 'video') && mediaUrl.length > 0 && !videoError;

  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (ctaPrimaryLink.startsWith('#')) {
      e.preventDefault();
      const targetId = ctaPrimaryLink.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" 
              result="goo" 
            />
          </filter>
        </defs>
      </svg>

      <header className="hero relative min-h-[90svh] md:min-h-[100svh] flex items-center overflow-hidden pt-[70px] md:pt-[80px]">
        
        {/* ── Background Layer 1: Cinematic Video / Image OR Signature Goo Blobs ── */}
        {hasActiveMedia ? (
          <div className="hero-media-layer">
            {mediaType === 'video' ? (
              <video
                src={mediaUrl}
                poster={mediaPoster || undefined}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onError={() => setVideoError(true)}
                className="w-full h-full object-cover object-center scale-[1.03]"
                style={{
                  filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'
                }}
              />
            ) : (
              <div className="w-full h-full relative">
                <Image
                  src={mediaUrl}
                  alt="Inkwave Cinematic Hero Banner"
                  fill
                  priority
                  className={`object-cover object-center ${kenBurns ? 'animate-hero-ken-burns' : ''}`}
                  style={{
                    filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'
                  }}
                  sizes="100vw"
                />
              </div>
            )}

            {/* ── Layer 2: Text Contrast Mesh Gradient (Heavy on left, breathing room on right) ── */}
            <div 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background: 'linear-gradient(90deg, rgba(8,8,10,0.92) 0%, rgba(8,8,10,0.72) 48%, rgba(8,8,10,0.35) 100%)'
              }}
            />

            {/* ── Layer 3: Top Navigation Protection Gradient ── */}
            <div 
              className="absolute top-0 inset-x-0 h-36 pointer-events-none z-[1]"
              style={{
                background: 'linear-gradient(180deg, rgba(8,8,10,0.85) 0%, transparent 100%)'
              }}
            />

            {/* ── Layer 4: Bottom Seamless Marquee Transition ── */}
            <div 
              className="absolute bottom-0 inset-x-0 h-44 pointer-events-none z-[1]"
              style={{
                background: 'linear-gradient(0deg, var(--bg) 0%, rgba(8,8,10,0.7) 45%, transparent 100%)'
              }}
            />

            {/* ── Layer 5: Dynamic Darkness Veil (Configurable in Admin) ── */}
            <div 
              className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${darkness / 100})`
              }}
            />

            {/* ── Layer 6: Cinematic Vignette (Theatrical Framing) ── */}
            {hasVignette && (
              <div 
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.75) 100%)'
                }}
              />
            )}
          </div>
        ) : (
          <div className="blob-field">
            <div className="blob blob1"></div>
            <div className="blob blob2"></div>
            <div className="blob blob3"></div>
          </div>
        )}

        {/* ── Foreground Hero Content ── */}
        <div className="wrap hero-content relative z-10 w-full pb-8">
          
          {/* Eyebrow & Optional Cinematic Badge */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="eyebrow !mb-0">{eyebrow}</span>
            {hasActiveMedia && mediaType === 'video' && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase bg-white/10 text-white/80 border border-white/15 backdrop-blur-md">
                <Film className="w-2.5 h-2.5 text-[var(--accent)] animate-pulse" /> Cinematic Cut
              </span>
            )}
          </div>

          <h1>
            {title1}
            <br />
            <span className="stroke">{title2}</span>
          </h1>

          <p className="lede">
            {lede}
          </p>

          <div className="hero-ctas">
            {ctaPrimaryLink.startsWith('#') ? (
              <PremiumButton onClick={handlePrimaryClick}>
                {ctaPrimaryText}
              </PremiumButton>
            ) : (
              <Link href={ctaPrimaryLink} className="btn btn-primary" style={{ display: 'inline-flex' }}>
                {ctaPrimaryText}
              </Link>
            )}

            {ctaSecondaryText && ctaSecondaryLink && (
              ctaSecondaryLink.startsWith('#') ? (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = ctaSecondaryLink.replace('#', '');
                    const el = document.getElementById(targetId);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn btn-ghost border border-white/20 text-white hover:border-white transition-all hover:scale-105 duration-300"
                >
                  {ctaSecondaryText}
                </button>
              ) : (
                <Link 
                  href={ctaSecondaryLink} 
                  className="btn btn-ghost border border-white/20 text-white hover:border-white transition-all hover:scale-105 duration-300" 
                  style={{ display: 'inline-flex' }}
                >
                  {ctaSecondaryText}
                </Link>
              )
            )}


          </div>
        </div>

        {/* ── Scroll Cue ── */}
        <div className="scroll-cue">
          <span>Scroll</span>
          <div className="line"></div>
        </div>
      </header>
    </>
  );
}

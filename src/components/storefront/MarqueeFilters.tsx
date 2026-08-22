'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface MarqueeCarouselConfig {
  enabled?: boolean;
  tags?: string[];
  theme?: 'midnight' | 'crimson' | 'cyberpunk' | 'mono' | 'gold' | 'custom';
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  badgeStyle?: 'brackets' | 'minimal' | 'pills' | 'outline';
  categoryOverrides?: Record<string, {
    enabled?: boolean;
    tags?: string[];
  }>;
}

const DEFAULT_TAGS = [
  "OVERSIZED", "BAGGY", "SLIM", "DISTRESSED", "WASHED", "RAW",
  "HEAVYWEIGHT", "BOXY", "CROPPED", "VINTAGE FIT"
];

const THEME_PRESETS: Record<string, { bg: string; text: string; accent: string; border: string }> = {
  midnight: {
    bg: '#08080a',
    text: '#8f9099',
    accent: '#00f2fe',
    border: 'rgba(255, 255, 255, 0.08)'
  },
  crimson: {
    bg: '#0e0406',
    text: '#ff4d6d',
    accent: '#ff0055',
    border: 'rgba(255, 77, 109, 0.25)'
  },
  cyberpunk: {
    bg: '#090514',
    text: '#c084fc',
    accent: '#38bdf8',
    border: 'rgba(192, 132, 252, 0.2)'
  },
  gold: {
    bg: '#0d0b06',
    text: '#f59e0b',
    accent: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.25)'
  },
  mono: {
    bg: '#000000',
    text: '#ffffff',
    accent: '#aaaaaa',
    border: 'rgba(255, 255, 255, 0.2)'
  }
};

const SPEED_DURATIONS: Record<string, string> = {
  slow: '45s',
  normal: '28s',
  fast: '14s'
};

interface Props {
  config?: MarqueeCarouselConfig;
  categorySlug?: string;
}

export default function MarqueeFilters({ config: initialConfig, categorySlug }: Props) {
  const [config, setConfig] = useState<MarqueeCarouselConfig | undefined>(initialConfig);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
      return;
    }

    // Client-side fallback fetch if not provided via SSR
    const fetchConfig = async () => {
      try {
        const supabase = createClient();
        const { data } = await (supabase.from('cms_sections') as any)
          .select('json_content')
          .eq('section_key', 'category_marquee_config')
          .single();

        if (data?.json_content) {
          setConfig(data.json_content);
        }
      } catch (e) {
        // Fallback to default
      }
    };

    fetchConfig();
  }, [initialConfig]);

  // Check Category Specific Override if any
  const categoryOverride = categorySlug && config?.categoryOverrides ? config.categoryOverrides[categorySlug] : undefined;
  const isEnabled = (categoryOverride && typeof categoryOverride === 'object' && categoryOverride.enabled !== undefined)
    ? categoryOverride.enabled 
    : (config?.enabled !== false);

  if (!isEnabled) {
    return null; // Admin toggled OFF
  }

  const tags = (categoryOverride && typeof categoryOverride === 'object' && categoryOverride.tags && categoryOverride.tags.length > 0)
    ? categoryOverride.tags
    : (config?.tags && config.tags.length > 0 ? config.tags : DEFAULT_TAGS);

  const themeKey = config?.theme || 'midnight';
  const selectedTheme = THEME_PRESETS[themeKey] || THEME_PRESETS.midnight;

  const bgColor = config?.bgColor || selectedTheme.bg;
  const textColor = config?.textColor || selectedTheme.text;
  const accentColor = config?.accentColor || selectedTheme.accent;
  const borderColor = config?.borderColor || selectedTheme.border;

  const speedDuration = SPEED_DURATIONS[config?.speed || 'normal'] || '28s';
  const isReverse = config?.direction === 'right';
  const badgeStyle = config?.badgeStyle || 'brackets';

  // Duplicate tags sufficiently for smooth infinite CSS translation loop
  const duplicatedTags = [...tags, ...tags, ...tags, ...tags];

  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!wrapRef.current) return;
    const track = wrapRef.current.querySelector('.filter-marquee-track');
    
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        if (Math.abs(velocity) > 10) {
          gsap.to(track, {
            skewX: velocity * -0.005,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        } else {
          gsap.to(track, {
            skewX: 0,
            duration: 0.5,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      }
    });
  }, { scope: wrapRef });

  return (
    <div 
      ref={wrapRef}
      className="filter-marquee-wrap select-none transition-colors duration-300 overflow-hidden"
      style={{
        backgroundColor: bgColor,
        borderTopColor: borderColor,
        borderBottomColor: borderColor
      }}
    >
      <div 
        className="filter-marquee-track flex items-center"
        style={{
          animationName: isReverse ? 'filter-marquee-reverse' : 'filter-marquee',
          animationDuration: speedDuration
        }}
      >
        {duplicatedTags.map((tag, i) => {
          let renderedContent;
          if (badgeStyle === 'minimal') {
            renderedContent = (
              <span className="flex items-center gap-3">
                <span style={{ color: accentColor }}>•</span>
                <span>{tag}</span>
              </span>
            );
          } else if (badgeStyle === 'pills') {
            renderedContent = (
              <span 
                className="px-4 py-1 rounded-full text-xs md:text-sm tracking-wider uppercase font-mono font-bold transition-transform hover:scale-105"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${borderColor}`,
                  color: textColor
                }}
              >
                {tag}
              </span>
            );
          } else if (badgeStyle === 'outline') {
            renderedContent = (
              <span 
                className="px-4 py-1.5 border text-xs md:text-sm tracking-widest uppercase font-mono font-bold"
                style={{
                  borderColor: borderColor,
                  color: textColor
                }}
              >
                {tag}
              </span>
            );
          } else {
            // Default Brackets style
            renderedContent = `[ ${tag} ]`;
          }

          return (
            <button
              key={i}
              type="button"
              className="px-6 md:px-8 py-1.5 font-display text-lg md:text-2xl font-bold uppercase tracking-widest transition-all hover:scale-105 cursor-default shrink-0"
              style={{ 
                color: textColor,
                ['--hover-color' as any]: accentColor 
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = accentColor;
                e.currentTarget.style.textShadow = `0 0 16px ${accentColor}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = textColor;
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {renderedContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}

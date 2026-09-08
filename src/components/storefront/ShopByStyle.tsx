'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Flame, 
  Layers, 
  Shirt, 
  Compass, 
  Zap, 
  Crown, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import ProductCard from './ProductCard';

interface ShopByStyleProps {
  products: any[];
  title?: string;
  subtitle?: string;
}

interface StyleCategory {
  id: string;
  name: string;
  tagline: string;
  keywords: string[];
  icon: any;
  badge?: string;
}

const STYLE_CATEGORIES: StyleCategory[] = [
  {
    id: 'all',
    name: 'All Styles',
    tagline: 'The complete Inkwave archive',
    keywords: [],
    icon: Compass,
  },
  {
    id: 'y2k',
    name: 'Y2K & Cyber',
    tagline: 'Futuristic chrome & 2000s glitch aesthetics',
    keywords: ['y2k', 'cyber', 'glitch', 'chrome', 'metallic', 'futuristic', 'matrix', 'silver'],
    icon: Zap,
    badge: 'TRENDING'
  },
  {
    id: 'oversized',
    name: 'Oversized Boxy',
    tagline: '240+ GSM heavyweight drop-shoulder silhouettes',
    keywords: ['oversized', 'boxy', 'heavyweight', 'drop shoulder', 'baggy', 'loose', 'relaxed'],
    icon: Shirt,
    badge: 'POPULAR'
  },
  {
    id: 'acid-wash',
    name: 'Acid Wash & Vintage',
    tagline: 'Mineral washed & distressed underground fades',
    keywords: ['acid', 'wash', 'vintage', 'mineral', 'distressed', 'faded', 'retro', 'worn'],
    icon: Flame,
  },
  {
    id: 'anime',
    name: 'Anime & Neo-Tokyo',
    tagline: 'Manga typography & subterranean Tokyo art',
    keywords: ['anime', 'tokyo', 'manga', 'japanese', 'mecha', 'samurai', 'cyberpunk', 'kanji'],
    icon: Sparkles,
  },
  {
    id: 'minimal',
    name: 'Minimal Luxury',
    tagline: 'Understated tonal embroidery & clean essentials',
    keywords: ['minimal', 'luxury', 'essential', 'plain', 'basic', 'tonal', 'clean', 'subtle'],
    icon: Crown,
  },
  {
    id: 'graphic',
    name: 'Graphic Drops',
    tagline: 'Limited edition high-density streetwear prints',
    keywords: ['graphic', 'print', 'typography', 'statement', 'artwork', 'front & back', 'illustration'],
    icon: Layers,
  },
];

export default function ShopByStyle({
  products = [],
  title = 'Shop by Style',
  subtitle = 'Explore curated aesthetic movements, customized fits, and underground drops.',
}: ShopByStyleProps) {
  const [activeStyle, setActiveStyle] = useState<string>('all');

  // Intelligent filter matching products to styles dynamically
  const filteredProducts = useMemo(() => {
    if (activeStyle === 'all') {
      return products;
    }

    const currentCategory = STYLE_CATEGORIES.find((c) => c.id === activeStyle);
    if (!currentCategory || currentCategory.keywords.length === 0) {
      return products;
    }

    const keywords = currentCategory.keywords.map((k) => k.toLowerCase());

    const matched = products.filter((p: any) => {
      const titleText = (p.title || p.name || '').toLowerCase();
      const descText = (p.description || '').toLowerCase();
      const catText = (p.categories?.name || p.category_name || '').toLowerCase();
      const customBadge = (p.customBadge || '').toLowerCase();
      
      // Check tags array if present
      const tags: string[] = Array.isArray(p.tags) ? p.tags.map((t: any) => String(t).toLowerCase()) : [];

      return keywords.some((kw) => 
        titleText.includes(kw) || 
        descText.includes(kw) || 
        catText.includes(kw) || 
        customBadge.includes(kw) ||
        tags.some((t) => t.includes(kw))
      );
    });

    // Fallback: If no direct keyword match exists for this aesthetic yet, show most relevant catalog products
    if (matched.length === 0) {
      return products.slice(0, 8);
    }

    return matched;
  }, [products, activeStyle]);

  const activeCategoryObj = STYLE_CATEGORIES.find((c) => c.id === activeStyle) || STYLE_CATEGORIES[0];

  return (
    <section className="py-16 md:py-24 bg-black border-b border-[var(--line)] relative overflow-hidden" id="shop-by-style">
      <div className="wrap">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[var(--accent)] font-bold bg-[var(--accent)]/10 px-3 py-1 rounded-full border border-[var(--accent)]/20">
                Curated Aesthetics // SS26
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            </div>

            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white tracking-tight leading-none">
              {title}
            </h2>

            <p className="text-[var(--text-dim)] text-xs sm:text-sm font-mono max-w-xl mt-3 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider hidden sm:inline">
              Showing <strong className="text-white">{filteredProducts.length}</strong> drops in <span className="text-[var(--accent)]">{activeCategoryObj.name}</span>
            </span>
          </div>
        </div>

        {/* ─── HORIZONTAL STYLE SELECTOR PILLS BAR ─── */}
        <div className="relative mb-10">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar select-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {STYLE_CATEGORIES.map((cat) => {
              const isSelected = activeStyle === cat.id;
              const Icon = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveStyle(cat.id)}
                  className={`group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-300 shrink-0 font-mono text-xs uppercase tracking-wider cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-[0_4px_20px_rgba(255,255,255,0.25)] scale-102 font-bold'
                      : 'bg-neutral-950 text-neutral-400 border-white/10 hover:border-white/30 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isSelected ? 'text-black' : 'text-[var(--accent)]'}`} />
                  <span>{cat.name}</span>

                  {cat.badge && (
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md leading-none ${
                      isSelected 
                        ? 'bg-black text-white' 
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Style Tagline Banner */}
        <div className="mb-8 flex items-center justify-between p-4 rounded-xl bg-neutral-950/80 border border-white/10 font-mono text-xs text-neutral-400">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            <span className="text-white font-bold uppercase">{activeCategoryObj.name}:</span>
            <span className="italic text-neutral-300">{activeCategoryObj.tagline}</span>
          </div>

          <Link
            href={activeStyle === 'all' ? '/collections' : `/collections?style=${activeStyle}`}
            className="text-xs font-bold text-white hover:text-[var(--accent)] flex items-center gap-1 uppercase transition-colors shrink-0 ml-4 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ─── PRODUCT GRID SHOWCASE ─── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-2xl border border-white/10 bg-neutral-950">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
              Fresh Drops Dropping Soon in {activeCategoryObj.name}
            </h3>
            <p className="text-xs text-neutral-400 font-mono max-w-md mx-auto mb-6">
              Our underground studio is crafting new silhouettes for this style. Check back or explore other styles.
            </p>
            <button
              type="button"
              onClick={() => setActiveStyle('all')}
              className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider font-mono hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Browse All Styles
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
            {filteredProducts.slice(0, 8).map((product: any, idx: number) => (
              <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                <ProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA to Full Catalog */}
        <div className="mt-12 text-center pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs text-neutral-400">
            Looking for something tailored? Check our Custom 3D Print Lab.
          </span>
          <Link
            href="/custom-print"
            className="btn-immersive inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-black hover:text-white border border-white font-mono text-xs font-bold uppercase tracking-wider transition-all rounded-none"
          >
            <span>Custom Print Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}

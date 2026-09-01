'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Check } from 'lucide-react';
import ProductCard from './ProductCard';

interface AnimatedProductGridProps {
  products: any[];
  title?: string;
}

type SortOption = 
  | 'featured'
  | 'relevance'
  | 'bestselling'
  | 'title-asc'
  | 'title-desc'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

type ViewMode = '2' | '3' | '4' | 'list';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'relevance', label: 'Most relevant' },
  { id: 'bestselling', label: 'Best selling' },
  { id: 'title-asc', label: 'Alphabetically, A–Z' },
  { id: 'title-desc', label: 'Alphabetically, Z–A' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'date-asc', label: 'Date, old to new' },
  { id: 'date-desc', label: 'Date, new to old' },
];

export default function AnimatedProductGrid({ products }: AnimatedProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('4');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sorted Products Computation
  const sortedProducts = useMemo(() => {
    const list = [...products];

    switch (sortBy) {
      case 'bestselling':
        return list.sort((a, b) => {
          const aBest = a.is_bestseller || a.customBadge?.toUpperCase() === 'BESTSELLER' ? 1 : 0;
          const bBest = b.is_bestseller || b.customBadge?.toUpperCase() === 'BESTSELLER' ? 1 : 0;
          return bBest - aBest;
        });

      case 'relevance':
        return list.sort((a, b) => {
          const aPriority = (a.is_new || a.is_drop ? 2 : 0) + (a.is_bestseller ? 1 : 0);
          const bPriority = (b.is_new || b.is_drop ? 2 : 0) + (b.is_bestseller ? 1 : 0);
          return bPriority - aPriority;
        });

      case 'title-asc':
        return list.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));

      case 'title-desc':
        return list.sort((a, b) => (b.title || b.name || '').localeCompare(a.title || a.name || ''));

      case 'price-asc':
        return list.sort((a, b) => {
          const priceA = a.base_price || a.price || 0;
          const priceB = b.base_price || b.price || 0;
          return Number(priceA) - Number(priceB);
        });

      case 'price-desc':
        return list.sort((a, b) => {
          const priceA = a.base_price || a.price || 0;
          const priceB = b.base_price || b.price || 0;
          return Number(priceB) - Number(priceA);
        });

      case 'date-asc':
        return list.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

      case 'date-desc':
        return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

      case 'featured':
      default:
        return list;
    }
  }, [products, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Featured';

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

  // Determine grid container classes based on active view mode
  const getGridClasses = () => {
    switch (viewMode) {
      case '2':
        return 'grid grid-cols-2 gap-3 sm:gap-6 items-start w-full';
      case '3':
        return 'grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 items-start w-full';
      case '4':
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 items-start w-full';
      case 'list':
        return 'flex flex-col gap-3 sm:gap-5 w-full';
      default:
        return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 items-start w-full';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* ─── FILTER & SORT TOOLBAR ─── */}
      <div className="flex items-center justify-between gap-4 py-3 px-1 border-b border-white/10 text-white font-sans select-none">
        
        {/* Left: View Mode Switcher (2 cols, 3 cols, 4 cols, List view) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 2-Column Grid Icon */}
          <button
            type="button"
            onClick={() => setViewMode('2')}
            aria-label="2 Columns View"
            title="2 Columns View"
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              viewMode === '2' 
                ? 'bg-white text-black shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* 3-Column Grid Icon */}
          <button
            type="button"
            onClick={() => setViewMode('3')}
            aria-label="3 Columns View"
            title="3 Columns View"
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              viewMode === '3' 
                ? 'bg-white text-black shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
              <rect x="2" y="3" width="5" height="7" rx="1" fill="currentColor" />
              <rect x="9.5" y="3" width="5" height="7" rx="1" fill="currentColor" />
              <rect x="17" y="3" width="5" height="7" rx="1" fill="currentColor" />
              <rect x="2" y="14" width="5" height="7" rx="1" fill="currentColor" />
              <rect x="9.5" y="14" width="5" height="7" rx="1" fill="currentColor" />
              <rect x="17" y="14" width="5" height="7" rx="1" fill="currentColor" />
            </svg>
          </button>

          {/* 4-Column Grid Icon */}
          <button
            type="button"
            onClick={() => setViewMode('4')}
            aria-label="4 Columns View"
            title="4 Columns View"
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 cursor-pointer hidden sm:inline-flex ${
              viewMode === '4' 
                ? 'bg-white text-black shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
              <rect x="1.5" y="3" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="7" y="3" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="12.5" y="3" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="18" y="3" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="1.5" y="14" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="7" y="14" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="12.5" y="14" width="4" height="7" rx="0.75" fill="currentColor" />
              <rect x="18" y="14" width="4" height="7" rx="0.75" fill="currentColor" />
            </svg>
          </button>

          {/* List View Icon */}
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List View"
            title="List View"
            className={`p-2 sm:p-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-white text-black shadow-md' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-4.5 sm:h-4.5">
              <rect x="3" y="4" width="4" height="3.5" rx="0.75" fill="currentColor" />
              <rect x="9.5" y="4" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
              <rect x="3" y="10.25" width="4" height="3.5" rx="0.75" fill="currentColor" />
              <rect x="9.5" y="10.25" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
              <rect x="3" y="16.5" width="4" height="3.5" rx="0.75" fill="currentColor" />
              <rect x="9.5" y="16.5" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Right: Sort By Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm"
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
          >
            <span className="text-neutral-400 font-mono text-[11px] sm:text-xs">Sort by:</span>
            <span className="font-bold text-white tracking-tight">{activeSortLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Floating Dropdown Menu */}
          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-neutral-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-500 border-b border-white/10">
                Sort Options
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {SORT_OPTIONS.map((opt) => {
                  const isSelected = opt.id === sortBy;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected 
                          ? 'text-white font-bold bg-white/10' 
                          : 'text-neutral-300 hover:text-white hover:bg-white/5'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--accent)] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ─── PRODUCT LIST / GRID ─── */}
      <div className={getGridClasses()}>
        {sortedProducts.map((product, i) => (
          <div
            key={product.id}
            className={`product-card-wrap w-full min-w-0 flex flex-col ${viewMode === 'list' ? 'max-w-none' : ''}`}
          >
            <ProductCard product={product} index={i} viewMode={viewMode === 'list' ? 'list' : 'grid'} />
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Sparkles,
  Layers,
  Tag
} from 'lucide-react';
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

const PRICE_RANGES = [
  { id: 'under_999', label: 'Under ₹999', min: 0, max: 999 },
  { id: '999_1499', label: '₹999 - ₹1,499', min: 999, max: 1499 },
  { id: '1499_2499', label: '₹1,499 - ₹2,499', min: 1499, max: 2499 },
  { id: 'above_2499', label: '₹2,499 & Above', min: 2499, max: Infinity },
];

const DISCOUNT_RANGES = [
  { id: '10', label: '10% and above', min: 10 },
  { id: '20', label: '20% and above', min: 20 },
  { id: '30', label: '30% and above', min: 30 },
  { id: 'sale_only', label: 'On Sale Only', min: 1 },
];

export default function AnimatedProductGrid({ products }: AnimatedProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('4');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileSortOpen, setIsMobileSortOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'sizes' | 'categories' | 'price' | 'discount' | 'drops'>('sizes');

  // Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);
  const [selectedDropTypes, setSelectedDropTypes] = useState<string[]>([]);

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

  // Lock body scroll when mobile filter/sort modal is open
  useEffect(() => {
    if (isFilterDrawerOpen || isMobileSortOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterDrawerOpen, isMobileSortOpen]);

  // Dynamically extract all available facet metadata from products
  const availableFacets = useMemo(() => {
    const sizeSet = new Set<string>();
    const categorySet = new Set<string>();

    products.forEach((product) => {
      // Extract sizes
      if (Array.isArray(product.product_variants)) {
        product.product_variants.forEach((v: any) => {
          if (v.size) sizeSet.add(v.size.toUpperCase().trim());
        });
      }
      // Extract category
      const catName = product.categories?.name || product.category_name;
      if (catName) categorySet.add(catName.trim());
    });

    const standardSizesOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'OS', 'FREE SIZE'];
    const sortedSizes = Array.from(sizeSet).sort((a, b) => {
      const idxA = standardSizesOrder.indexOf(a);
      const idxB = standardSizesOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return {
      sizes: sortedSizes,
      categories: Array.from(categorySet).sort(),
    };
  }, [products]);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += selectedSizes.length;
    count += selectedCategories.length;
    count += selectedPriceRanges.length;
    if (selectedDiscount) count += 1;
    count += selectedDropTypes.length;
    return count;
  }, [selectedSizes, selectedCategories, selectedPriceRanges, selectedDiscount, selectedDropTypes]);

  // Reset all filters
  const handleClearAll = () => {
    setSelectedSizes([]);
    setSelectedCategories([]);
    setSelectedPriceRanges([]);
    setSelectedDiscount(null);
    setSelectedDropTypes([]);
  };

  // Filter Products Algorithm
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Size Filter
      if (selectedSizes.length > 0) {
        const productSizes = (product.product_variants || []).map((v: any) => (v.size || '').toUpperCase().trim());
        const hasMatchingSize = selectedSizes.some((s) => productSizes.includes(s));
        if (!hasMatchingSize) return false;
      }

      // 2. Category Filter
      if (selectedCategories.length > 0) {
        const catName = (product.categories?.name || product.category_name || '').trim();
        if (!selectedCategories.includes(catName)) return false;
      }

      // 3. Price Range Filter
      if (selectedPriceRanges.length > 0) {
        const price = Number(product.base_price || product.price || 0);
        const matchesAnyPriceRange = selectedPriceRanges.some((rangeId) => {
          const range = PRICE_RANGES.find((r) => r.id === rangeId);
          if (!range) return true;
          return price >= range.min && price <= range.max;
        });
        if (!matchesAnyPriceRange) return false;
      }

      // 4. Discount Filter
      if (selectedDiscount) {
        const price = Number(product.base_price || product.price || 0);
        const compareAt = Number(product.compare_at_price ?? product.compareAtPrice ?? 0);
        const discPercent = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : (product.discount_percent || 0);
        
        if (selectedDiscount === 'sale_only') {
          const isOnSale = Boolean(product.is_sale || product.isSale || compareAt > price);
          if (!isOnSale) return false;
        } else {
          const minDisc = Number(selectedDiscount);
          if (discPercent < minDisc) return false;
        }
      }

      // 5. Drop Types Filter (New, Bestseller, Limited)
      if (selectedDropTypes.length > 0) {
        const isNew = Boolean(product.is_new || product.isNew);
        const isBestseller = Boolean(product.is_bestseller || product.customBadge?.toUpperCase() === 'BESTSELLER');
        const isDrop = Boolean(product.is_drop || product.customBadge?.toUpperCase() === 'LIMITED DROP');

        const matchesDrop = selectedDropTypes.some((type) => {
          if (type === 'new') return isNew;
          if (type === 'bestseller') return isBestseller;
          if (type === 'limited') return isDrop;
          return false;
        });
        if (!matchesDrop) return false;
      }

      return true;
    });
  }, [products, selectedSizes, selectedCategories, selectedPriceRanges, selectedDiscount, selectedDropTypes]);

  // Sort Filtered Products Algorithm
  const sortedAndFilteredProducts = useMemo(() => {
    const list = [...filteredProducts];

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
  }, [filteredProducts, sortBy]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Featured';

  // Toggle helper for multi-select arrays
  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter((prev) => 
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

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
    <div className="w-full flex flex-col space-y-4 sm:space-y-6">
      
      {/* ─── SOULED STORE DESKTOP & MOBILE TOOLBAR ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-1 border-b border-white/10 text-white font-sans select-none">
        
        {/* Left: Filter Toggle Button + Grid Layout Modes */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* THE SOULED STORE "FILTERS" BUTTON */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-white/15 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm hover:border-white/30"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center font-mono">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Grid Layout Switcher */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-white/10">
            {/* 2-Column Grid */}
            <button
              type="button"
              onClick={() => setViewMode('2')}
              aria-label="2 Columns View"
              title="2 Columns View"
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === '2' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              </svg>
            </button>

            {/* 3-Column Grid */}
            <button
              type="button"
              onClick={() => setViewMode('3')}
              aria-label="3 Columns View"
              title="3 Columns View"
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === '3' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                <rect x="2" y="3" width="5" height="7" rx="1" fill="currentColor" />
                <rect x="9.5" y="3" width="5" height="7" rx="1" fill="currentColor" />
                <rect x="17" y="3" width="5" height="7" rx="1" fill="currentColor" />
                <rect x="2" y="14" width="5" height="7" rx="1" fill="currentColor" />
                <rect x="9.5" y="14" width="5" height="7" rx="1" fill="currentColor" />
                <rect x="17" y="14" width="5" height="7" rx="1" fill="currentColor" />
              </svg>
            </button>

            {/* 4-Column Grid */}
            <button
              type="button"
              onClick={() => setViewMode('4')}
              aria-label="4 Columns View"
              title="4 Columns View"
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer hidden sm:inline-flex ${
                viewMode === '4' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
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

            {/* List View */}
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List View"
              title="List View"
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                <rect x="3" y="4" width="4" height="3.5" rx="0.75" fill="currentColor" />
                <rect x="9.5" y="4" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
                <rect x="3" y="10.25" width="4" height="3.5" rx="0.75" fill="currentColor" />
                <rect x="9.5" y="10.25" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
                <rect x="3" y="16.5" width="4" height="3.5" rx="0.75" fill="currentColor" />
                <rect x="9.5" y="16.5" width="11.5" height="3.5" rx="0.75" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: Item Count & Desktop Sort By Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <span className="text-[11px] sm:text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Showing <strong className="text-white">{sortedAndFilteredProducts.length}</strong> of {products.length}
          </span>

          {/* Desktop Sort Dropdown */}
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm"
              aria-haspopup="listbox"
              aria-expanded={isSortOpen}
            >
              <span className="text-neutral-400 font-mono text-[11px]">Sort by:</span>
              <span className="font-bold text-white tracking-tight">{activeSortLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Desktop Sort Floating Menu */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
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
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected 
                            ? 'text-white font-bold bg-white/10' 
                            : 'text-neutral-300 hover:text-white hover:bg-white/5'
                        }`}
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

      </div>

      {/* ─── ACTIVE FILTER CHIPS / PILLS BAR ─── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 animate-in fade-in duration-200">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest mr-1">
            Active:
          </span>

          {/* Size Chips */}
          {selectedSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleArrayItem(setSelectedSizes, size)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono transition-all cursor-pointer"
            >
              <span>Size: {size}</span>
              <X className="w-3 h-3 text-neutral-400 hover:text-white" />
            </button>
          ))}

          {/* Category Chips */}
          {selectedCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleArrayItem(setSelectedCategories, cat)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono transition-all cursor-pointer"
            >
              <span>{cat}</span>
              <X className="w-3 h-3 text-neutral-400 hover:text-white" />
            </button>
          ))}

          {/* Price Range Chips */}
          {selectedPriceRanges.map((rangeId) => {
            const range = PRICE_RANGES.find((r) => r.id === rangeId);
            return (
              <button
                key={rangeId}
                type="button"
                onClick={() => toggleArrayItem(setSelectedPriceRanges, rangeId)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono transition-all cursor-pointer"
              >
                <span>{range?.label}</span>
                <X className="w-3 h-3 text-neutral-400 hover:text-white" />
              </button>
            );
          })}

          {/* Discount Chip */}
          {selectedDiscount && (
            <button
              type="button"
              onClick={() => setSelectedDiscount(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-all cursor-pointer"
            >
              <span>{DISCOUNT_RANGES.find((d) => d.id === selectedDiscount)?.label}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Drop Type Chips */}
          {selectedDropTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleArrayItem(setSelectedDropTypes, type)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono transition-all cursor-pointer"
            >
              <span className="capitalize">{type} Drop</span>
              <X className="w-3 h-3" />
            </button>
          ))}

          {/* Clear All Reset Button */}
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-mono font-bold transition-all cursor-pointer ml-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* ─── PRODUCT LIST / GRID ─── */}
      {sortedAndFilteredProducts.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl border border-white/10 bg-neutral-950/50">
          <div className="text-4xl sm:text-5xl mb-4">🔍</div>
          <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-white mb-2">
            No matching pieces found
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto mb-6">
            We couldn't find any products matching your active filters. Try adjusting or clearing your filters to see more drops.
          </p>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all font-mono cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={getGridClasses()}>
          {sortedAndFilteredProducts.map((product, i) => (
            <div
              key={product.id}
              className={`product-card-wrap w-full min-w-0 flex flex-col ${viewMode === 'list' ? 'max-w-none' : ''}`}
            >
              <ProductCard product={product} index={i} viewMode={viewMode === 'list' ? 'list' : 'grid'} />
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          THE SOULED STORE DEDICATED FACETED FILTER DRAWER (DESKTOP & MOBILE)
      ══════════════════════════════════════════════════════════════════ */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Filter Modal Container */}
          <div className="relative z-10 w-full max-w-lg sm:max-w-xl h-full bg-neutral-950 border-l border-white/15 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-neutral-900/60">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-white">
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs font-mono text-neutral-400 hover:text-rose-400 uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Souled Store Two-Pane Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Pane: Categories / Facet Tabs */}
              <div className="w-1/3 sm:w-44 border-r border-white/10 bg-neutral-950 overflow-y-auto divide-y divide-white/5 font-mono text-xs uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveMobileTab('sizes')}
                  className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeMobileTab === 'sizes' ? 'bg-neutral-800 text-white font-bold border-l-2 border-[var(--accent)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Sizes</span>
                  {selectedSizes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center">
                      {selectedSizes.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMobileTab('categories')}
                  className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeMobileTab === 'categories' ? 'bg-neutral-800 text-white font-bold border-l-2 border-[var(--accent)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Category</span>
                  {selectedCategories.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center">
                      {selectedCategories.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMobileTab('price')}
                  className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeMobileTab === 'price' ? 'bg-neutral-800 text-white font-bold border-l-2 border-[var(--accent)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Price</span>
                  {selectedPriceRanges.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center">
                      {selectedPriceRanges.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMobileTab('discount')}
                  className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeMobileTab === 'discount' ? 'bg-neutral-800 text-white font-bold border-l-2 border-[var(--accent)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Discount</span>
                  {selectedDiscount && (
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMobileTab('drops')}
                  className={`w-full p-3.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeMobileTab === 'drops' ? 'bg-neutral-800 text-white font-bold border-l-2 border-[var(--accent)]' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>Drops & Fits</span>
                  {selectedDropTypes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-black text-[9px] font-bold flex items-center justify-center">
                      {selectedDropTypes.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right Pane: Option Values for the Active Tab */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-neutral-900/30">
                
                {/* 1. SIZES TAB */}
                {activeMobileTab === 'sizes' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                      Select Sizes
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {availableFacets.sizes.map((size) => {
                        const isSelected = selectedSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleArrayItem(setSelectedSizes, size)}
                            className={`py-3 px-2 rounded-xl text-xs font-mono font-bold uppercase transition-all duration-200 border cursor-pointer ${
                              isSelected 
                                ? 'bg-white text-black border-white shadow-lg scale-102' 
                                : 'bg-neutral-950 text-neutral-300 border-white/10 hover:border-white/30'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. CATEGORIES TAB */}
                {activeMobileTab === 'categories' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                      Select Categories
                    </h4>
                    {availableFacets.categories.length === 0 ? (
                      <p className="text-xs text-neutral-500">No categories found.</p>
                    ) : (
                      availableFacets.categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleArrayItem(setSelectedCategories, cat)}
                            className={`w-full p-3 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-white/15 border-white text-white font-bold'
                                : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                            }`}
                          >
                            <span>{cat}</span>
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                              isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'border-white/30'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 3. PRICE RANGES TAB */}
                {activeMobileTab === 'price' && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                      Select Price Range
                    </h4>
                    {PRICE_RANGES.map((range) => {
                      const isSelected = selectedPriceRanges.includes(range.id);
                      return (
                        <button
                          key={range.id}
                          type="button"
                          onClick={() => toggleArrayItem(setSelectedPriceRanges, range.id)}
                          className={`w-full p-3.5 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-white/15 border-white text-white font-bold'
                              : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                          }`}
                        >
                          <span>{range.label}</span>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isSelected ? 'bg-[var(--accent)] border-[var(--accent)] text-black' : 'border-white/30'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 4. DISCOUNT TAB */}
                {activeMobileTab === 'discount' && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                      Minimum Discount
                    </h4>
                    {DISCOUNT_RANGES.map((disc) => {
                      const isSelected = selectedDiscount === disc.id;
                      return (
                        <button
                          key={disc.id}
                          type="button"
                          onClick={() => setSelectedDiscount(isSelected ? null : disc.id)}
                          className={`w-full p-3.5 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                              : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                          }`}
                        >
                          <span>{disc.label}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-white/30'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 5. DROPS & FIT TAB */}
                {activeMobileTab === 'drops' && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                      Drop & Edition Types
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => toggleArrayItem(setSelectedDropTypes, 'new')}
                      className={`w-full p-3.5 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                        selectedDropTypes.includes('new')
                          ? 'bg-white/15 border-white text-white font-bold'
                          : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>New Drops</span>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        selectedDropTypes.includes('new') ? 'bg-white border-white text-black' : 'border-white/30'
                      }`}>
                        {selectedDropTypes.includes('new') && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleArrayItem(setSelectedDropTypes, 'bestseller')}
                      className={`w-full p-3.5 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                        selectedDropTypes.includes('bestseller')
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bestsellers</span>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        selectedDropTypes.includes('bestseller') ? 'bg-amber-400 border-amber-400 text-black' : 'border-white/30'
                      }`}>
                        {selectedDropTypes.includes('bestseller') && <Check className="w-3 h-3" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleArrayItem(setSelectedDropTypes, 'limited')}
                      className={`w-full p-3.5 rounded-xl flex items-center justify-between text-xs font-mono transition-all border cursor-pointer ${
                        selectedDropTypes.includes('limited')
                          ? 'bg-red-500/15 border-red-400 text-red-300 font-bold'
                          : 'bg-neutral-950/70 border-white/10 text-neutral-300 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-red-400" />
                        <span>Limited Edition Drops</span>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        selectedDropTypes.includes('limited') ? 'bg-red-400 border-red-400 text-black' : 'border-white/30'
                      }`}>
                        {selectedDropTypes.includes('limited') && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Footer: The Souled Store Clear & Apply Buttons */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-neutral-950 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="w-1/3 py-3.5 rounded-xl border border-white/20 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-white/5 transition-all cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-2/3 py-3.5 rounded-xl bg-white text-black font-mono text-xs uppercase tracking-widest font-black shadow-lg hover:bg-neutral-200 active:scale-98 transition-all cursor-pointer"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          THE SOULED STORE MOBILE FLOATING BOTTOM FILTER/SORT BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-16 left-4 right-4 z-40 flex items-center bg-neutral-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setIsMobileSortOpen(true)}
          className="flex-1 py-3.5 px-3 flex items-center justify-center gap-1.5 text-white font-bold border-r border-white/15 active:bg-white/10 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          <span className="truncate">Sort: {activeSortLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex-1 py-3.5 px-3 flex items-center justify-center gap-1.5 text-white font-bold active:bg-white/10 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE SORT BOTTOM SHEET
      ══════════════════════════════════════════════════════════════════ */}
      {isMobileSortOpen && (
        <div className="sm:hidden fixed inset-0 z-[160] flex items-end">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileSortOpen(false)}
          />
          <div className="relative z-10 w-full bg-neutral-950 border-t border-white/20 rounded-t-3xl p-5 text-white shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/10">
              <h4 className="font-display text-base font-bold uppercase tracking-wider">
                Sort By
              </h4>
              <button
                type="button"
                onClick={() => setIsMobileSortOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 py-1 max-h-72 overflow-y-auto font-mono text-xs">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.id === sortBy;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setIsMobileSortOpen(false);
                    }}
                    className={`w-full py-3 px-3.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-white/15 text-white font-bold' : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[var(--accent)]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

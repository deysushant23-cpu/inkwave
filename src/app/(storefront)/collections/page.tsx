import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import AnimatedProductGrid from '@/components/storefront/AnimatedProductGrid';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';
import Link from 'next/link';
import { Sparkles, Wand2 } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Streetwear Collections & Drops | Inkwave',
  description: 'Explore the complete Inkwave underground catalog. 240 GSM heavyweights, oversized silhouettes, graphic tees, denim jeans, and custom streetwear.',
  openGraph: {
    title: 'All Streetwear Collections & Drops | Inkwave',
    description: 'Explore the complete Inkwave underground catalog.',
  }
};

export default async function CollectionsPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, categories(name, slug), product_variants(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
  ]);

  const rawProducts = (productsRes.data || []) as any[];
  const categories = (categoriesRes.data || []) as any[];

  // Clean, enrich, and filter out any invalid/null product items
  const validProducts = rawProducts.filter(p => p && (p.title || p.name) && p.id);
  const products = await enrichProductsWithComparePrices(validProducts);

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-24">
      <div className="wrap space-y-8">
        
        {/* Editorial Collection Header */}
        <div className="border-b border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[var(--accent)]" /> THE INKWAVE VAULT
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                • {products.length} PIECES LIVE
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl uppercase font-black tracking-tight text-white">
              ALL COLLECTIONS
            </h1>
            <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-xl">
              Engineered with 240 GSM heavy-weight super-combed cotton. Boxy drop-shoulder silhouettes designed to never blend in.
            </p>
          </div>

          {/* Quick Custom Lab Banner */}
          <Link
            href="/custom-print"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/15 hover:border-white/40 hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-wider text-white shrink-0 group"
          >
            <Wand2 className="w-4 h-4 text-[var(--accent)] group-hover:rotate-12 transition-transform" />
            <span>Design Custom Tee • <strong className="text-emerald-400">₹600</strong></span>
          </Link>
        </div>

        {/* Dynamic Category Quick-Filter Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
            <Link
              href="/collections"
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-white text-black shrink-0 shadow-sm"
            >
              All Drops ({products.length})
            </Link>
            {categories.map((cat: any) => {
              const count = products.filter(p => p.category_id === cat.id).length;
              if (count === 0) return null;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white shrink-0 transition-all"
                >
                  {cat.name} ({count})
                </Link>
              );
            })}
          </div>
        )}

        {/* Faceted Animated Product Grid */}
        <AnimatedProductGrid products={products} title="All Pieces" />

      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

import { notFound } from 'next/navigation';
import AnimatedProductGrid from '@/components/storefront/AnimatedProductGrid';
import CategoryHero from '@/components/storefront/CategoryHero';
import MarqueeFilters from '@/components/storefront/MarqueeFilters';
import CursorSpotlight from '@/components/storefront/CursorSpotlight';
import Scroll3DEffect from '@/components/storefront/Scroll3DEffect';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const rawSlug = (resolvedParams.slug || '').toLowerCase().trim();
  const supabase = await createClient();
  
  const { data: category } = await supabase
    .from('categories')
    .select('name, description, slug')
    .ilike('slug', rawSlug)
    .single();

  if (!category) return { title: 'Category Not Found | Inkwave' };
  
  const c = category as any;
  const canonicalSlug = c.slug || rawSlug;

  return {
    title: `${c.name} | Inkwave Streetwear`,
    description: c.description || `Shop the latest ${c.name} collection at Inkwave. Premium 240 GSM heavyweights, custom prints, and oversized streetwear fits.`,
    keywords: [
      c.name,
      `${c.name} streetwear`,
      `oversized ${c.name}`,
      'inkwave fashion',
      'streetwear india',
      'heavyweight apparel'
    ],
    alternates: {
      canonical: `/category/${canonicalSlug}`,
    },
    openGraph: {
      title: `${c.name} | Inkwave Streetwear`,
      description: c.description || `Shop the latest ${c.name} collection at Inkwave.`,
      url: `https://inkwavefashion.com/category/${canonicalSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${c.name} | Inkwave Streetwear`,
      description: c.description || `Shop the latest ${c.name} collection at Inkwave.`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const rawSlug = (resolvedParams.slug || '').toLowerCase().trim();
  
  const supabase = await createClient();

  // Fetch all categories to dynamically and accurately resolve the target category
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*');

  const categoriesList = (allCategories || []) as any[];

  // Helper normalizer: removes hyphens, underscores, spaces, and trailing 's'
  const normalize = (str: string) => (str || '').toLowerCase().replace(/[-_\s]+/g, '').replace(/s$/, '');
  const targetNorm = normalize(rawSlug);

  // Strategy 1: Exact slug match
  let category = categoriesList.find(c => (c.slug || '').toLowerCase() === rawSlug);

  // Strategy 2: Normalized slug comparison (matches 'jeans' to 'jean' or 'jeans', 't-shirts' to 'tshirt' or 't-shirt')
  if (!category) {
    category = categoriesList.find(c => normalize(c.slug) === targetNorm);
  }

  // Strategy 3: Category name comparison (matches 'jeans' to 'Jeans', 'shirts' to 'Shirts')
  if (!category) {
    category = categoriesList.find(c => normalize(c.name) === targetNorm || (c.name || '').toLowerCase() === rawSlug.replace(/-/g, ' '));
  }

  // Strategy 4: Direct DB fallback query
  if (!category) {
    const { data: directCat } = await supabase
      .from('categories')
      .select('*')
      .or(`slug.ilike.${rawSlug},slug.ilike.${rawSlug.replace(/s$/, '')},slug.ilike.${rawSlug}s,name.ilike.${rawSlug}`)
      .limit(1)
      .maybeSingle();

    category = directCat as any;
  }

  if (!category) {
    return notFound();
  }

  // Hide the category if it has been marked as inactive by the admin
  if (category.is_active === false) {
    return notFound();
  }

  // Fetch products for this category
  let { data: productsData } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_variants(*)')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  let rawList = (productsData as any[]) || [];
  rawList = rawList
    .filter(p => p && (p.title || p.name) && p.id)
    .map(p => ({
      ...p,
      categories: p.categories || { name: category.name, slug: category.slug }
    }));

  let products = await enrichProductsWithComparePrices(rawList);

  // Fetch CMS Hero Banner
  // Fetch CMS Hero Banner & Marquee Settings
  const sectionKey = `category_banner_${category.slug || rawSlug}`;
  const [bannerRes, marqueeRes] = await Promise.all([
    supabase.from('cms_sections').select('json_content').eq('section_key', sectionKey).single(),
    supabase.from('cms_sections').select('json_content').eq('section_key', 'category_marquee_config').single()
  ]);
    
  const bannerConfig = (bannerRes.data as any)?.json_content as { url?: string, type?: 'image' | 'video' } | undefined;
  const marqueeConfig = (marqueeRes.data as any)?.json_content;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inkwavefashion.com';
  const categoryUrl = `${baseUrl}/category/${category.slug || rawSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "name": `${category.name} | Inkwave Streetwear`,
        "description": category.description || `Shop the latest ${category.name} at Inkwave.`,
        "url": categoryUrl,
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": products.slice(0, 16).map((p: any, idx: number) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": `${baseUrl}/product/${p.slug}`,
            "name": p.title
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category.name,
            "item": categoryUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="flex flex-col w-full relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CursorSpotlight />

      {/* ─── PREMIUM PARALLAX HERO ─── */}
      <CategoryHero 
        title={category?.name || 'Collection'} 
        description={category?.description}
        bannerConfig={bannerConfig} 
      />

      {/* ─── INFINITE MARQUEE FILTERS ─── */}
      <MarqueeFilters config={marqueeConfig} categorySlug={category?.slug} />

      {/* ─── PRODUCT GRID ─── */}
      <section className="py-6 sm:py-10 md:py-14 px-3 sm:px-6 md:px-8 relative" id="products">
        <div className="max-w-7xl mx-auto">
          {/* Header Bar */}
          <div className="flex items-baseline justify-between mb-4 sm:mb-6 pb-3 border-b border-white/10">
            <div className="flex items-baseline gap-2.5 sm:gap-4">
              <h1 className="font-display text-xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-white tracking-tight">
                {category?.name}
              </h1>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-neutral-400">
                [{products.length} {products.length === 1 ? 'ITEM' : 'ITEMS'}]
              </span>
            </div>
            {category?.description && (
              <p className="hidden md:block text-xs text-neutral-400 max-w-md text-right truncate">
                {category.description}
              </p>
            )}
          </div>

          {/* 2-Column Mobile / Multi-column Desktop Grid */}
          <AnimatedProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}

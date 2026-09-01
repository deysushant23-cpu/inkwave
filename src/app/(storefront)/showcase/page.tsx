import { createClient } from '@/lib/supabase/server';
import ScrollRevealGallery from '@/components/storefront/ScrollRevealGallery';
import AnimatedProductGrid from '@/components/storefront/AnimatedProductGrid';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';
import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';



export const metadata: Metadata = {
  title: 'Showcase | Inkwave',
  description: 'Explore the new era of collections.',
};

export default async function ShowcasePage() {
  const supabase = await createClient();
  
  // 1. Fetch products with variants and categories
  const { data: allProducts } = await supabase
    .from('products')
    .select('*, product_variants(*), categories(name)')
    .order('created_at', { ascending: false });

  // 2. Fetch CMS Showcase Page Config & Legacy Banner Set
  const [{ data: showcasePageData }, { data: showcaseBannerData }] = await Promise.all([
    supabase
      .from('cms_sections')
      .select('json_content')
      .eq('section_key', 'showcase_page_config')
      .single(),
    supabase
      .from('cms_sections')
      .select('json_content')
      .eq('section_key', 'showcase_banner_set')
      .single()
  ]);

  const pageConfig = (showcasePageData as any)?.json_content;
  const bannerConfig = (showcaseBannerData as any)?.json_content;

  // Custom 3D Reveal Images (Quadrant 1 to 4)
  const customBannerImages = (pageConfig?.images && pageConfig.images.length > 0)
    ? pageConfig.images
    : ((bannerConfig as any)?.images as string[] | undefined);

  // Showcase Headers & Branding
  const headline = pageConfig?.headline || 'FEATURED PIECES';
  const eyebrow = pageConfig?.eyebrow || 'VANGUARD SERIES';
  const subtitle = pageConfig?.subtitle || 'EXPLORE THE LATEST DROPS FROM OUR VANGUARD COLLECTION. ENGINEERED FOR THE NEW ERA.';
  const ctaText = pageConfig?.ctaText || 'SHOP ALL DROPS';
  const ctaLink = pageConfig?.ctaLink || '/showcase';
  const showcaseMode = pageConfig?.mode || 'custom';

  // Determine which products to display
  let displayProducts: any[] = [];
  const rawProducts: any[] = (allProducts || []) as any[];

  if (showcaseMode === 'custom' && pageConfig?.selectedProducts && Array.isArray(pageConfig.selectedProducts) && pageConfig.selectedProducts.length > 0) {
    // Map in exact ordered sequence configured by the admin
    displayProducts = pageConfig.selectedProducts.map((item: any) => {
      const slug = typeof item === 'string' ? item : item?.slug;
      const customBadge = typeof item === 'object' ? item?.badge : undefined;
      const prod = rawProducts.find((p: any) => p.slug === slug);
      if (!prod) return null;
      return {
        ...prod,
        customBadge: customBadge || (prod.isNew ? 'NEW' : prod.isLimited ? 'LIMITED STOCK' : undefined)
      };
    }).filter(Boolean);

    // Fallback if none matched
    if (displayProducts.length === 0) {
      displayProducts = rawProducts;
    }
  } else {
    displayProducts = rawProducts;
  }

  displayProducts = await enrichProductsWithComparePrices(displayProducts);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Scroll Reveal Hero */}
      <ScrollRevealGallery products={displayProducts} customImages={customBannerImages} />

      {/* Main Content Area after scrolling past the reveal */}
      <div className="flex-1 px-4 sm:px-8 md:px-16 py-12 sm:py-24 bg-surface z-20 relative -mt-32 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <header className="pb-10 sm:pb-16 flex flex-col items-center text-center px-2">
          {eyebrow && (
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent)] mb-2 font-bold">
              {eyebrow}
            </span>
          )}
          <h2 className="font-headline-lg text-2xl sm:text-[36px] md:text-[48px] text-on-surface uppercase mb-3 tracking-tight font-bold">
            {headline}
          </h2>
          <p className="font-label-caps text-xs sm:text-sm text-on-surface-variant tracking-[0.15em] sm:tracking-[0.2em] max-w-xl">
            {subtitle}
          </p>
        </header>

        {/* Product Grid with Layout Switcher & Sort By Controls */}
        <div className="max-w-[1600px] mx-auto">
          <AnimatedProductGrid products={displayProducts} />
        </div>
        
        {/* Bottom CTA Button */}
        {ctaText && (
          <div className="mt-24 flex justify-center pb-24">
            <Link href={ctaLink || '/collections'}>
              <Button variant="outline" size="lg" className="rounded-none font-label-caps tracking-widest px-12 border-white/20 hover:bg-white/10 text-white font-bold uppercase transition-all">
                {ctaText}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/storefront/HeroSection';

import Link from 'next/link';
import ProductCard from '@/components/storefront/ProductCard';
import CarouselNav from '@/components/storefront/CarouselNav';
import NewsletterForm from '@/components/storefront/NewsletterForm';
import PremiumButton from '@/components/storefront/PremiumButton';

import ScrollRevealText from '@/components/storefront/ScrollRevealText';
import InvertedPerspectiveCarousel from '@/components/storefront/InvertedPerspectiveCarousel';
import OffersSection from '@/components/storefront/OffersSection';
import Scroll3DEffect from '@/components/storefront/Scroll3DEffect';
import ReelsSection from '@/components/storefront/ReelsSection';
import CuratedFits from '@/components/storefront/CuratedFits';
import PremiumCategoriesBento from '@/components/storefront/PremiumCategoriesBento';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';

export default async function CollectionsPage() {
  const supabase = await createClient();
  
  let { data: configData } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'homepage_config')
    .single();

  let { data: newDropsConfig } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'new_drops_config')
    .single();

  let { data: bestsellersConfig } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'bestsellers_config')
    .single();

  let { data: fitsData } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'curated_fits_config')
    .single();

  const config = configData?.json_content || {};
  const curatedFits = fitsData?.json_content?.fits || null;
  const showFits = fitsData?.json_content?.show ?? true;
  const newDropSlugs = newDropsConfig?.json_content?.slugs || [];

  let products: any[] = [];
  
  if (newDropSlugs && newDropSlugs.length > 0) {
    // Fetch explicitly curated products
    const { data: explicitProducts } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_variants(*)')
      .in('slug', newDropSlugs);
      
    if (explicitProducts) {
      // Map to maintain the order defined in the admin panel
      products = newDropSlugs.map((slug: string) => (explicitProducts as any[]).find((p: any) => p.slug === slug)).filter(Boolean);
    }
  } else {
    // Fallback: Latest 8 products
    let { data: rawProducts, error: productsError } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_variants(*)')
      .order('created_at', { ascending: false })
      .limit(8);
      
    products = rawProducts as any[] || [];
    if (productsError) {
      console.error('Failed to fetch latest products', productsError);
    }
  }

  products = await enrichProductsWithComparePrices(products);

  const bestsellerSlugs = bestsellersConfig?.json_content?.slugs || [];
  let bestsellerProducts: any[] = [];
  
  if (bestsellerSlugs && bestsellerSlugs.length > 0) {
    // Fetch explicitly curated bestsellers
    const { data: explicitBestsellers } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_variants(*)')
      .in('slug', bestsellerSlugs);
      
    if (explicitBestsellers) {
      bestsellerProducts = bestsellerSlugs.map((slug: string) => (explicitBestsellers as any[]).find((p: any) => p.slug === slug)).filter(Boolean);
    }
  } else {
    // Fallback: Latest 8 products
    let { data: rawBestsellers, error: bestsellersError } = await supabase
      .from('products')
      .select('*, categories(name, slug), product_variants(*)')
      .order('created_at', { ascending: false })
      .limit(8);
      
    bestsellerProducts = rawBestsellers as any[] || [];
    if (bestsellersError) {
      console.error('Failed to fetch latest bestsellers', bestsellersError);
    }
  }

  bestsellerProducts = await enrichProductsWithComparePrices(bestsellerProducts);

  const rawMarquee = config.marqueeItems || [];
  const marqueeItems = rawMarquee.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item);

  const giantMarqueeText = config.giantMarqueeText || "";
  const giantMarqueeLink = config.giantMarqueeLink || "";
  const valueStrip = config.valueStrip || [];
  const newsletterTitle = config.newsletterTitle || "Get the next drop first";
  const newsletterDesc = config.newsletterDesc || "First access to restocks and runs that don't last. No spam, just ink.";

  return (
    <>
      <div className="flex flex-col w-full relative z-10">
        <HeroSection config={config} />

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee" id="marquee">
            {marqueeItems.map((item: any, i: number) => (
              <span key={i}>
                <i></i>
                {item.link ? <Link href={item.link} className="hover:underline">{item.text}</Link> : item.text}
              </span>
            ))}
            {marqueeItems.map((item: any, i: number) => (
              <span key={i + 'dup'}>
                <i></i>
                {item.link ? <Link href={item.link} className="hover:underline">{item.text}</Link> : item.text}
              </span>
            ))}
          </div>
        </div>

        {/* NEW DROPS GRID */}
        <section className="section" id="new">
          <div className="wrap">
            <div className="sec-head reveal in">
              <div>
                <span className="sec-tag">Vol. 04 / New Arrivals</span>
                <h2>New Drops</h2>
              </div>
            </div>
            <div className="mt-12 w-full max-w-full overflow-hidden">
              <InvertedPerspectiveCarousel products={products.slice(0, 8)} />
            </div>
          </div>
        </section>

        {/* VALUE STRIP */}
        {valueStrip.length > 0 && (
          <Scroll3DEffect>
            <div className="value-strip">
              {valueStrip.map((item: any, idx: number) => (
                <div key={idx} className="value-item reveal in">
                  <svg viewBox={item.viewBox || "0 0 24 24"}>
                    {item.type === 'pathRect' ? (
                      <>
                        <rect x={item.rect.x} y={item.rect.y} width={item.rect.width} height={item.rect.height} rx={item.rect.rx} />
                        <path d={item.icon} />
                      </>
                    ) : (
                      <path d={item.icon} />
                    )}
                  </svg>
                  <h4>{item.title}</h4><p>{item.desc}</p>
                </div>
              ))}
            </div>
          </Scroll3DEffect>
        )}

        {/* OFFERS */}
        <Scroll3DEffect>
          <OffersSection />
        </Scroll3DEffect>

        {/* BESTSELLERS AUTO-SLIDER */}
        <Scroll3DEffect>
          <section className="section" id="collection" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head reveal in">
                <div>
                  <span className="sec-tag">Held their shape</span>
                  <h2>Bestsellers</h2>
                </div>
              </div>
            </div>
            
            <div className="auto-slider-wrap reveal in">
              <div className="auto-slider-track">
                {/* Duplicate the array to create a seamless infinite loop */}
                {[...bestsellerProducts, ...bestsellerProducts, ...bestsellerProducts].slice(0, 16).map((p, i) => (
                  <div key={`${p.id}-${i}`} style={{ width: '300px', flexShrink: 0 }}>
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Scroll3DEffect>

        {/* GIANT TYPOGRAPHY MARQUEE DIVIDER */}
        <div className="giant-marquee-wrap">
          {giantMarqueeLink ? (
            <Link href={giantMarqueeLink} className="giant-marquee-text cursor-pointer hover:opacity-90 transition-opacity block">
              <span>{giantMarqueeText}</span>
              <span>{giantMarqueeText}</span>
            </Link>
          ) : (
            <div className="giant-marquee-text">
              <span>{giantMarqueeText}</span>
              <span>{giantMarqueeText}</span>
            </div>
          )}
        </div>

        {/* SHOP BY CATEGORY — EXPANDING ACCORDION STRIP */}
        <Scroll3DEffect>
          <PremiumCategoriesBento />
        </Scroll3DEffect>

        {/* CURATED FITS SECTION */}
        {showFits && <CuratedFits fits={curatedFits} />}

        {/* SHOPPABLE REELS SECTION */}
        <ReelsSection />

        {/* CATALOG LINK BANNER */}
        <section className="py-16 border-y border-[var(--line)] bg-[var(--bg-alt)] relative overflow-hidden group">
          <div className="absolute inset-0 bg-radial-gradient from-[var(--accent)]/5 via-transparent to-transparent opacity-20 pointer-events-none" />
          <div className="wrap flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left relative z-10">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-dim)] font-bold mb-1.5 block">
                Catalog Directory
              </span>
              <h4 className="font-display text-xl sm:text-2xl uppercase font-black text-white tracking-wide">
                Looking for the full catalog?
              </h4>
              <p className="text-[var(--text-dim)] text-xs sm:text-sm font-mono mt-1">
                Browse our complete collection of garments, silhouettes, and categories.
              </p>
            </div>
            <Link 
              href="/" 
              className="btn btn-ghost border border-white/20 text-white hover:border-white hover:bg-white/5 transition-all hover:scale-105 duration-300"
            >
              <span>Go to Catalog &rarr;</span>
            </Link>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="newsletter">
          <div className="wrap reveal in">
            <h2>{newsletterTitle}</h2>
            <p>{newsletterDesc}</p>
            <NewsletterForm />
          </div>
        </section>
      </div>
    </>
  );
}

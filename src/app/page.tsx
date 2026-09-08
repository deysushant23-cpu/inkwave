import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ProductCard from '@/components/storefront/ProductCard';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import HeroSection from '@/components/storefront/HeroSection';
import ShopByStyle from '@/components/storefront/ShopByStyle';
import InvertedPerspectiveCarousel from '@/components/storefront/InvertedPerspectiveCarousel';
import OffersSection from '@/components/storefront/OffersSection';
import Scroll3DEffect from '@/components/storefront/Scroll3DEffect';
import ReelsSection from '@/components/storefront/ReelsSection';
import CuratedFits from '@/components/storefront/CuratedFits';
import PremiumCategoriesBento from '@/components/storefront/PremiumCategoriesBento';
import NewsletterForm from '@/components/storefront/NewsletterForm';

export const revalidate = 60;

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch active categories, sort orders, and all CMS configs in parallel
  const [
    catRes, 
    sortOrderRes, 
    homepageConfigRes,
    newDropsConfigRes,
    bestsellersConfigRes,
    fitsConfigRes
  ] = await Promise.all([
    (supabase.from('categories') as any).select('*').eq('is_active', true),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'categories_sort_order').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'homepage_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'new_drops_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'bestsellers_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'curated_fits_config').single()
  ]);

  const rawCategoriesData = (catRes.data as any[]) || [];
  const sortOrderArray = (sortOrderRes.data?.json_content as any)?.order as string[] || [];
  const homepageConfig = (homepageConfigRes.data?.json_content as any) || {};
  const newDropsConfig = (newDropsConfigRes.data?.json_content as any) || {};
  const bestsellersConfig = (bestsellersConfigRes.data?.json_content as any) || {};
  const fitsData = (fitsConfigRes.data?.json_content as any) || {};

  const curatedFits = fitsData?.fits || null;
  const showFits = fitsData?.show ?? true;

  // Sort categories according to admin position settings
  const categoriesData = [...rawCategoriesData].sort((a: any, b: any) => {
    const indexA = sortOrderArray.indexOf(a.id);
    const indexB = sortOrderArray.indexOf(b.id);
    if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // 2. Fetch all products with category info and variants
  const { data: productsData } = await supabase
    .from('products')
    .select('*, categories(name, slug), product_variants(*)')
    .order('created_at', { ascending: false });

  const rawProducts = productsData || [];
  const products = await enrichProductsWithComparePrices(rawProducts);

  // 3. Group products by categories, filtering out categories with no products
  const categoriesList = categoriesData || [];
  const groupedCategories = categoriesList
    .map((cat: any) => {
      const catProducts = products.filter((p: any) => p.category_id === cat.id);
      return {
        ...cat,
        products: catProducts
      };
    })
    .filter((cat: any) => cat.products.length > 0);

  // 4. Compute New Drops for Immersive Carousel
  const newDropSlugs: string[] = newDropsConfig?.slugs || [];
  let newDropProducts: any[] = [];
  if (newDropSlugs.length > 0) {
    newDropProducts = newDropSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  }
  if (newDropProducts.length === 0) {
    newDropProducts = products.slice(0, 8);
  }

  // 5. Compute Bestsellers for Immersive Auto-Slider
  const bestsellerSlugs: string[] = bestsellersConfig?.slugs || [];
  let bestsellerProducts: any[] = [];
  if (bestsellerSlugs.length > 0) {
    bestsellerProducts = bestsellerSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  }
  if (bestsellerProducts.length === 0) {
    bestsellerProducts = products.filter((p) => p.is_bestseller).slice(0, 8);
    if (bestsellerProducts.length === 0) {
      bestsellerProducts = products.slice(0, 8);
    }
  }

  const rawMarquee = homepageConfig.marqueeItems || [];
  const marqueeItems = rawMarquee.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item);
  const giantMarqueeText = homepageConfig.giantMarqueeText || "INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //";
  const giantMarqueeLink = homepageConfig.giantMarqueeLink || "";
  const valueStrip = homepageConfig.valueStrip || [];
  const newsletterTitle = homepageConfig.newsletterTitle || "Get the next drop first";
  const newsletterDesc = homepageConfig.newsletterDesc || "First access to restocks and runs that don't last. No spam, just ink.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Inkwave",
    "url": "https://inkwavefashion.com",
    "logo": "https://inkwavefashion.com/logo.png",
    "image": "https://inkwavefashion.com/logo.png",
    "description": "Premium Gen-Z Streetwear & Custom Prints. Luxury underground limited-edition drops.",
    "telephone": "+91-8160321453",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "B/12 Sharmjivi Soc, Umra",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395007",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.instagram.com/inkwavefashion"
    ]
  };

  return (
    <StorefrontShell categories={categoriesData}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Local high-contrast black & white theme override */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root, html, body {
          --bg: #000000 !important;
          --bg-alt: #0a0a0a !important;
          --bg-card: #080808 !important;
          --text: #ffffff !important;
          --text-dim: #8c8c8c !important;
          --accent: #ffffff !important;
          --accent-text: #000000 !important;
          --line: #222222 !important;
          --border: #222222 !important;
          background-color: #000000 !important;
          color: #ffffff !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
        
        /* Enforce B&W panel borders & quick add styles */
        .glass-panel {
          background: rgba(0, 0, 0, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid #222222 !important;
        }

        .product-card-wrap {
          border-color: #222222 !important;
        }

        /* Pure black & white primary CTA elements */
        .btn-primary {
          background: #ffffff !important;
          color: #000000 !important;
        }
        
        .btn-primary:hover {
          background: #e5e5e5 !important;
        }

        .newsletter input {
          background: #0c0c0c !important;
          border-color: #222222 !important;
          color: #ffffff !important;
        }

        /* Clean Brutalist Immersive Action */
        .btn-immersive {
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #ffffff !important;
          font-family: var(--font-mono) !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          transition: all 0.25s ease !important;
          box-shadow: none !important;
        }
        .btn-immersive:hover {
          transform: translateY(-2px) !important;
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
        }
      `}} />

      <div className="flex flex-col w-full relative z-10 bg-black min-h-screen">
        
        {/* ══════════════════════════════════════════════════════════════════
            1. TOP HERO BANNER / CAROUSEL
        ══════════════════════════════════════════════════════════════════ */}
        {homepageConfig.carouselShow && homepageConfig.carouselSlides && homepageConfig.carouselSlides.length > 0 ? (
          <HeroCarousel 
            slides={homepageConfig.carouselSlides} 
            hideText={homepageConfig.carouselHideText} 
          />
        ) : (
          <HeroSection config={homepageConfig} />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            2. TOP TICKER MARQUEE
        ══════════════════════════════════════════════════════════════════ */}
        {marqueeItems.length > 0 && (
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
            3. NEW SHOP BY STYLE CURATED SECTION (Y2K, OVERSIZED, ACID WASH...)
        ══════════════════════════════════════════════════════════════════ */}
        <ShopByStyle products={products} />

        {/* ══════════════════════════════════════════════════════════════════
            4. DYNAMIC CATEGORY CATALOG GRID SECTIONS
        ══════════════════════════════════════════════════════════════════ */}
        {groupedCategories.map((cat: any, idx: number) => (
          <section key={cat.id} className="py-16 md:py-24 border-b border-[var(--line)] bg-black" id={cat.slug}>
            <div className="wrap">
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-10 pb-4 border-b border-[var(--line)]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-dim)] font-semibold">
                    Category // 0{idx + 1}
                  </span>
                  <h2 className="font-display text-2xl sm:text-4xl md:text-6xl font-black uppercase text-white mt-1.5 tracking-tight leading-none">
                    {cat.name}
                  </h2>
                </div>
                
                <Link 
                  href={`/category/${cat.slug}`}
                  className="font-mono text-[10px] uppercase tracking-widest text-white hover:text-[var(--text-dim)] transition-colors flex items-center gap-1.5 font-bold hover:underline"
                >
                  Explore {cat.name} <span className="text-[9px] font-sans">&rarr;</span>
                </Link>
              </div>

              {/* Product Grid - 4 Columns Full-Width */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
                {cat.products.map((product: any, productIdx: number) => (
                  <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                    <ProductCard product={product} index={productIdx} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ══════════════════════════════════════════════════════════════════
            5. IMMERSIVE STORE CONTINUATION: NEW DROPS INVERTED CAROUSEL
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section bg-black border-b border-[var(--line)]" id="immersive-store">
          <div className="wrap">
            <div className="sec-head reveal in">
              <div>
                <span className="sec-tag">Vol. 04 / New Arrivals</span>
                <h2>New Drops</h2>
              </div>
            </div>
            <div className="mt-12 w-full max-w-full overflow-hidden">
              <InvertedPerspectiveCarousel products={newDropProducts} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. SHOPPABLE REELS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <ReelsSection />

        {/* ══════════════════════════════════════════════════════════════════
            7. EXCLUSIVE OFFERS & DEALS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <Scroll3DEffect>
          <OffersSection />
        </Scroll3DEffect>

        {/* ══════════════════════════════════════════════════════════════════
            8. BESTSELLERS INFINITE AUTO-SLIDER
        ══════════════════════════════════════════════════════════════════ */}
        <Scroll3DEffect>
          <section className="section bg-black border-b border-[var(--line)]" id="bestsellers" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head reveal in">
                <div>
                  <span className="sec-tag">Held their shape</span>
                  <h2>Bestsellers</h2>
                </div>
              </div>
            </div>
            
            <div className="auto-slider-wrap reveal in mt-6">
              <div className="auto-slider-track">
                {[...bestsellerProducts, ...bestsellerProducts, ...bestsellerProducts].slice(0, 16).map((p, i) => (
                  <div key={`${p.id}-${i}`} style={{ width: '300px', flexShrink: 0 }}>
                    <ProductCard product={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Scroll3DEffect>

        {/* ══════════════════════════════════════════════════════════════════
            9. GIANT TYPOGRAPHY MARQUEE DIVIDER
        ══════════════════════════════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════════════════════════════
            10. SHOP BY CATEGORY — EXPANDING BENTO ACCORDION
        ══════════════════════════════════════════════════════════════════ */}
        <Scroll3DEffect>
          <PremiumCategoriesBento />
        </Scroll3DEffect>

        {/* ══════════════════════════════════════════════════════════════════
            11. CURATED FITS SECTION (SHOP THE LOOK)
        ══════════════════════════════════════════════════════════════════ */}
        {showFits && <CuratedFits fits={curatedFits} />}

        {/* ══════════════════════════════════════════════════════════════════
            12. BRAND VALUE STRIP
        ══════════════════════════════════════════════════════════════════ */}
        {valueStrip.length > 0 && (
          <Scroll3DEffect>
            <div className="value-strip border-t border-b border-[var(--line)] bg-black">
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

        {/* ══════════════════════════════════════════════════════════════════
            13. NEWSLETTER SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="newsletter border-t border-[var(--line)] bg-black">
          <div className="wrap reveal in">
            <h2>{newsletterTitle}</h2>
            <p>{newsletterDesc}</p>
            <NewsletterForm />
          </div>
        </section>

      </div>
    </StorefrontShell>
  );
}

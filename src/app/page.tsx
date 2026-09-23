import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/storefront/ProductCard';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import HeroSection from '@/components/storefront/HeroSection';
import ShopByStyle from '@/components/storefront/ShopByStyle';
import OffersSection from '@/components/storefront/OffersSection';
import Scroll3DEffect from '@/components/storefront/Scroll3DEffect';
import ReelsSection from '@/components/storefront/ReelsSection';
import CuratedFits from '@/components/storefront/CuratedFits';
import NewsletterForm from '@/components/storefront/NewsletterForm';
import { 
  ArrowRight, 
  ChevronRight, 
  Flame 
} from 'lucide-react';

export const revalidate = 60;

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

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

  const rawProducts = ((productsData as any[]) || []).filter(p => p && (p.title || p.name) && p.id);
  const products = await enrichProductsWithComparePrices(rawProducts);

  // 3. Compute Current Drop / Latest Drops (Dynamic from CMS)
  const showNewDrops = newDropsConfig?.show !== false;
  const newDropEyebrow = newDropsConfig?.eyebrow || "DROP 001 // LIMITED EDITION";
  const newDropTitle = newDropsConfig?.title || "THE LATEST DROP";
  const newDropSubtitle = newDropsConfig?.subtitle || "Engineered with 240 GSM heavy French Terry cotton. Limited batch runs.";
  const newDropViewAllText = newDropsConfig?.viewAllText || "View Full Drop";
  const newDropViewAllLink = newDropsConfig?.viewAllLink || "/collections";
  const newDropBottomBtnText = newDropsConfig?.bottomButtonText || "EXPLORE ALL NEW ARRIVALS";
  const newDropBottomBtnLink = newDropsConfig?.bottomButtonLink || "/collections";
  const newDropShowBottomBtn = newDropsConfig?.showBottomButton !== false;

  const rawDropItems = newDropsConfig?.items || [];
  const newDropSlugs: string[] = rawDropItems.length > 0
    ? rawDropItems.map((it: any) => typeof it === 'string' ? it : it.slug).filter(Boolean)
    : (newDropsConfig?.slugs || []);

  let newDropProducts: any[] = [];
  if (newDropsConfig?.mode !== 'auto' && newDropSlugs.length > 0) {
    newDropProducts = newDropSlugs.map((slug) => {
      const p = products.find((prod) => prod.slug === slug);
      if (!p) return null;
      const matchedItem = rawDropItems.find((it: any) => (typeof it === 'object' && it?.slug === slug));
      return matchedItem?.badge ? { ...p, custom_badge: matchedItem.badge } : p;
    }).filter(Boolean);
  }
  if (newDropProducts.length === 0) {
    newDropProducts = products.slice(0, 8);
  }

  // 4. Compute Bestsellers / Inkwave Picks (Dynamic from CMS)
  const showBestsellers = bestsellersConfig?.show !== false;
  const bestsellersEyebrow = bestsellersConfig?.eyebrow || "HELD THEIR SHAPE // COMMUNITY FAVORITES";
  const bestsellersTitle = bestsellersConfig?.title || "THE INKWAVE PICKS";
  const bestsellersSubtitle = bestsellersConfig?.subtitle || "The pieces getting the most attention right now.";
  const bestsellersViewAllText = bestsellersConfig?.viewAllText || "View Bestsellers";
  const bestsellersViewAllLink = bestsellersConfig?.viewAllLink || "/collections";

  const rawBestsellerItems = bestsellersConfig?.items || [];
  const bestsellerSlugs: string[] = rawBestsellerItems.length > 0
    ? rawBestsellerItems.map((it: any) => typeof it === 'string' ? it : it.slug).filter(Boolean)
    : (bestsellersConfig?.slugs || []);

  let bestsellerProducts: any[] = [];
  if (bestsellersConfig?.mode !== 'auto' && bestsellerSlugs.length > 0) {
    bestsellerProducts = bestsellerSlugs.map((slug) => {
      const p = products.find((prod) => prod.slug === slug);
      if (!p) return null;
      const matchedItem = rawBestsellerItems.find((it: any) => (typeof it === 'object' && it?.slug === slug));
      return matchedItem?.badge ? { ...p, custom_badge: matchedItem.badge } : p;
    }).filter(Boolean);
  }
  if (bestsellerProducts.length === 0) {
    const bests = products.filter((p) => p.is_bestseller);
    bestsellerProducts = bests.length > 0 ? bests.slice(0, 8) : products.slice(0, 8);
  }

  const rawMarquee = homepageConfig.marqueeItems || [];
  const marqueeItems = rawMarquee.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item);
  const giantMarqueeText = homepageConfig.giantMarqueeText || "INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //";
  const giantMarqueeLink = homepageConfig.giantMarqueeLink || "";
  const newsletterTitle = homepageConfig.newsletterTitle || "JOIN THE INKWAVE COMMUNITY";
  const newsletterDesc = homepageConfig.newsletterDesc || "First access to restocks, unreleased drops, and secret studio runs. No spam, just ink.";

  // High-value structured schemas for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://inkwavefashion.com/#website",
        "url": "https://inkwavefashion.com",
        "name": "Inkwave",
        "description": "Premium Gen-Z Streetwear & Custom Prints. Luxury underground limited-edition drops.",
        "publisher": {
          "@id": "https://inkwavefashion.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://inkwavefashion.com/collections?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "ClothingStore",
        "@id": "https://inkwavefashion.com/#organization",
        "name": "Inkwave",
        "url": "https://inkwavefashion.com",
        "logo": "https://inkwavefashion.com/logo.png",
        "image": "https://inkwavefashion.com/logo.png",
        "description": "Premium Gen-Z Streetwear & Custom Prints. Luxury underground limited-edition drops.",
        "telephone": "+91-8160321453",
        "priceRange": "₹₹",
        "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, NetBanking",
        "currenciesAccepted": "INR",
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
      },
      {
        "@type": "ItemList",
        "itemListElement": newDropProducts.slice(0, 8).map((p: any, idx: number) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": p.title,
          "url": `https://inkwavefashion.com/product/${p.slug}`
        }))
      }
    ]
  };

  return (
    <StorefrontShell categories={categoriesData}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* High-contrast dark streetwear styling */}
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
        
        .product-card-wrap {
          border-color: #222222 !important;
        }

        .btn-primary {
          background: #ffffff !important;
          color: #000000 !important;
        }
        
        .btn-primary:hover {
          background: #e5e5e5 !important;
        }

        .btn-immersive {
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #ffffff !important;
          font-family: var(--font-mono) !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          transition: all 0.25s ease !important;
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
            1. HERO SECTION (EDITORIAL BRAND HEADLINE & MEDIA)
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
            2. TICKER MARQUEE
        ══════════════════════════════════════════════════════════════════ */}
        {marqueeItems.length > 0 && (
          <div className="marquee-wrap border-y border-white/10 bg-black">
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
            3. CURRENT DROP / NEW ARRIVALS (LATEST DROPS - DYNAMIC CMS)
        ══════════════════════════════════════════════════════════════════ */}
        {showNewDrops && newDropProducts.length > 0 && (
          <section className="py-16 md:py-24 border-b border-white/10 bg-black" id="drop">
            <div className="wrap space-y-10">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[var(--accent)]" /> {newDropEyebrow}
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white mt-1 tracking-tight">
                    {newDropTitle}
                  </h2>
                  {newDropSubtitle && (
                    <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                      {newDropSubtitle}
                    </p>
                  )}
                </div>

                {newDropViewAllLink && (
                  <Link
                    href={newDropViewAllLink}
                    className="font-mono text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors flex items-center gap-1.5 font-bold hover:underline self-start md:self-auto"
                  >
                    <span>{newDropViewAllText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
                {newDropProducts.map((product: any, idx: number) => (
                  <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                    <ProductCard product={product} index={idx} />
                  </div>
                ))}
              </div>

              {/* Bottom Callout Button */}
              {newDropShowBottomBtn && newDropBottomBtnLink && (
                <div className="text-center pt-4">
                  <Link
                    href={newDropBottomBtnLink}
                    className="btn-immersive inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl"
                  >
                    <span>{newDropBottomBtnText}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            4. BESTSELLERS / THE INKWAVE PICKS (DYNAMIC CMS)
        ══════════════════════════════════════════════════════════════════ */}
        {showBestsellers && bestsellerProducts.length > 0 && (
          <section className="py-16 md:py-24 border-b border-white/10 bg-black" id="bestsellers">
            <div className="wrap space-y-10">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                    {bestsellersEyebrow}
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white mt-1 tracking-tight">
                    {bestsellersTitle}
                  </h2>
                  {bestsellersSubtitle && (
                    <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                      {bestsellersSubtitle}
                    </p>
                  )}
                </div>

                {bestsellersViewAllLink && (
                  <Link
                    href={bestsellersViewAllLink}
                    className="font-mono text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors flex items-center gap-1.5 font-bold hover:underline self-start md:self-auto"
                  >
                    <span>{bestsellersViewAllText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
                {bestsellerProducts.map((product: any, idx: number) => (
                  <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                    <ProductCard product={product} index={idx} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            5. SHOP BY STYLE (CURATED FITS & CATEGORIES)
        ══════════════════════════════════════════════════════════════════ */}
        <ShopByStyle products={products} />

        {/* ══════════════════════════════════════════════════════════════════
            6. INSTAGRAM / SOCIAL PROOF
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 border-b border-white/10 bg-black">
          <div className="wrap space-y-8 text-center">
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                TAG @INKWAVEFASHION
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-black uppercase text-white">
                THE INKWAVE TRIBE
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 4).map((p: any, idx: number) => (
                <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-neutral-900">
                  {p.images?.[0] && (
                    <Image
                      src={p.images[0]}
                      alt="Inkwave Community Fit"
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <a
                    href="https://instagram.com/inkwavefashion"
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-mono text-xs uppercase tracking-wider"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    <span>View Post</span>
                  </a>
                </div>
              ))}
            </div>

            <div>
              <a
                href="https://instagram.com/inkwavefashion"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/15 hover:border-white/40 text-xs font-mono uppercase tracking-wider font-bold text-white transition-all hover:bg-white/10"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow @inkwavefashion</span>
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            7. SHOPPABLE REELS SECTION (IF ENABLED)
        ══════════════════════════════════════════════════════════════════ */}
        <ReelsSection />

        {/* ══════════════════════════════════════════════════════════════════
            8. EXCLUSIVE OFFERS & DEALS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <Scroll3DEffect>
          <OffersSection />
        </Scroll3DEffect>

        {/* ══════════════════════════════════════════════════════════════════
            9. CURATED FITS SECTION (SHOP THE LOOK)
        ══════════════════════════════════════════════════════════════════ */}
        {showFits && <CuratedFits fits={curatedFits} />}

        {/* ══════════════════════════════════════════════════════════════════
            10. COMMUNITY NEWSLETTER SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <section className="newsletter border-t border-white/10 bg-black py-16 md:py-20">
          <div className="wrap text-center max-w-xl mx-auto space-y-4">
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              {newsletterTitle}
            </h2>
            <p className="text-xs sm:text-sm font-mono text-neutral-400">
              {newsletterDesc}
            </p>
            <div className="pt-2 max-w-md mx-auto">
              <NewsletterForm />
            </div>
          </div>
        </section>

      </div>
    </StorefrontShell>
  );
}

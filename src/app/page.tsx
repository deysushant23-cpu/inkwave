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
import PremiumCategoriesBento from '@/components/storefront/PremiumCategoriesBento';
import NewsletterForm from '@/components/storefront/NewsletterForm';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Flame, 
  Layers, 
  Wand2, 
  Star,
  Quote
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

  // 1. Fetch active categories, sort orders, reviews, and all CMS configs in parallel
  const [
    catRes, 
    sortOrderRes, 
    homepageConfigRes,
    newDropsConfigRes,
    bestsellersConfigRes,
    fitsConfigRes,
    reviewsRes
  ] = await Promise.all([
    (supabase.from('categories') as any).select('*').eq('is_active', true),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'categories_sort_order').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'homepage_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'new_drops_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'bestsellers_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'curated_fits_config').single(),
    (supabase.from('product_reviews') as any)
      .select('id, rating, comment_text, created_at, profiles(full_name, avatar_url), products(title, slug)')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const rawCategoriesData = (catRes.data as any[]) || [];
  const sortOrderArray = (sortOrderRes.data?.json_content as any)?.order as string[] || [];
  const homepageConfig = (homepageConfigRes.data?.json_content as any) || {};
  const newDropsConfig = (newDropsConfigRes.data?.json_content as any) || {};
  const bestsellersConfig = (bestsellersConfigRes.data?.json_content as any) || {};
  const fitsData = (fitsConfigRes.data?.json_content as any) || {};
  const approvedReviews = (reviewsRes.data as any[]) || [];

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

  // 3. Compute Current Drop (4-6 products)
  const newDropSlugs: string[] = newDropsConfig?.slugs || [];
  let newDropProducts: any[] = [];
  if (newDropSlugs.length > 0) {
    newDropProducts = newDropSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  }
  if (newDropProducts.length === 0) {
    newDropProducts = products.slice(0, 6);
  } else {
    newDropProducts = newDropProducts.slice(0, 6);
  }

  // 4. Compute Bestsellers (4 products)
  const bestsellerSlugs: string[] = bestsellersConfig?.slugs || [];
  let bestsellerProducts: any[] = [];
  if (bestsellerSlugs.length > 0) {
    bestsellerProducts = bestsellerSlugs.map((slug) => products.find((p) => p.slug === slug)).filter(Boolean);
  }
  if (bestsellerProducts.length === 0) {
    bestsellerProducts = products.filter((p) => p.is_bestseller).slice(0, 4);
    if (bestsellerProducts.length === 0) {
      bestsellerProducts = products.slice(0, 4);
    }
  } else {
    bestsellerProducts = bestsellerProducts.slice(0, 4);
  }

  const rawMarquee = homepageConfig.marqueeItems || [];
  const marqueeItems = rawMarquee.map((item: any) => typeof item === 'string' ? { text: item, link: '' } : item);
  const giantMarqueeText = homepageConfig.giantMarqueeText || "INKWAVE // VOL 04 // NO TWO VATS RUN IDENTICAL //";
  const giantMarqueeLink = homepageConfig.giantMarqueeLink || "";
  const newsletterTitle = homepageConfig.newsletterTitle || "JOIN THE INKWAVE COMMUNITY";
  const newsletterDesc = homepageConfig.newsletterDesc || "First access to restocks, unreleased drops, and secret studio runs. No spam, just ink.";

  // High-impact lookbook visual items using real products
  const lookbookItems = products.slice(0, 3);

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
            3. CURRENT DROP / NEW ARRIVALS (DROP 001)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 border-b border-white/10 bg-black" id="drop">
          <div className="wrap space-y-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[var(--accent)]" /> DROP 001 // LIMITED EDITION
                </span>
                <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white mt-1 tracking-tight">
                  THE LATEST DROP
                </h2>
                <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                  Engineered with 240 GSM heavy French Terry cotton. Limited batch runs.
                </p>
              </div>

              <Link
                href="/collections"
                className="font-mono text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors flex items-center gap-1.5 font-bold hover:underline self-start md:self-auto"
              >
                <span>View Full Drop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Product Grid - 4 Columns */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
              {newDropProducts.slice(0, 4).map((product: any, idx: number) => (
                <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                  <ProductCard product={product} index={idx} />
                </div>
              ))}
            </div>

            {/* Bottom Callout */}
            <div className="text-center pt-4">
              <Link
                href="/collections"
                className="btn-immersive inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl"
              >
                <span>EXPLORE ALL NEW ARRIVALS</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. BESTSELLERS (THE INKWAVE PICKS)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 border-b border-white/10 bg-black" id="bestsellers">
          <div className="wrap space-y-10">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                  HELD THEIR SHAPE // COMMUNITY FAVORITES
                </span>
                <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white mt-1 tracking-tight">
                  THE INKWAVE PICKS
                </h2>
                <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1">
                  The pieces getting the most attention right now.
                </p>
              </div>

              <Link
                href="/collections"
                className="font-mono text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors flex items-center gap-1.5 font-bold hover:underline self-start md:self-auto"
              >
                <span>View Bestsellers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* 4-Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start w-full">
              {bestsellerProducts.map((product: any, idx: number) => (
                <div key={product.id} className="product-card-wrap w-full min-w-0 flex flex-col">
                  <ProductCard product={product} index={idx} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. EDITORIAL BRAND STATEMENT (BRUTALIST MANIFESTO)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 border-b border-white/10 bg-neutral-950 text-white relative overflow-hidden">
          <div className="wrap relative z-10 text-center max-w-4xl mx-auto space-y-6">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 font-bold block">
              INKWAVE MANIFESTO // SURAT FACTORY
            </span>
            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase font-black tracking-tight leading-none text-white">
              NOT MADE TO BLEND IN.
            </h2>
            <p className="font-mono text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto">
              INKWAVE exists for people who see clothing as more than something you wear. Original graphics, bold silhouettes, and 240 GSM heavyweights designed to make a statement.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/custom-print"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Wand2 className="w-4 h-4 text-black" />
                <span>3D Custom Studio • ₹600</span>
              </Link>
              <Link
                href="/collections"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2"
              >
                <span>Browse All Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. SHOP BY STYLE (CURATED FITS & CATEGORIES)
        ══════════════════════════════════════════════════════════════════ */}
        <ShopByStyle products={products} />

        {/* ══════════════════════════════════════════════════════════════════
            7. EDITORIAL LOOKBOOK / CAMPAIGN GALLERY
        ══════════════════════════════════════════════════════════════════ */}
        {lookbookItems.length >= 2 && (
          <section className="py-16 md:py-24 border-b border-white/10 bg-black">
            <div className="wrap space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                    VOL. 04 // EDITORIAL CAMPAIGN
                  </span>
                  <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase text-white mt-1 tracking-tight">
                    STREETWEAR LOOKBOOK
                  </h2>
                </div>
                <Link 
                  href="/collections" 
                  className="font-mono text-xs uppercase tracking-widest text-white hover:text-neutral-400 transition-colors flex items-center gap-1.5 font-bold hover:underline"
                >
                  <span>Shop Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Asymmetric Campaign Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Large Featured Card (7 cols) */}
                {lookbookItems[0] && (
                  <div className="md:col-span-7 relative group rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 min-h-[420px] md:min-h-[520px] flex flex-col justify-end p-6 sm:p-8">
                    {lookbookItems[0].images?.[0] && (
                      <Image
                        src={lookbookItems[0].images[0]}
                        alt={lookbookItems[0].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                        Editorial Feature // 01
                      </span>
                      <h3 className="font-display text-2xl sm:text-4xl font-black uppercase text-white">
                        {lookbookItems[0].title}
                      </h3>
                      <p className="font-mono text-xs text-neutral-300">
                        Boxy drop-shoulder 240 GSM heavy French Terry cotton.
                      </p>
                      <div className="pt-2">
                        <Link
                          href={`/product/${lookbookItems[0].slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-lg"
                        >
                          <span>Shop Piece</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2 Stacked Cards (5 cols) */}
                <div className="md:col-span-5 grid grid-cols-1 gap-6">
                  {lookbookItems.slice(1, 3).map((item: any, i: number) => (
                    <div 
                      key={item.id}
                      className="relative group rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 min-h-[240px] flex flex-col justify-end p-5 sm:p-6"
                    >
                      {item.images?.[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      <div className="relative z-10 space-y-1">
                        <h4 className="font-display text-lg sm:text-xl font-bold uppercase text-white truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-xs font-bold text-neutral-300">
                            ₹{item.base_price}
                          </span>
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-mono text-[10px] font-bold uppercase tracking-wider text-white hover:underline flex items-center gap-1"
                          >
                            <span>Explore</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            8. WHY INKWAVE (CRAFTSMANSHIP & TRUST)
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 border-b border-white/10 bg-black">
          <div className="wrap space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                BUILT DIFFERENT // NO SHORTCUTS
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
                WHY INKWAVE
              </h2>
              <p className="text-xs sm:text-sm font-mono text-neutral-400">
                Crafted in our Surat workshop with obsession over fabric density, print longevity, and silhouette drape.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg uppercase font-bold text-white">Original Artwork</h4>
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                  Bespoke typography, cyberpunk motifs, and high-density screen prints designed in-house.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg uppercase font-bold text-white">240 GSM French Terry</h4>
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                  100% Super-combed heavyweight cotton with dense knit loops that hold the signature drop-shoulder drape.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg uppercase font-bold text-white">Pre-Shrunk & Mercerized</h4>
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                  Anti-fade luxury wash treatments ensure zero shrinkage and long-lasting fabric luster.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-display text-lg uppercase font-bold text-white">Free Express Shipping</h4>
                <p className="font-mono text-xs text-neutral-400 leading-relaxed">
                  Dispatched directly from Surat with 100% free size exchanges and live SMS/WhatsApp tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            9. CUSTOMER REVIEWS / COMMUNITY PROOF
        ══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 border-b border-white/10 bg-neutral-950">
          <div className="wrap space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-bold">
                  COMMUNITY REVIEWS // VERIFIED WEARERS
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mt-1 tracking-tight">
                  TRIBE FEEDBACK
                </h2>
              </div>
            </div>

            {approvedReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedReviews.map((rev: any) => (
                  <div key={rev.id} className="p-6 rounded-2xl bg-black border border-white/10 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="font-mono text-xs text-neutral-300 leading-relaxed">
                        &ldquo;{rev.comment_text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] font-mono text-neutral-400">
                      <span className="font-bold text-white">
                        {rev.profiles?.full_name || 'Verified Customer'}
                      </span>
                      {rev.products?.title && (
                        <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                          {rev.products.title}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl border border-white/10 bg-black/50 max-w-xl mx-auto space-y-3">
                <Quote className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="font-display text-xl uppercase font-bold text-white">
                  Join the Vanguard
                </h4>
                <p className="text-xs font-mono text-neutral-400">
                  Every Inkwave piece is crafted in limited batches. Order your fit and share your review on the product page.
                </p>
                <div className="pt-2">
                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all"
                  >
                    <span>Shop Latest Drops</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            10. INSTAGRAM / SOCIAL PROOF
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
            11. SHOPPABLE REELS SECTION (IF ENABLED)
        ══════════════════════════════════════════════════════════════════ */}
        <ReelsSection />

        {/* ══════════════════════════════════════════════════════════════════
            12. EXCLUSIVE OFFERS & DEALS SECTION
        ══════════════════════════════════════════════════════════════════ */}
        <Scroll3DEffect>
          <OffersSection />
        </Scroll3DEffect>

        {/* ══════════════════════════════════════════════════════════════════
            13. CURATED FITS SECTION (SHOP THE LOOK)
        ══════════════════════════════════════════════════════════════════ */}
        {showFits && <CuratedFits fits={curatedFits} />}

        {/* ══════════════════════════════════════════════════════════════════
            14. COMMUNITY NEWSLETTER SECTION
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

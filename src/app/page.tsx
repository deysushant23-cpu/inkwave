import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import ProductCard from '@/components/storefront/ProductCard';
import StorefrontShell from '@/components/storefront/StorefrontShell';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import HeroSection from '@/components/storefront/HeroSection';
import { PageReveal, StaggerContainer, StaggerItem } from '@/components/storefront/PageReveal';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch active categories, custom sort order, and homepage config from CMS configs
  const [catRes, sortOrderRes, homepageConfigRes] = await Promise.all([
    (supabase.from('categories') as any).select('*').eq('is_active', true),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'categories_sort_order').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'homepage_config').single()
  ]);

  const rawCategoriesData = (catRes.data as any[]) || [];
  const sortOrderArray = (sortOrderRes.data?.json_content as any)?.order as string[] || [];
  const homepageConfig = (homepageConfigRes.data?.json_content as any) || {};

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
    <StorefrontShell>
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
          border-radius: 0px !important;
        }

        .product-card-wrap {
          border-color: #222222 !important;
        }

        /* Pure black & white primary CTA elements */
        .btn-primary {
          background: #ffffff !important;
          color: #000000 !important;
          border-radius: 0px !important;
        }
        
        .btn-primary:hover {
          background: #e5e5e5 !important;
        }

        .newsletter input {
          background: #0c0c0c !important;
          border-color: #222222 !important;
          color: #ffffff !important;
          border-radius: 0px !important;
        }

        /* Clean Brutalist Immersive Action */
        .btn-immersive {
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px solid #ffffff !important;
          border-radius: 0px !important;
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
        
        {/* Top Hero Carousel or Cinematic Static Hero Section */}
        {homepageConfig.carouselShow && homepageConfig.carouselSlides && homepageConfig.carouselSlides.length > 0 ? (
          <HeroCarousel 
            slides={homepageConfig.carouselSlides} 
            hideText={homepageConfig.carouselHideText} 
          />
        ) : (
          <HeroSection config={homepageConfig} />
        )}



        {/* Dynamic Category Catalog Grid Sections */}
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

        {/* Fallback Empty State */}
        {groupedCategories.length === 0 && (
          <div className="wrap py-24 text-center bg-black">
            <div className="text-6xl mb-6">🏷️</div>
            <h2 className="font-display text-2xl sm:text-3xl uppercase font-black text-white mb-2">
              No Collections Published
            </h2>
            <p className="text-[var(--text-dim)] text-xs sm:text-sm font-mono max-w-sm mx-auto">
              Fresh drops are currently curing in our studio. Join our email list to get drop notifications.
            </p>
          </div>
        )}

        {/* Sleek Bottom Immersive Store Redirect Row */}
        {groupedCategories.length > 0 && (
          <div className="border-t border-[var(--line)] py-16 bg-black text-center">
            <div className="wrap">
              <Link 
                href="/collections" 
                className="btn-immersive inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black font-bold uppercase tracking-widest transition-all hover:bg-black hover:text-white border border-white text-xs"
              >
                <span>Explore Immersive Store</span>
                <span className="font-sans text-[10px]">&rarr;</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </StorefrontShell>
  );
}

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductOverview from '@/components/storefront/ProductOverview';

import { getProductReviewsAction } from '@/app/actions/reviews';
import ProductReviews from '@/components/storefront/ProductReviews';
import ProductCard from '@/components/storefront/ProductCard';
import { enrichProductsWithComparePrices, enrichVariantsWithComparePrices } from '@/lib/catalogPrices';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('id, title, description, images').eq('slug', slug).single();

  if (!product) {
    return { title: 'Product Not Found | Inkwave' };
  }

  const p = product as any;
  const imageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : 'https://inkwave.com/logo.png';

  // 1. Fetch custom SEO metadata if configured by admin in cms_sections
  let seoTitle = `${p.title} | Inkwave Streetwear`;
  let seoDescription = p.description || `Shop the ${p.title} at Inkwave.`;
  let keywords: string[] | undefined = undefined;

  try {
    const { data: seoSection } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', `product_seo_${p.id}`)
      .single();

    if (seoSection?.json_content) {
      const j = seoSection.json_content as any;
      if (j.title?.trim()) seoTitle = j.title.trim();
      if (j.description?.trim()) seoDescription = j.description.trim();
      if (j.keywords?.trim()) {
        keywords = j.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      }
    }
  } catch (err) {
    // Fail silently - default to standard product details
  }

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch primary product
  const { data: rawProduct, error } = await supabase
    .from('products')
    .select('*, categories(name, slug), images')
    .eq('slug', slug)
    .single();

  const productBase = rawProduct as any;

  if (error || !productBase) {
    notFound();
  }

  // 2. Fetch variants, reviews, and recommended in parallel for high performance
  const [rawVariantsResult, reviewsResult, rawRecommendedResult] = await Promise.all([
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productBase.id),
    getProductReviewsAction(productBase.id),
    supabase
      .from('products')
      .select('*, product_variants(price_override, size)')
      .neq('id', productBase.id)
      .limit(4)
  ]);

  const rawVariants = rawVariantsResult.data || [];
  const reviews = reviewsResult.reviews || [];
  const rawRecommended = rawRecommendedResult.data || [];

  // Enrich prices in parallel
  const [enrichedProductList, variants, recommendedProducts] = await Promise.all([
    enrichProductsWithComparePrices([productBase]),
    enrichVariantsWithComparePrices(rawVariants),
    enrichProductsWithComparePrices(rawRecommended)
  ]);

  const product = enrichedProductList[0];
  const categoryName = (product.categories as any)?.name || '';

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images || [],
    "description": product.description || product.title,
    "sku": product.id,
    "offers": {
      "@type": "AggregateOffer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || 'https://inkwave.com'}/product/${product.slug}`,
      "priceCurrency": "INR",
      "lowPrice": product.price,
      "highPrice": product.price,
      "offerCount": variants.length || 1,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviews.length
    } : undefined
  };

  return (
    <main className="pt-28 sm:pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductOverview 
        product={product} 
        variants={variants} 
        categoryName={categoryName} 
        averageRating={averageRating} 
        reviewCount={reviews.length} 
      />



      {/* ══ YOU MAY ALSO LIKE ═════════════════════════════════════════ */}
      {recommendedProducts.length > 0 && (
        <section className="wrap pb-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-[var(--text)]">You May Also Like</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((p: any, i: number) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ══ REVIEWS ═════════════════════════════════════════════════════ */}
      <section className="wrap pb-24">
        <ProductReviews productId={product.id} initialReviews={reviews} />
      </section>
    </main>
  );
}

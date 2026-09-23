import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inkwavefashion.com';

  // Static site pages
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/collections', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/custom-print', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/showcase', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/wishlist', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/cart', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/brand-pillars', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/pages/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/pages/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/pages/size-guide', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/pages/track-order', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/pages/privacy-policy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/pages/terms-conditions', priority: 0.5, changeFrequency: 'yearly' as const },
  ].map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch all database products dynamically
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at')
      .order('created_at', { ascending: false });

    // Fetch all database categories dynamically
    const { data: categories } = await supabase
      .from('categories')
      .select('slug');

    const productRoutes = ((products || []) as any[]).map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const categoryRoutes = ((categories || []) as any[]).map((c) => ({
      url: `${baseUrl}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    return staticRoutes;
  }
}

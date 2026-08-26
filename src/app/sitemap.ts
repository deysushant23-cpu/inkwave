import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inkwavefashion.com';

  // Static site pages
  const staticRoutes = [
    '',
    '/wishlist',
    '/cart',
    '/showcase',
    '/custom-print',
    '/pages/about',
    '/pages/contact',
    '/pages/size-guide',
    '/pages/track-order',
    '/pages/privacy-policy',
    '/pages/terms-conditions',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const supabase = await createClient();

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

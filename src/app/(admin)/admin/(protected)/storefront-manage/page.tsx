import { createAdminClient } from '@/lib/supabase/server';
import StorefrontManageClient from './StorefrontManageClient';

export const dynamic = 'force-dynamic';

export default async function StorefrontManageDashboard() {
  const supabase = await createAdminClient();

  const [prodRes, catRes, cmsRes] = await Promise.all([
    (supabase.from('products') as any).select('id, title, slug, base_price, images, overlay_mask_url, categories(name, slug)').order('title'),
    (supabase.from('categories') as any).select('id, name, slug').order('name'),
    (supabase.from('cms_sections') as any).select('*')
  ]);

  const products = (prodRes.data as any[]) || [];
  const categories = (catRes.data as any[]) || [];
  const sections = (cmsRes.data as any[]) || [];

  return (
    <StorefrontManageClient 
      initialProducts={products} 
      initialCategories={categories} 
      initialSections={sections} 
    />
  );
}

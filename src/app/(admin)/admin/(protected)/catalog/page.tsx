import { createAdminClient } from '@/lib/supabase/server';
import CatalogClient from './CatalogClient';
import { enrichProductsWithComparePrices } from '@/lib/catalogPrices';

export const dynamic = 'force-dynamic';

export default async function AdminCatalog() {
  const supabase = await createAdminClient();

  const [prodRes, catRes] = await Promise.all([
    (supabase.from('products') as any).select('*, categories(*), product_variants(*)').order('created_at', { ascending: false }),
    (supabase.from('categories') as any).select('*').order('name')
  ]);

  const rawProducts = (prodRes.data as any[]) || [];
  const products = await enrichProductsWithComparePrices(rawProducts);
  const categories = (catRes.data as any[]) || [];

  return <CatalogClient initialProducts={products} initialCategories={categories} />;
}

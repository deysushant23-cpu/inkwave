import { createAdminClient } from '@/lib/supabase/server';
import InventoryClient from './InventoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminInventory() {
  const supabase = await createAdminClient();

  const { data } = await (supabase.from('product_variants') as any)
    .select('*, products(title, slug)')
    .order('stock_quantity', { ascending: true });

  const variants = (data as any[]) || [];

  return <InventoryClient initialVariants={variants} />;
}

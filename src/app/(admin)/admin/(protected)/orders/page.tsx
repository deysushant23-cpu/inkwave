import { createAdminClient } from '@/lib/supabase/server';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrders() {
  const supabase = await createAdminClient();

  const [ordersRes, billsRes] = await Promise.all([
    (supabase.from('orders') as any).select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'admin_bills').single()
  ]);

  const orders = (ordersRes.data as any[]) || [];
  const bills = (billsRes.data?.json_content as any)?.bills || [];

  return <OrdersClient initialOrders={orders} initialBills={bills} />;
}

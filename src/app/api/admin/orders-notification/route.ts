import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();

    // 1. Fetch count of pending new orders (ORDER_PLACED)
    const { count: placedCount, error: countError } = await (supabase.from('orders') as any)
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'ORDER_PLACED');

    // 2. Fetch the latest 5 orders for real-time notification feed
    const { data: latestOrders, error: latestError } = await (supabase.from('orders') as any)
      .select('id, total_amount, order_status, created_at, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (countError || latestError) {
      console.error('Error fetching order notifications:', countError || latestError);
    }

    return NextResponse.json({
      success: true,
      newOrdersCount: placedCount || 0,
      latestOrders: latestOrders || [],
      latestOrderId: latestOrders?.[0]?.id || null,
      latestOrderTime: latestOrders?.[0]?.created_at || null
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

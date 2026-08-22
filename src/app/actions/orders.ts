'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { cancelOrderSchema } from '@/lib/validations/orders.schema';

export async function cancelOrder(orderId: string) {
  try {
    const parseResult = cancelOrderSchema.safeParse({ orderId });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid order ID' };
    }
    const validOrderId = parseResult.data.orderId;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const profileId = user.id;

    // Verify order belongs to user and is eligible for cancellation
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_status')
      .eq('id', validOrderId)
      .eq('user_id', profileId)
      .single();

    const order = orderData as any;

    if (fetchError || !order) {
      return { success: false, error: 'Order not found' };
    }

    if (['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'].includes(order.order_status)) {
      return { success: false, error: 'Order cannot be cancelled at this stage' };
    }

    // Perform cancellation using the new RPC which also restores inventory
    const { error: rpcError } = await (supabase.rpc as any)('cancel_order', {
      p_order_id: validOrderId,
      p_user_id: profileId
    });

    if (rpcError) {
      console.error('Cancel order RPC error:', rpcError);
      return { success: false, error: rpcError.message || 'Failed to cancel order' };
    }

    revalidatePath('/dashboard/orders');
    revalidatePath(`/dashboard/orders/${validOrderId}`);
    
    return { success: true };
  } catch (error) {
    console.error('Cancel order error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    
    // 1. Fetch current order to check if it's already delivered
    const { data: existingOrder } = await (supabase.from('orders') as any)
      .select('order_status, shipping_address')
      .eq('id', orderId)
      .single();

    const { error } = await (supabase.from('orders') as any)
      .update({ order_status: newStatus })
      .eq('id', orderId);
      
    if (error) {
      console.error('Update Order Error:', error);
      return { success: false, error: 'Failed to update order status' };
    }
    
    // 2. Grant referral points if newly delivered
    if (newStatus === 'DELIVERED' && existingOrder?.order_status !== 'DELIVERED') {
      const referredBy = existingOrder?.shipping_address?.referred_by;
      if (referredBy) {
        // Safe update with a small window race condition, acceptable for scale
        const { data: refUser } = await (supabase.from('profiles') as any)
          .select('loyalty_points')
          .eq('id', referredBy)
          .single();
          
        if (refUser) {
          await (supabase.from('profiles') as any)
            .update({ loyalty_points: (refUser.loyalty_points || 0) + 500 })
            .eq('id', referredBy);
        }
      }
    }

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' };
  }
}

export async function adjustInventoryAction(variantId: string, newStock: number) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    
    let adminProfileId: string | null = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        adminProfileId = user.id;
      }
    } catch {
      // Authenticated via master password
    }

    let { error } = await (supabase.rpc as any)('adjust_inventory', {
      p_variant_id: variantId,
      p_admin_id: adminProfileId,
      p_new_stock: newStock,
      p_reason: 'Manual adjustment via Admin Panel'
    });
      
    // Resilient fallback to direct table update if RPC does not exist in DB
    if (error) {
      const directUpdate = await (supabase.from('product_variants') as any)
        .update({ stock_quantity: newStock })
        .eq('id', variantId);
      error = directUpdate.error;
    }

    if (error) {
      console.error('Update Inventory Error:', error);
      return { success: false, error: error.message || 'Failed to adjust inventory' };
    }
    
    revalidatePath('/admin/inventory');
    revalidatePath('/admin/catalog');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unauthorized' };
  }
}

export async function fetchAdminOrdersAndBillsAction() {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    const [ordersRes, billsRes] = await Promise.all([
      (supabase.from('orders') as any).select('*, profiles(full_name, email)').order('created_at', { ascending: false }),
      (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'admin_bills').single()
    ]);
    return {
      success: true,
      orders: ordersRes.data || [],
      bills: billsRes.data?.json_content?.bills || []
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized', orders: [], bills: [] };
  }
}

export async function saveProductSeoAction(productId: string, seoPayload: { title: string; description: string; keywords: string }) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    
    const { data: existing } = await (supabase.from('cms_sections') as any)
      .select('id')
      .eq('section_key', `product_seo_${productId}`)
      .single();

    if (existing) {
      const { error: updateErr } = await (supabase.from('cms_sections') as any)
        .update({ json_content: seoPayload })
        .eq('id', existing.id);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await (supabase.from('cms_sections') as any)
        .insert([{
          section_key: `product_seo_${productId}`,
          json_content: seoPayload,
          is_published: true
        }]);
      if (insertErr) throw insertErr;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getProductSeoAction(productId: string) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    const { data: seoData } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', `product_seo_${productId}`)
      .single();
    return { success: true, seo: seoData?.json_content || null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized', seo: null };
  }
}

export async function getAdminOrderItemsAction(orderId: string) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    const { data, error } = await (supabase.from('order_items') as any)
      .select('*, product_variants(color, size, products(title))')
      .eq('order_id', orderId);
    if (error) throw error;
    return { success: true, items: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized', items: [] };
  }
}

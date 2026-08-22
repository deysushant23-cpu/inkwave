'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';


export interface TrackOrderResult {
  success: boolean;
  error?: string;
  order?: {
    id: string;
    shortId: string;
    created_at: string;
    order_status: string;
    payment_intent_id: string;
    total_amount: number;
    discount_amount: number;
    shipping_address: {
      name?: string;
      address?: string;
      custom_prints?: any[];
      [key: string]: any;
    };
    items: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      size: string;
      color?: string;
      title: string;
      image: string;
      variant_id?: string;
    }>;
  };
}

export async function lookupOrder(identifier: string): Promise<TrackOrderResult> {
  try {
    if (!identifier || typeof identifier !== 'string') {
      return { success: false, error: 'Please enter a valid Order ID, Email, or Phone number.' };
    }

    const cleanInput = identifier.trim().replace(/^#/, '');

    if (!cleanInput) {
      return { success: false, error: 'Please enter an Order ID or Email to track.' };
    }

    const supabase = await createAdminClient();

    // STRICT LOOKUP: Only allow fetching by exact UUID format.
    // We use the admin client because guest users need to track orders without being logged in,
    // but we MUST ensure the identifier is an unguessable UUID.
    if (cleanInput.length !== 36 || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(cleanInput)) {
       return { success: false, error: 'Please enter a valid, full Order ID (e.g., 123e4567-e89b-12d3-a456-426614174000) to track.' };
    }

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', cleanInput);

    let matchingOrders: any[] = data || [];

    if (fetchError || !matchingOrders || matchingOrders.length === 0) {
      return {
        success: false,
        error: `No order found for "${identifier}". Please verify your Order ID (e.g. #E9B28A1C) or check your order confirmation email.`
      };
    }

    const order = matchingOrders[0];

    // Fetch order items with variants and products
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        unit_price,
        variant_id,
        product_variants (
          size,
          color,
          products (
            title,
            images
          )
        )
      `)
      .eq('order_id', order.id);

    if (itemsError) {
      console.error('Error fetching order items for tracking:', itemsError);
    }

    const formattedItems = (orderItems || []).map((item: any) => {
      const variant = item.product_variants;
      const product = variant?.products;
      const title = product?.title || 'Inkwave Custom Apparel';
      const size = variant?.size || 'Standard';
      const color = variant?.color;
      const images = Array.isArray(product?.images) ? product.images : [];
      const image = images[0] || '/logo.png';

      return {
        id: item.id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price) || 0,
        size,
        color,
        title,
        image,
        variant_id: item.variant_id
      };
    });

    return {
      success: true,
      order: {
        id: order.id,
        shortId: order.id.substring(0, 8).toUpperCase(),
        created_at: order.created_at,
        order_status: order.order_status || 'ORDER_PLACED',
        payment_intent_id: order.payment_intent_id || 'COD',
        total_amount: Number(order.total_amount) || 0,
        discount_amount: Number(order.discount_amount) || 0,
        shipping_address: typeof order.shipping_address === 'object' ? order.shipping_address : {},
        items: formattedItems
      }
    };
  } catch (err: any) {
    console.error('Track order lookup exception:', err);
    return {
      success: false,
      error: 'Unable to track order right now. Please try again or contact support.'
    };
  }
}

export async function getUserRecentOrders() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: orders } = await supabase
      .from('orders')
      .select('id, created_at, order_status, total_amount')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    return (orders || []).map((o: any) => ({
      id: o.id,
      shortId: o.id.substring(0, 8).toUpperCase(),
      created_at: o.created_at,
      order_status: o.order_status,
      total_amount: o.total_amount
    }));
  } catch {
    return [];
  }
}

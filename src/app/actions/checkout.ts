'use server';

import { createClient } from '@/lib/supabase/server';
import { EmailService } from '@/lib/email';
import { cookies } from 'next/headers';
import { checkoutSchema } from '@/lib/validations/checkout.schema';

export async function processCheckoutAction(rawParams: any) {
  try {
    const parseResult = checkoutSchema.safeParse(rawParams);
    
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Invalid checkout data. Please check your phone number and address.';
      console.error('Checkout Validation Error:', parseResult.error.flatten());
      return { success: false, error: errorMsg };
    }
    
    const params = parseResult.data;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== params.userId) {
      return { success: false, error: 'Unauthorized checkout attempt.' };
    }

    // 1. Sync Profile Name, Phone & Address
    const { data: dbProfileData } = await supabase
      .from('profiles')
      .select('id, fit_preferences')
      .eq('id', user.id)
      .single();

    const dbProfile = dbProfileData as any;

    if (!dbProfile?.id) {
      return { success: false, error: 'Profile not found. Please log in again.' };
    }

    // Build structured full address string
    const fullAddress = `${params.address_line1}, ${params.landmark ? params.landmark + ', ' : ''}${params.city}, ${params.state} - ${params.pincode}`;

    const updatedPreferences = {
      ...(dbProfile.fit_preferences || {}),
      phone: params.phone,
      pincode: params.pincode,
      address_line1: params.address_line1,
      landmark: params.landmark || '',
      city: params.city,
      state: params.state,
      address: fullAddress
    };

    await (supabase.from('profiles') as any)
      .update({ 
        full_name: params.name,
        fit_preferences: updatedPreferences
      })
      .eq('id', dbProfile.id);

    // 2. Format custom prints & order items
    const customPrints = params.items
      .filter(item => item.custom_print_metadata)
      .map(item => ({
        id: item.id,
        title: item.title,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        metadata: item.custom_print_metadata
      }));

    const formattedItems = params.items.map(item => ({
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: item.price
    }));

    // Check for referral
    const cookieStore = await cookies();
    const refCookie = cookieStore.get('inkwave_ref');
    let discountAmount = 0;
    
    if (refCookie?.value && refCookie.value !== user.id) {
      discountAmount = params.total * 0.10; // 10% discount
    }

    // Comprehensive real dispatch shipping address payload
    const shippingAddress = { 
      name: params.name,
      phone: params.phone,
      email: params.email || null,
      pincode: params.pincode,
      address_line1: params.address_line1,
      landmark: params.landmark || '',
      city: params.city,
      state: params.state,
      address: fullAddress,
      custom_prints: customPrints,
      referred_by: refCookie?.value || null
    };

    const paymentIntent = params.paymentMethod === 'razorpay' ? `RAZORPAY:${params.razorpay_payment_id}` : 'COD';
    const finalTotal = Math.max(0, params.total - discountAmount);

    // 3. Call the RPC to place the order atomically
    const { data: orderId, error: rpcError } = await (supabase.rpc as any)('place_order', {
      p_user_id: dbProfile.id,
      p_total_amount: finalTotal,
      p_discount_amount: discountAmount,
      p_payment_intent_id: paymentIntent,
      p_shipping_address: shippingAddress,
      p_items: formattedItems
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return { success: false, error: rpcError.message || 'Failed to place order due to inventory or database error.' };
    }

    // 4. Send Confirmation Email via Service
    if (params.email) {
      await EmailService.sendOrderConfirmation(params.email, orderId, params.total, params.name, fullAddress);
    }

    return { success: true, orderId };

  } catch (err: any) {
    console.error('Checkout error:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}

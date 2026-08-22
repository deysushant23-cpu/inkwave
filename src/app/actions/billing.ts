'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin';

export async function generateAndSendBill(orderId: string) {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();

    // 1. Fetch order details to ensure it exists
    const { data, error: orderError } = await (supabase
      .from('orders') as any)
      .select('*, profiles(full_name, email)')
      .eq('id', orderId)
      .single();

    const order = data as any;

    if (orderError || !order) {
      return { success: false, error: 'Order not found.' };
    }

    // 2. Fetch or initialize the billing log from cms_sections
    let { data: configDataRaw } = await (supabase
      .from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', 'admin_bills')
      .single();

    let configData = configDataRaw as any;

    let billsLog = [];
    let configId = configData?.id;

    if (configData?.json_content?.bills) {
      billsLog = configData.json_content.bills;
    }

    // Check if this order already has a bill
    if (billsLog.some((b: any) => b.orderId === orderId)) {
      return { success: false, error: 'A bill has already been generated for this order.' };
    }

    const customerName = order.profiles?.full_name || order.shipping_address?.name || 'Guest User';
    const customerPhone = order.shipping_address?.phone || 'N/A';

    // 3. Create the new bill record
    const newBill = {
      id: `INV-${orderId.substring(0, 8).toUpperCase()}`,
      orderId: order.id,
      customerName,
      customerPhone,
      totalAmount: order.total_amount,
      status: customerPhone !== 'N/A' ? 'SMS_SENT' : 'GENERATED_ONLY',
      generatedAt: new Date().toISOString(),
      billUrl: `/bill/${order.id}` // The public link
    };

    billsLog.unshift(newBill); // Add to top

    // 4. Save back to cms_sections
    if (configId) {
      const { error: updateError } = await (supabase
        .from('cms_sections') as any)
        .update({ json_content: { bills: billsLog } })
        .eq('id', configId);
      
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await (supabase
        .from('cms_sections') as any)
        .insert([
          { 
            section_key: 'admin_bills', 
            json_content: { bills: billsLog }, 
            is_published: true 
          }
        ]);
        
      if (insertError) throw insertError;
    }

    // 5. Simulate Twilio SMS Sending if phone exists
    if (customerPhone !== 'N/A') {
      console.log(`[TWILIO SIMULATION] Sending SMS to ${customerPhone}:`);
      console.log(`"Your Inkwave order receipt is ready. View it here: https://inkwave.com${newBill.billUrl}"`);
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/billing');
    
    return { success: true, bill: newBill };

  } catch (error: any) {
    console.error('Generate bill error:', error);
    return { success: false, error: 'An unexpected error occurred while generating the bill.' };
  }
}

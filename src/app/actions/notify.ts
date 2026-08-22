'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const notifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().optional(),
});

export async function subscribeToRestockAction(formData: FormData) {
  try {
    const rawData = {
      email: formData.get('email'),
      product_id: formData.get('product_id'),
      variant_id: formData.get('variant_id') || undefined,
    };

    const parsed = notifySchema.safeParse(rawData);
    
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid data' };
    }

    const supabase = await createClient();
    
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Check if already subscribed
    const { data: existing } = await (supabase.from('restock_notifications') as any)
      .select('id')
      .eq('email', parsed.data.email)
      .eq('product_id', parsed.data.product_id)
      .eq('status', 'pending')
      .single();

    if (existing) {
      return { success: false, error: 'You are already subscribed to restock notifications for this item.' };
    }

    const { error } = await (supabase.from('restock_notifications') as any)
      .insert({
        email: parsed.data.email,
        product_id: parsed.data.product_id,
        variant_id: parsed.data.variant_id,
        user_id: user?.id || null,
        status: 'pending'
      });

    if (error) {
      console.error('Failed to save restock notification:', error);
      return { success: false, error: 'Failed to save your request. Please try again later.' };
    }

    return { success: true };

  } catch (err: any) {
    console.error('Restock subscribe error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';

import { z } from 'zod';

const productIdSchema = z.string().uuid('Invalid product ID');

export async function toggleWishlistAction(productId: string) {
  try {
    const parseResult = productIdSchema.safeParse(productId);
    if (!parseResult.success) return { success: false, error: 'Invalid product ID' };
    const validProductId = parseResult.data;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };
    
    const userId = user.id;

    // Fetch current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, fit_preferences')
      .eq('id', userId)
      .single();

    if (fetchError || !profile) {
      console.error('Error fetching profile for wishlist', fetchError);
      return { success: false, error: 'Profile not found' };
    }

    const fitPreferences = (profile as any).fit_preferences || {};
    let wishlist: string[] = Array.isArray(fitPreferences.wishlist) ? fitPreferences.wishlist : [];

    // Toggle the product
    if (wishlist.includes(validProductId)) {
      wishlist = wishlist.filter(id => id !== validProductId);
    } else {
      wishlist.push(validProductId);
    }

    const updatedPreferences = {
      ...fitPreferences,
      wishlist
    };

    // Update profile
    const { error: updateError } = await (supabase.from('profiles') as any)
      .update({ fit_preferences: updatedPreferences })
      .eq('id', (profile as any).id);

    if (updateError) {
      console.error('Error updating wishlist', updateError);
      return { success: false, error: 'Failed to update wishlist' };
    }

    return { success: true, wishlist };
  } catch (error) {
    console.error('Wishlist error', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getWishlistAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized', wishlist: [] };

    const { data: profile } = await supabase
      .from('profiles')
      .select('fit_preferences')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { success: false, wishlist: [] };
    }

    const wishlist = Array.isArray((profile as any).fit_preferences?.wishlist) ? (profile as any).fit_preferences.wishlist : [];
    return { success: true, wishlist };
  } catch (error) {
    return { success: false, error: 'Internal Server Error', wishlist: [] };
  }
}

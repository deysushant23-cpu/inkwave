'use server';


import { createAdminClient, createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/admin';
import { revalidatePath } from 'next/cache';

import { reviewSchema, reviewIdSchema } from '@/lib/validations/reviews.schema';

// --- STOREFRONT ACTIONS ---

export async function submitReviewAction(productId: string, rating: number, commentText: string) {
  try {
    const parseResult = reviewSchema.safeParse({ productId, rating, commentText });
    if (!parseResult.success) {
      return { success: false, error: 'Invalid review data' };
    }
    const { productId: vProductId, rating: vRating, commentText: vComment } = parseResult.data;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'You must be logged in to leave a review.' };

    const userId = user.id;

    // 2. Insert the review (Upsert to prevent multiple reviews from same user on same product)
    const { error } = await (supabase.from('product_reviews') as any)
      .upsert({
        product_id: vProductId,
        user_id: userId,
        rating: vRating,
        comment_text: vComment,
        is_approved: true // Auto-approved by default
      }, { onConflict: 'user_id, product_id' });

    if (error) {
      console.error('Submit review error:', error);
      return { success: false, error: 'Failed to submit review. You may have already reviewed this product.' };
    }

    revalidatePath(`/product/${vProductId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function getProductReviewsAction(productId: string) {
  try {
    const parseResult = reviewIdSchema.shape.reviewId.safeParse(productId); // Hack to check uuid
    if (!parseResult.success) return { success: false, error: 'Invalid product ID', reviews: [] };
    const vProductId = parseResult.data;

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        id,
        rating,
        comment_text,
        created_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('product_id', vProductId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, reviews: data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch reviews', reviews: [] };
  }
}

// --- ADMIN ACTIONS ---

export async function getAllReviewsAction() {
  try {
    await verifyAdmin();
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('product_reviews')
      .select(`
        id,
        rating,
        comment_text,
        is_approved,
        created_at,
        products ( title, id ),
        profiles ( full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, reviews: data };
  } catch (error) {
    return { success: false, reviews: [], error: 'Failed to fetch reviews' };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    const parseResult = reviewIdSchema.safeParse({ reviewId });
    if (!parseResult.success) return { success: false, error: 'Invalid review ID' };
    
    await verifyAdmin();
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', parseResult.data.reviewId);

    if (error) throw error;
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete review' };
  }
}

export async function toggleReviewApprovalAction(reviewId: string, currentStatus: boolean) {
  try {
    const parseResult = reviewIdSchema.safeParse({ reviewId });
    if (!parseResult.success || typeof currentStatus !== 'boolean') {
      return { success: false, error: 'Invalid input' };
    }

    await verifyAdmin();
    const supabase = await createAdminClient();
    const { error } = await (supabase.from('product_reviews') as any)
      .update({ is_approved: !currentStatus })
      .eq('id', parseResult.data.reviewId);

    if (error) throw error;
    revalidatePath('/admin/reviews');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update review status' };
  }
}

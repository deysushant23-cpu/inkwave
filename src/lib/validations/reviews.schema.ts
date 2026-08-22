import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  commentText: z.string().min(5, 'Review must be at least 5 characters long').max(1000, 'Review is too long'),
});

export const reviewIdSchema = z.object({
  reviewId: z.string().uuid('Invalid review ID'),
});

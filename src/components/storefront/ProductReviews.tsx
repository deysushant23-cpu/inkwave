'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { submitReviewAction } from '@/app/actions/reviews';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment_text: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ProductReviews({ productId, initialReviews }: { productId: string, initialReviews: Review[] }) {
  const { user, setAuthModalOpen } = useAuthStore();
  const isSignedIn = !!user;
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('You must be logged in to leave a review.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    if (comment.trim().length < 5) {
      toast.error('Please write a slightly longer review.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitReviewAction(productId, rating, comment);
    
    if (result.success) {
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(0);
      // In a real scenario we might re-fetch reviews, but Next.js revalidatePath will handle the page reload.
      window.location.reload(); 
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div id="product-reviews-section" className="mt-16 pt-16 border-t border-[var(--line)] scroll-mt-28">
      <h2 className="font-headline-lg-mobile md:font-headline-lg text-4xl uppercase mb-12 text-[var(--text)]">Reviews</h2>

      {/* Review Submission Form */}
      <div className="mb-16 p-8 border border-[var(--line)] rounded-xl bg-[var(--bg-alt)]">
        <h3 className="font-display text-xl uppercase tracking-wider mb-6 text-[var(--text)]">Write a Review</h3>
        
        {!isSignedIn ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4 select-none">
            <p className="font-mono text-sm text-[var(--text-dim)] uppercase tracking-widest">
              You must be logged in to share your thoughts.
            </p>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-[var(--accent)] text-[var(--bg)] font-mono font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 active:scale-95 cursor-pointer shadow-md shadow-[var(--accent)]/10"
            >
              Sign In / Join Vanguard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest mb-3 text-[var(--text)] opacity-60">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 transition-colors"
                      fill={star <= rating ? 'var(--accent)' : 'transparent'}
                      stroke={star <= rating ? 'var(--accent)' : 'var(--line)'} 
                      strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-widest mb-3 text-[var(--text)] opacity-60">Your Thoughts</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How does it fit? Quality? Tell us..."
                className="w-full bg-transparent border border-[var(--line)] p-4 font-sans text-[var(--text)] focus:border-[var(--accent)] outline-none min-h-[120px]"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="self-start px-8 py-3 bg-[var(--text)] text-[var(--bg)] font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {/* Review List */}
      <div className="flex flex-col gap-8">
        {reviews.length === 0 ? (
          <p className="font-mono text-sm text-[var(--text)] opacity-60 uppercase tracking-widest">No reviews yet. Be the first.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="pb-8 border-b border-[var(--line)] last:border-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--line)] flex items-center justify-center font-display uppercase overflow-hidden">
                  {review.profiles.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    review.profiles.full_name?.charAt(0) || 'A'
                  )}
                </div>
                <div>
                  <div className="font-display uppercase tracking-wider text-[var(--text)] text-sm">
                    {review.profiles.full_name || 'Anonymous'}
                  </div>
                  <div className="font-mono text-xs opacity-50 text-[var(--text)]">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="ml-auto flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="w-4 h-4"
                      fill={s <= review.rating ? 'var(--accent)' : 'none'}
                      stroke={s <= review.rating ? 'var(--accent)' : 'var(--line)'} strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-[var(--text-dim)] font-sans text-sm leading-relaxed whitespace-pre-line">
                {review.comment_text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

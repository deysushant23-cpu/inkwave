'use client';

import { useState, useEffect } from 'react';
import { getAllReviewsAction, deleteReviewAction, toggleReviewApprovalAction } from '@/app/actions/reviews';
import { toast } from 'sonner';
import { Trash2, Eye, EyeOff } from 'lucide-react';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    const result = await getAllReviewsAction();
    if (result.success) {
      setReviews(result.reviews || []);
    } else {
      toast.error(result.error || 'Failed to fetch reviews');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    const result = await deleteReviewAction(id);
    if (result.success) {
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleReviewApprovalAction(id, currentStatus);
    if (result.success) {
      toast.success(currentStatus ? 'Review hidden from storefront' : 'Review approved for storefront');
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text)]">Product Reviews</h1>
          <p className="text-[var(--text-dim)] mt-1">Manage customer reviews and feedback.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--bg-alt)] text-[var(--text-dim)] uppercase text-xs tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Product</th>
                <th className="px-6 py-5">Rating</th>
                <th className="px-6 py-5 max-w-xs">Review</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-dim)]">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-dim)]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[var(--bg-alt)]/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[var(--text)]">
                      {review.profiles?.full_name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-dim)] font-mono text-xs whitespace-nowrap">
                      {review.products?.title || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex text-[var(--accent)]">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-[var(--line)] fill-current'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-dim)] max-w-xs truncate" title={review.comment_text}>
                      {review.comment_text}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                        review.is_approved 
                          ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                          : 'bg-[var(--bg)] text-[var(--text-dim)] border-[var(--line)]'
                      }`}>
                        {review.is_approved ? 'Live' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(review.id, review.is_approved)}
                          className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl"
                          title={review.is_approved ? "Hide from Storefront" : "Approve for Storefront"}
                        >
                          {review.is_approved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-[var(--text-dim)] hover:text-red-500 transition-colors bg-[var(--bg-alt)] border border-[var(--line)] rounded-xl"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

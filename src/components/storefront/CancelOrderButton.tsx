'use client';

import { useState } from 'react';
import { Ban } from 'lucide-react';
import { toast } from 'sonner';
import { cancelOrder } from '@/app/actions/orders';

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setIsCancelling(true);
    toast.info('Processing cancellation...');
    
    try {
      const result = await cancelOrder(orderId);
      
      if (result?.success) {
        toast.success('Order cancelled successfully.');
      } else {
        toast.error(result?.error || 'Failed to cancel order.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button 
      onClick={handleCancel}
      disabled={isCancelling}
      className="print:hidden mt-4 md:mt-0 px-6 py-2.5 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Ban className="w-4 h-4" /> {isCancelling ? 'Cancelling...' : 'Cancel Order'}
    </button>
  );
}

import OrderTracker from '@/components/storefront/OrderTracker';

export const dynamic = 'force-dynamic';

export default async function TrackOrderPage() {
  return (
    <div className="pt-32 sm:pt-40 pb-24 min-h-screen">
      <div className="wrap px-4 sm:px-6">
        <OrderTracker />
      </div>
    </div>
  );
}

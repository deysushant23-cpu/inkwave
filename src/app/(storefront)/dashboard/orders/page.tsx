import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';


export default async function DashboardOrdersPage() {
  const supabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Fetch orders and include order items (for count)
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items ( id )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
  }

  const orderList = orders || [];

  return (
    <>
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mb-4">My Orders</h1>
        <p className="text-[var(--text-dim)] max-w-xl text-sm">Track, manage and review your underground luxury acquisitions. All shipments are handled with discrete, premium packaging.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] p-6 mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <button className="px-5 py-2 font-bold text-xs uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] border border-[var(--text)]">ALL</button>
          <button className="px-5 py-2 font-bold text-xs uppercase tracking-widest bg-white/5 border border-[var(--line)] hover:border-[var(--accent)] transition-colors">IN PROGRESS</button>
          <button className="px-5 py-2 font-bold text-xs uppercase tracking-widest bg-white/5 border border-[var(--line)] hover:border-[var(--accent)] transition-colors">DELIVERED</button>
          <button className="px-5 py-2 font-bold text-xs uppercase tracking-widest bg-white/5 border border-[var(--line)] hover:border-[var(--accent)] transition-colors">RETURNED</button>
        </div>
      </div>

      {/* Order Cards List */}
      <div className="space-y-8">
        {orderList.length === 0 ? (
          <div className="p-8 text-center border border-[var(--line)] text-[var(--text-dim)]">
            <p className="mb-4">You haven't placed any orders yet.</p>
            <Link href="/" className="px-6 py-2 bg-[var(--text)] text-[var(--bg)] font-bold uppercase tracking-wider text-xs">
              Start Shopping
            </Link>
          </div>
        ) : (
          orderList.map((order: any) => {
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
            const itemCount = order.order_items?.length || 0;
            
            return (
              <div key={order.id} className="bg-[var(--bg-card)] border border-[var(--line)] group overflow-hidden transition-all duration-300">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div>
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-1">ORDER NO.</h3>
                        <p className="font-headline-lg-mobile text-xl tracking-widest uppercase">#{order.id.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-1 text-right">STATUS</h3>
                        <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 text-[10px] font-bold tracking-tighter uppercase">
                          {order.order_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4 border-y border-[var(--line)]/50">
                      <div>
                        <h4 className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Date</h4>
                        <p className="font-bold text-sm mt-1">{dateStr}</p>
                      </div>
                      <div>
                        <h4 className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Items</h4>
                        <p className="font-bold text-sm mt-1">{itemCount} UNITS</p>
                      </div>
                      <div>
                        <h4 className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Total</h4>
                        <p className="font-bold text-sm mt-1">₹{order.total_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Ship To</h4>
                        <p className="font-bold text-sm mt-1 truncate pr-4">{order.shipping_address?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-56 flex flex-col gap-3">
                    <Link href={`/dashboard/orders/${order.id}`} className="w-full py-3 bg-[var(--text)] text-[var(--bg)] font-bold text-xs tracking-widest hover:bg-[var(--accent)] transition-colors uppercase text-center block">Track Order</Link>
                    <Link href={`/bill/${order.id}`} target="_blank" className="w-full py-3 bg-transparent border border-[var(--line)] text-[var(--text)] font-bold text-xs tracking-widest hover:bg-white/5 transition-colors uppercase text-center block">Download Bill</Link>
                    <button className="w-full py-3 bg-transparent border border-[var(--line)] text-[var(--text-dim)] font-bold text-xs tracking-widest hover:text-red-400 hover:border-red-500/30 transition-colors uppercase">Return Items</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

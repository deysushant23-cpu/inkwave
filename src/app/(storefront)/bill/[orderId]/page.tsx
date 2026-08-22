import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

export default async function CustomerBillPage({ params }: { params: { orderId: string } }) {
  const supabase = await createAdminClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .select('*, profiles(full_name, email)')
    .eq('id', params.orderId)
    .single();

  const order = data as any;

  if (error || !order) {
    notFound();
  }

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, products(title)')
    .eq('order_id', order.id);

  const customerName = order.profiles?.full_name || order.shipping_address?.name || 'Guest User';
  const customerEmail = order.profiles?.email || order.shipping_address?.email || 'N/A';
  const customerPhone = order.shipping_address?.phone || 'N/A';
  const address = order.shipping_address?.address || 'N/A';

  return (
    <div className="min-h-screen bg-[var(--bg-alt)] pt-24 sm:pt-32 pb-24 text-[var(--text)]">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Actions */}
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <PrintButton className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--line)] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-[var(--text)] transition-colors" />
        </div>

        {/* Invoice Paper */}
        <div className="bg-[var(--bg-card)] border border-[var(--line)] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Corner Fold / Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/10 blur-3xl rounded-full" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-[var(--line)] pb-8">
            <div>
              <Link href="/">
                <h1 className="font-display text-4xl font-black uppercase tracking-tighter mb-2">INKWAVE</h1>
              </Link>
              <p className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">Premium Gen-Z Streetwear</p>
              <p className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/20 text-green-500 border border-green-500/20 rounded-full mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Paid in Full</span>
              </div>
              <h2 className="font-sans text-sm font-bold text-[var(--text-dim)]">Date of Issue</h2>
              <p className="font-mono text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-12">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4 border-l-2 border-[var(--accent)] pl-3">Billed To</h3>
            <div className="font-sans font-bold text-lg mb-1">{customerName}</div>
            <div className="font-mono text-xs text-[var(--text-dim)] space-y-1">
              <p>{address}</p>
              <p>Email: {customerEmail}</p>
              <p>Phone: {customerPhone}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-12">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[var(--text-dim)] mb-4 border-l-2 border-[var(--accent)] pl-3">Order Details</h3>
            <div className="border border-[var(--line)]">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--bg-alt)] border-b border-[var(--line)] text-[10px] uppercase font-bold tracking-wider text-[var(--text-dim)]">
                  <tr>
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {(orderItems || []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 font-bold">{item.products?.title || 'Custom Apparel'}</td>
                      <td className="px-4 py-4 text-center font-mono text-xs">{item.quantity}</td>
                      <td className="px-4 py-4 text-right font-mono text-xs text-[var(--text-dim)]">₹{item.unit_price}</td>
                      <td className="px-4 py-4 text-right font-bold">₹{(item.unit_price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end border-t border-[var(--line)] pt-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="flex justify-between text-sm font-bold text-[var(--text-dim)]">
                <span>Subtotal</span>
                <span className="font-mono">₹{(order.total_amount + (order.discount_amount || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--accent)]">
                <span>Discount</span>
                <span className="font-mono">-₹{(order.discount_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--text-dim)] border-b border-[var(--line)] pb-3">
                <span>Shipping</span>
                <span className="font-mono">₹0.00</span>
              </div>
              <div className="flex justify-between text-2xl font-black uppercase tracking-tighter pt-2">
                <span>Total</span>
                <span>₹{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-16 text-center border-t border-[var(--line)] pt-8">
            <p className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-widest">
              Thank you for supporting Inkwave. <br/>
              Questions? Contact support@inkwave.com
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

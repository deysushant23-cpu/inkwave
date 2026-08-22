import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintBillPage({ params }: { params: { orderId: string } }) {
  const supabase = await createAdminClient();

  const { data, error } = await (supabase
    .from('orders') as any)
    .select(`
      *, 
      profiles(full_name, email),
      order_items (
        id,
        quantity,
        unit_price,
        product_variants (
          color,
          size,
          products (
            title,
            sku
          )
        )
      )
    `)
    .eq('id', params.orderId)
    .single();

  const order = data as any;

  if (error || !order) {
    notFound();
  }

  const customerName = order.profiles?.full_name || order.shipping_address?.name || 'Guest User';
  const customerEmail = order.profiles?.email || order.shipping_address?.email || 'N/A';
  const customerPhone = order.shipping_address?.phone || 'N/A';
  const address = order.shipping_address?.address || 'N/A';
  
  // Calculate subtotal, assuming shipping/taxes could be added later. Currently using total_amount.
  const subtotal = order.total_amount;
  const shipping = 0; // Free shipping for now or COD fee
  const total = order.total_amount;

  return (
    <div className="min-h-screen bg-gray-100 text-black p-8 sm:p-12 font-mono flex flex-col items-center">
      
      {/* Print Action - Hidden when actually printing */}
      <div className="flex w-full max-w-[8.5in] justify-end gap-3 mb-8 print:hidden">
        <PrintButton className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors" />
      </div>

      {/* A4 Invoice Container */}
      <div className="w-full max-w-[8.5in] mx-auto bg-white border-[8px] border-black p-8 sm:p-12 relative flex flex-col print:m-0 print:border-none print:w-full print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-[6px] border-black pb-8 mb-8">
          <div>
            <h1 className="font-display text-6xl font-black uppercase tracking-tighter leading-none mb-2">INKWAVE</h1>
            <p className="font-mono text-xs uppercase font-bold tracking-[0.2em] text-gray-400">STREETWEAR DIVISION</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-black text-white px-6 py-2 mb-2">
              <span className="font-display text-3xl font-black uppercase tracking-widest">INVOICE</span>
            </div>
            <p className="text-sm font-bold uppercase">NO. {order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Customer & Order Details Grid */}
        <div className="grid grid-cols-2 gap-8 border-b-[4px] border-dashed border-black pb-8 mb-8">
          {/* Bill To */}
          <div>
            <span className="font-black text-xs uppercase tracking-widest border border-black px-2 py-0.5 mb-3 inline-block">BILL TO</span>
            <div className="font-display text-2xl uppercase tracking-tight leading-none mb-2">
              {customerName}
            </div>
            <p className="font-bold text-sm uppercase leading-tight max-w-[80%] mb-1">
              {address}
            </p>
            <p className="text-xs uppercase text-gray-600 font-bold mb-1">PH: {customerPhone}</p>
            <p className="text-xs uppercase text-gray-600 font-bold">EM: {customerEmail}</p>
          </div>

          {/* Payment Status (Stamp Effect) */}
          <div className="flex flex-col items-end justify-center">
            <div className={`border-[4px] px-6 py-3 font-display text-3xl font-black uppercase tracking-widest -rotate-3 ${order.order_status === 'DELIVERED' || order.order_status === 'SHIPPED' ? 'border-black text-black' : 'border-gray-300 text-gray-300'}`}>
              {order.order_status === 'DELIVERED' ? 'PAID IN FULL' : 'COD SECURED'}
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[4px] border-black">
                <th className="py-3 px-2 font-black uppercase tracking-widest text-xs">Item Description</th>
                <th className="py-3 px-2 font-black uppercase tracking-widest text-xs text-center">Qty</th>
                <th className="py-3 px-2 font-black uppercase tracking-widest text-xs text-right">Price</th>
                <th className="py-3 px-2 font-black uppercase tracking-widest text-xs text-right">Total</th>
              </tr>
            </thead>
            <tbody className="border-b-[4px] border-black">
              {order.order_items?.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-200 last:border-0">
                  <td className="py-4 px-2">
                    <p className="font-bold uppercase text-sm">{item.product_variants?.products?.title || 'Custom Printed Tee'}</p>
                    <p className="text-xs text-gray-500 uppercase mt-1">
                      {item.product_variants?.color && `CLR: ${item.product_variants.color} | `}
                      {item.product_variants?.size && `SZ: ${item.product_variants.size} | `}
                      SKU: {item.product_variants?.products?.sku || item.id.slice(0,6)}
                    </p>
                  </td>
                  <td className="py-4 px-2 text-center font-bold">{item.quantity}</td>
                  <td className="py-4 px-2 text-right font-bold">₹{item.unit_price.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-2 text-right font-black">₹{(item.quantity * item.unit_price).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Barcode */}
        <div className="flex justify-between items-end mt-8">
          
          {/* Barcode / Scan section */}
          <div className="w-1/2">
            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Auth Scan</p>
            <div className="h-16 flex items-end gap-[2px]">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="bg-black h-full" style={{ width: Math.random() > 0.5 ? '4px' : '2px', opacity: Math.random() > 0.85 ? 0 : 1 }} />
              ))}
            </div>
            <p className="text-[10px] uppercase font-bold mt-2">{order.id}</p>
          </div>

          {/* Totals */}
          <div className="w-1/2 max-w-xs">
            <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
              <span className="text-xs uppercase font-bold text-gray-500">Subtotal</span>
              <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-300 py-2">
              <span className="text-xs uppercase font-bold text-gray-500">Shipping</span>
              <span className="font-bold">₹{shipping}</span>
            </div>
            <div className="flex justify-between py-4 bg-black text-white px-4 mt-4">
              <span className="font-black text-lg uppercase tracking-widest">Total</span>
              <span className="font-black text-lg">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center border-t border-black pt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Thank you for repping Inkwave.</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">No returns on worn merchandise. Tag @inkwave on IG.</p>
        </div>

      </div>

    </div>
  );
}

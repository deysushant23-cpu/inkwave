import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Package } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintLabelPage({ params }: { params: { orderId: string } }) {
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
    .select('quantity')
    .eq('order_id', order.id);

  const customerName = order.profiles?.full_name || order.shipping_address?.name || 'Guest User';
  const customerPhone = order.shipping_address?.phone || 'N/A';
  const address = order.shipping_address?.address || 'N/A';
  const totalItems = (orderItems || []).reduce((sum: number, item: any) => sum + item.quantity, 0);

  // Generate a mock tracking number
  const trackingNumber = `EKART-${order.id.slice(0, 10).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-white text-black p-8 sm:p-12">
      
      {/* Print Action - Hidden when actually printing */}
      <div className="flex justify-end gap-3 mb-8 print:hidden">
        <PrintButton className="flex items-center gap-2 bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors" />
      </div>

      {/* Shipping Label Box */}
      <div className="max-w-[4in] mx-auto border-[6px] border-black bg-white relative flex flex-col font-mono text-black print:m-0 print:border-none print:w-full">
        
        {/* Top Header - Brutalist Logo */}
        <div className="border-b-[6px] border-black p-4 flex justify-between items-start bg-black text-white">
          <div>
            <h1 className="font-display text-5xl font-black uppercase tracking-tighter leading-none">INKWAVE</h1>
            <p className="font-mono text-[10px] uppercase font-bold tracking-[0.3em] mt-1 text-gray-300">STREETWEAR DIVISION</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-black leading-none tracking-tighter">01</div>
          </div>
        </div>

        {/* Priority & Warning Badges */}
        <div className="flex border-b-[6px] border-black">
          <div className="flex-1 border-r-[6px] border-black p-3 bg-[url('/grain.png')] bg-cover">
            <div className="text-center">
              <span className="font-display text-2xl font-black uppercase tracking-widest">PRIORITY</span>
            </div>
          </div>
          <div className="flex-1 p-3 flex items-center justify-center relative overflow-hidden">
            {/* Caution tape background effect */}
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]" />
            <span className="font-bold text-[11px] uppercase tracking-widest text-center relative z-10 font-display">
              ⚠️ FRAGILE:<br/>DRIP INSIDE
            </span>
          </div>
        </div>

        {/* Barcode & Tracking */}
        <div className="p-6 border-b-[6px] border-black text-center relative">
          <div className="absolute top-2 left-2 text-[10px] font-bold">TRK#</div>
          <div className="absolute top-2 right-2 text-[10px] font-bold">SCAN</div>
          
          <div className="h-20 flex justify-center items-end px-2 mb-3 mt-2 gap-[2px]">
            {[...Array(45)].map((_, i) => (
              <div key={i} className="bg-black h-full" style={{ width: Math.random() > 0.5 ? '4px' : '2px', opacity: Math.random() > 0.85 ? 0 : 1 }} />
            ))}
          </div>
          <p className="font-mono text-lg font-black tracking-[0.25em] bg-black text-white inline-block px-4 py-1">
            {trackingNumber}
          </p>
        </div>

        {/* Addresses Grid */}
        <div className="flex flex-col">
          
          {/* FROM */}
          <div className="p-4 border-b-[4px] border-dashed border-black relative">
            <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400">ORIGIN</span>
            <span className="font-black text-xs uppercase tracking-widest border border-black px-1 mb-2 inline-block bg-black text-white">FROM</span>
            <p className="font-mono text-xs uppercase font-bold">
              INKWAVE HQ // SECTOR-01<br/>
              NEW DELHI, DL 110001<br/>
              IND
            </p>
          </div>

          {/* TO */}
          <div className="p-6 border-b-[6px] border-black relative bg-gray-50">
            {/* Crosshairs for aesthetic */}
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-black" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-black" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-black" />
            
            <span className="font-black text-sm uppercase tracking-widest border border-black px-2 py-0.5 mb-3 inline-block">SHIP TO</span>
            <div className="font-display text-2xl uppercase tracking-tight leading-none mb-2 break-words">
              {customerName}
            </div>
            <div className="font-mono text-sm font-bold uppercase leading-tight max-w-[90%]">
              {address}
            </div>
            <div className="mt-4 pt-3 border-t-2 border-black font-mono text-sm uppercase font-black flex justify-between">
              <span>PH: {customerPhone}</span>
              <span className="text-gray-500">COD: VALID</span>
            </div>
          </div>

        </div>

        {/* Footer Data */}
        <div className="flex font-mono text-[11px] font-bold uppercase">
          <div className="flex-1 p-3 border-r-[4px] border-dashed border-black flex flex-col justify-between">
            <span className="text-gray-500 mb-1">WT/PCS</span>
            <span className="text-sm">1.2KG / {totalItems}</span>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between text-right">
            <span className="text-gray-500 mb-1">ORDER ID</span>
            <span className="text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

      </div>

      {/* Print Instructions - Hidden when printing */}
      <div className="max-w-[4in] mx-auto mt-8 text-center text-gray-500 text-xs print:hidden font-mono">
        <p>Ensure printer settings are set to "Actual Size" or 100% scaling.</p>
        <p>Label size: 4" x 6" thermal format.</p>
      </div>

    </div>
  );
}

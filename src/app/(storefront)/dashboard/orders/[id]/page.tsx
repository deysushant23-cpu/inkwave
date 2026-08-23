import Link from 'next/link';
import { ArrowLeft, Check, PackageOpen, Truck, Home } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import DownloadInvoiceButton from '@/components/storefront/DownloadInvoiceButton';
import CancelOrderButton from '@/components/storefront/CancelOrderButton';


export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/');
  }

  // Fetch order details
  const { data: orderData, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !orderData) {
    notFound();
  }

  const order = orderData as any;

  // Fetch order items with variants and products
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      product_variants (
        size,
        color,
        products (
          title,
          images
        )
      )
    `)
    .eq('order_id', order.id);

  const items = orderItems || [];

  // Date Logic
  const placedDate = new Date(order.created_at);
  const packedDate = new Date(placedDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  const transitDate = new Date(placedDate.getTime() + 2 * 24 * 60 * 60 * 1000);
  const deliveredDate = new Date(placedDate.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days delivery to match admin deadline

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  
  const orderPlacedStr = formatDate(placedDate);
  const orderDeliveredStr = formatDate(deliveredDate);
  const itemsCount = items.length;
  const status = order.order_status.replace('_', ' ');

  // Simulated logic to determine completed steps based on time/status
  const now = new Date();
  const isPacked = order.order_status === 'SHIPPED' || order.order_status === 'DELIVERED' || now >= packedDate;
  const isTransit = order.order_status === 'SHIPPED' || order.order_status === 'DELIVERED' || now >= transitDate;
  const isDelivered = order.order_status === 'DELIVERED' || now >= deliveredDate;

  const steps = [
    { title: 'Order Placed', date: formatDate(placedDate), icon: Check, completed: true },
    { title: 'Order Packed', date: formatDate(packedDate), icon: PackageOpen, completed: isPacked },
    { title: 'In Transit', date: formatDate(transitDate), icon: Truck, completed: isTransit },
    { title: 'Delivered', date: formatDate(deliveredDate), icon: Home, completed: isDelivered },
  ];

  const canCancel = !['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED', 'CANCELLED'].includes(order.order_status);

  return (
    <div className="print:text-black print:bg-white">
      <div className="mb-8 print:hidden">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="mb-12 print:mb-6">
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg uppercase mb-2 print:text-black">Order Tracking</h1>
        <p className="text-[var(--text-dim)] max-w-2xl text-sm print:hidden">Order tracking is a service provided to monitor the progress and location of your premium apparel from the time they are placed until they are delivered.</p>
      </div>

      {/* Order Details Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] mb-8 print:border-gray-300 print:bg-white">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[var(--line)] print:border-gray-300 gap-4">
          <h2 className="font-headline-lg-mobile text-2xl uppercase print:text-black">Order Details</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {canCancel && <CancelOrderButton orderId={order.id} />}
            <DownloadInvoiceButton orderId={order.id} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 md:p-8 text-sm">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 print:text-gray-500">Order Number</p>
            <p className="font-bold print:text-black">#{order.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 print:text-gray-500">Order Placed</p>
            <p className="font-bold print:text-black">{orderPlacedStr}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 print:text-gray-500">Est. Delivery</p>
            <p className="font-bold print:text-black">{orderDeliveredStr}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 print:text-gray-500">No of Items</p>
            <p className="font-bold print:text-black">{itemsCount} items</p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-dim)] mb-2 print:text-gray-500">Status</p>
            <p className="font-bold text-[var(--accent)] print:text-black uppercase">{status}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar Section (Hidden on Print) */}
      <div className="bg-[var(--bg-card)] border border-[var(--line)] mb-12 p-6 md:p-12 relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--line)]"></div>
        
        <div className="flex flex-col md:flex-row justify-between relative mt-4">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-[var(--line)] -z-10"></div>
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-[var(--accent)] -z-10" style={{ width: '100%' }}></div>

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 relative z-10 mb-8 md:mb-0 w-full md:w-1/4">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-[var(--bg-card)]
                ${step.completed ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--line)] text-[var(--text-dim)]'}
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="text-left md:text-center">
                <p className={`font-bold text-sm ${step.completed ? 'text-[var(--text)]' : 'text-[var(--text-dim)]'}`}>{step.title}</p>
                <p className="text-[10px] font-mono text-[var(--text-dim)] mt-1">{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items Section */}
      <div className="mb-8">
        <h3 className="font-label-caps text-lg uppercase tracking-widest mb-6 print:text-black">Items from the order</h3>
        <div className="bg-[var(--bg-card)] border border-[var(--line)] overflow-hidden print:border-gray-300 print:bg-white">
          
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[var(--line)] bg-white/5 text-[10px] font-mono tracking-widest uppercase text-[var(--text-dim)] print:bg-gray-100 print:text-gray-600 print:border-gray-300">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Size</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Price</div>
          </div>

          {items.map((item: any, idx: number) => {
            const variant = item.product_variants;
            const product = variant?.products;
            const title = product?.title || 'Unknown Product';
            const size = variant?.size || 'N/A';
            const img = Array.isArray(product?.images) && product.images.length > 0 
              ? product.images[0] 
              : 'https://via.placeholder.com/150';

            return (
              <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center ${idx !== items.length - 1 ? 'border-b border-[var(--line)] print:border-gray-300' : ''}`}>
                <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                  <div className="w-20 h-24 bg-black/20 overflow-hidden border border-[var(--line)] print:border-gray-300">
                    <img src={img} alt={title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm md:text-base print:text-black">{title}</p>
                    <p className="text-[10px] font-mono text-[var(--text-dim)] mt-1 uppercase print:text-gray-500">Variant ID: {item.variant_id?.substring(0, 8) || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 text-left md:text-center mt-2 md:mt-0 flex justify-between md:block">
                  <span className="md:hidden text-xs text-[var(--text-dim)] uppercase print:text-gray-500">Size: </span>
                  <span className="font-bold print:text-black">{size}</span>
                </div>
                
                <div className="col-span-1 md:col-span-2 text-left md:text-center mt-2 md:mt-0 flex justify-between md:block">
                  <span className="md:hidden text-xs text-[var(--text-dim)] uppercase print:text-gray-500">Qty: </span>
                  <span className="font-mono print:text-black">{item.quantity.toString().padStart(2, '0')}</span>
                </div>

                <div className="col-span-1 md:col-span-2 text-left md:text-right mt-2 md:mt-0 flex justify-between md:block">
                  <span className="md:hidden text-xs text-[var(--text-dim)] uppercase print:text-gray-500">Price: </span>
                  <span className="font-bold print:text-black">₹{item.unit_price.toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {/* Totals Section */}
          <div className="border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-2 bg-black/20 print:border-gray-300 print:bg-white">
            <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--line)] flex justify-between print:border-gray-300">
              <div className="space-y-4">
                <p className="text-[var(--text-dim)] text-xs uppercase tracking-widest font-mono print:text-gray-500">Discount</p>
                <p className="text-[var(--text-dim)] text-xs uppercase tracking-widest font-mono print:text-gray-500">Delivery</p>
              </div>
              <div className="space-y-4 text-right">
                <p className="font-mono text-sm font-bold print:text-black">₹{order.discount_amount.toFixed(2)}</p>
                <p className="font-mono text-sm font-bold print:text-black">₹0.00</p>
              </div>
            </div>
            <div className="p-6 md:p-8 flex justify-between bg-white/5 print:bg-gray-100">
              <div className="space-y-4">
                <p className="text-[var(--text-dim)] text-xs uppercase tracking-widest font-mono print:text-gray-500">Subtotal</p>
                <p className="text-[var(--text)] text-sm uppercase tracking-widest font-bold print:text-black">Total</p>
              </div>
              <div className="space-y-4 text-right">
                <p className="font-mono text-sm font-bold print:text-black">₹{order.total_amount.toFixed(2)}</p>
                <p className="font-mono text-lg font-bold text-[var(--accent)] print:text-black">₹{order.total_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

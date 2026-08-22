'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Receipt, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight,
  Printer,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { lookupOrder, getUserRecentOrders, TrackOrderResult } from '@/app/actions/trackOrder';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function OrderTracker({ initialIdentifier = '' }: { initialIdentifier?: string }) {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id') || initialIdentifier;

  const [inputVal, setInputVal] = useState(urlId);
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<TrackOrderResult['order'] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  // Fetch logged-in user recent orders for 1-click quick tracking
  useEffect(() => {
    async function loadRecent() {
      const recents = await getUserRecentOrders();
      setUserOrders(recents);
    }
    loadRecent();
  }, []);

  // Auto-search if URL parameter is present
  useEffect(() => {
    if (urlId) {
      setInputVal(urlId);
      performSearch(urlId);
    }
  }, [urlId]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter an Order ID or Email.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await lookupOrder(query);

    if (res.success && res.order) {
      setOrderResult(res.order);
      setErrorMessage(null);
    } else {
      setOrderResult(null);
      setErrorMessage(res.error || 'Order not found.');
      toast.error(res.error || 'Order not found.');
    }
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(inputVal);
  };

  // Helper date calculations
  const getStepDates = (createdIso: string) => {
    const placed = new Date(createdIso);
    const inking = new Date(placed.getTime() + 18 * 60 * 60 * 1000); // 18 hrs
    const shipped = new Date(placed.getTime() + 40 * 60 * 60 * 1000); // ~2 days
    const outForDelivery = new Date(placed.getTime() + 72 * 60 * 60 * 1000); // 3 days
    const estDelivery = new Date(placed.getTime() + 96 * 60 * 60 * 1000); // 4 days

    const format = (d: Date) => 
      d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return {
      placed: format(placed),
      inking: format(inking),
      shipped: format(shipped),
      outForDelivery: format(outForDelivery),
      deliveryDateFull: estDelivery.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    };
  };

  // Stepper logic
  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED': return 0;
      case 'IN_FULFILLMENT': return 1;
      case 'SHIPPED': return 2;
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      case 'RETURNED': return -2;
      default: return 0;
    }
  };

  const currentStep = orderResult ? getActiveStepIndex(orderResult.order_status) : 0;
  const dates = orderResult ? getStepDates(orderResult.created_at) : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      
      {/* ════════════════════════════════════════════════════════════════
          1. SEARCH HERO & INPUT BOX
      ════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-[var(--line)] bg-[var(--bg-card)]/70 backdrop-blur-xl shadow-2xl mb-10">
        
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--accent)]/15 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] font-mono text-[11px] uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Order Tracking
          </div>
          
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-[var(--text)] mb-3">
            Track Your Order
          </h1>
          <p className="text-[var(--text-dim)] text-sm sm:text-base mb-8">
            Enter your 8-digit Order Number or full Order ID to check real-time inking, packing, and courier updates.
          </p>

          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-[var(--text-dim)] text-sm">
                #
              </span>
              <input 
                type="text" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Order ID (e.g. 5C45B93E or UUID)"
                className="w-full pl-9 pr-4 py-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-[var(--text)] placeholder-[var(--text-dim)] font-mono text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all uppercase tracking-wider"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto shrink-0 px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {/* Quick pills for logged-in user recent orders */}
          {userOrders.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-[var(--text-dim)] font-mono">Recent:</span>
              {userOrders.map((uo) => (
                <button
                  key={uo.id}
                  type="button"
                  onClick={() => {
                    setInputVal(uo.id);
                    performSearch(uo.id);
                  }}
                  className="px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[11px] font-mono font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
                >
                  #{uo.shortId}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          2. ERROR / NOT FOUND MESSAGE
      ════════════════════════════════════════════════════════════════ */}
      {errorMessage && (
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-4 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">Order Lookup Notice</h3>
            <p className="text-xs text-rose-200/80 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          3. REAL-TIME TRACKING RESULT DETAILS
      ════════════════════════════════════════════════════════════════ */}
      {orderResult && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Order Header Summary Bar */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-display text-2xl font-black text-[var(--text)] uppercase tracking-wider">
                  Order #{orderResult.shortId}
                </span>
                <span className={`px-3 py-0.5 rounded-full font-mono text-[10px] font-black uppercase tracking-widest ${
                  orderResult.order_status === 'DELIVERED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                  orderResult.order_status === 'CANCELLED' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                  'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30'
                }`}>
                  {orderResult.order_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)] font-mono">
                Placed on {new Date(orderResult.created_at).toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs font-mono font-bold uppercase tracking-wider text-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <Link 
                href="/showcase"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> More Drops
              </Link>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              4. LIVE PROGRESS STEPPER
          ════════════════════════════════════════════════════════════════ */}
          {currentStep >= 0 && (
            <div className="p-6 sm:p-10 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl relative overflow-hidden">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-[var(--text)]">
                    Shipment Timeline
                  </h3>
                  <p className="text-xs text-[var(--text-dim)] font-mono mt-0.5">
                    Estimated Delivery: <strong className="text-[var(--text)]">{dates?.deliveryDateFull}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" /> Inkwave Verified Courier
                </div>
              </div>

              {/* Steps Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative pt-4">
                
                {/* Horizontal Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-[38px] left-[12%] right-[12%] h-[2px] bg-[var(--line)] z-0" />
                <div 
                  className="hidden md:block absolute top-[38px] left-[12%] h-[2px] bg-[var(--accent)] z-0 transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(0, currentStep * 33.3))}%` }}
                />

                {/* Step 1: Placed */}
                <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-left md:text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    currentStep >= 0 
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 font-bold' 
                      : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Order Confirmed</h4>
                    <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">{dates?.placed}</p>
                  </div>
                </div>

                {/* Step 2: Inking / Studio Prep */}
                <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-left md:text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    currentStep >= 1 
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 font-bold' 
                      : currentStep === 0 
                      ? 'bg-[var(--bg)] border-[var(--accent)] text-[var(--accent)] animate-pulse'
                      : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]'
                  }`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Inking & Packed</h4>
                    <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">Quality Inspection</p>
                  </div>
                </div>

                {/* Step 3: In Transit */}
                <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-left md:text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    currentStep >= 2 
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/30 font-bold' 
                      : currentStep === 1 
                      ? 'bg-[var(--bg)] border-[var(--accent)] text-[var(--accent)] animate-pulse'
                      : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]'
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
                      {currentStep === 3 ? "Out for Delivery" : "In Transit"}
                    </h4>
                    <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">
                      {currentStep === 3 ? "Delivery agent is arriving" : "Inkwave Self-Delivery"}
                    </p>
                  </div>
                </div>

                {/* Step 4: Delivered */}
                <div className="relative z-10 flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-left md:text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all ${
                    currentStep >= 4 
                      ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold' 
                      : 'bg-[var(--bg)] border-[var(--line)] text-[var(--text-dim)]'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Delivered</h4>
                    <p className="text-[11px] font-mono text-[var(--text-dim)] mt-0.5">Handed to recipient</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Cancelled / Return Banner */}
          {currentStep < 0 && (
            <div className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <h3 className="font-display text-xl font-bold uppercase">
                Order Status: {orderResult.order_status}
              </h3>
              <p className="text-xs text-rose-200/80 mt-1">
                This order is marked as {orderResult.order_status.toLowerCase()}. If you have questions or requested a return, our concierge team will assist you directly.
              </p>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              5. ORDERED ITEMS LIST
          ════════════════════════════════════════════════════════════════ */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl">
            <h3 className="font-display text-xl font-bold uppercase text-[var(--text)] mb-6">
              Items in this Package ({orderResult.items.length})
            </h3>

            <div className="divide-y divide-[var(--line)]">
              {orderResult.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl bg-[var(--bg)] border border-[var(--line)] overflow-hidden shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-[var(--text)] truncate">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-xs text-[var(--text-dim)]">
                      <span className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
                        Size: {item.size}
                      </span>
                      {item.color && (
                        <span className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)]">
                          Color: {item.color}
                        </span>
                      )}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-sm sm:text-base text-[var(--text)]">
                    {formatPrice(item.unit_price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              6. SHIPPING ADDRESS & PAYMENT DETAILS
          ════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delivery Destination */}
            <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[var(--accent)] font-mono text-xs uppercase tracking-widest mb-3">
                  <MapPin className="w-4 h-4" /> Shipping Destination
                </div>
                <h4 className="font-bold text-base text-[var(--text)]">
                  {orderResult.shipping_address?.name || 'Customer'}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-dim)] mt-1 whitespace-pre-line leading-relaxed">
                  {orderResult.shipping_address?.address || 'Shipping address recorded with order.'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--line)] flex items-center gap-2 text-xs font-mono text-[var(--text-dim)]">
                <Truck className="w-3.5 h-3.5 text-[var(--accent)]" /> Free Express Delivery
              </div>
            </div>

            {/* Payment & Invoice Summary */}
            <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[var(--accent)] font-mono text-xs uppercase tracking-widest mb-3">
                  <Receipt className="w-4 h-4" /> Payment Summary
                </div>
                <div className="space-y-2 text-xs sm:text-sm font-mono">
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Payment Method:</span>
                    <span className="font-bold text-[var(--text)] uppercase">
                      {orderResult.payment_intent_id.startsWith('UPI') ? 'UPI (Verified)' : 'Cash on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[var(--text-dim)]">
                    <span>Delivery Charges:</span>
                    <span className="font-bold text-emerald-400">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--text)] pt-2 border-t border-[var(--line)]">
                    <span>Total Amount:</span>
                    <span className="text-[var(--accent)]">{formatPrice(orderResult.total_amount)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--text-dim)]">Need assistance?</span>
                <Link href="/pages/contact" className="text-[var(--accent)] hover:underline flex items-center gap-1 font-bold">
                  Contact Support <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

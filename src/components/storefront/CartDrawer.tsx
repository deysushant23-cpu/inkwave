'use client';

import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { ShieldCheck, Truck, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen, items, removeItem, updateQuantity } = useCartStore();
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    router.push('/checkout');
  };

  const handleExplore = () => {
    setCartDrawerOpen(false);
    router.push('/collections');
  };

  if (!isCartDrawerOpen) return null;

  return (
    <>
      <div className={`overlay ${isCartDrawerOpen ? 'open' : ''}`} onClick={() => setCartDrawerOpen(false)}></div>
      <div className={`drawer ${isCartDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h3 className="font-display uppercase tracking-tight">Your Bag</h3>
            <span className="text-[10px] font-mono text-neutral-400">({items.length})</span>
          </div>
          <button className="drawer-close" onClick={() => setCartDrawerOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        {/* Free Express Shipping Callout Banner */}
        <div className="px-4 py-2 bg-neutral-900 border-b border-white/10 flex items-center justify-between font-mono text-[11px] text-neutral-300">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Truck className="w-3.5 h-3.5" /> FREE EXPRESS DELIVERY
          </span>
          <span className="text-neutral-400">All India</span>
        </div>
        
        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="empty-cart flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-2">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="font-display text-lg uppercase font-bold text-white">
                Your bag is empty
              </div>
              <p className="font-mono text-xs text-neutral-400 max-w-xs">
                Check out our latest 240 GSM heavyweight drops and limited streetwear runs.
              </p>
              <button
                onClick={handleExplore}
                className="btn btn-primary px-6 py-3 font-mono text-xs uppercase font-bold tracking-wider inline-flex items-center gap-2 mt-2"
              >
                <span>Explore Drops</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            items.map((item, idx) => {
              const hues = [
                ["var(--tile-a)","var(--accent)"],
                ["var(--accent)","var(--tile-b)"],
                ["var(--tile-b)","var(--tile-a)"],
                ["var(--tile-a)","var(--tile-b)"],
              ];
              const hue = hues[idx % hues.length];
              
              return (
                <div key={item.id} className="d-item">
                  <div className="d-thumb">
                    {item.image_url ? (
                      <div className="absolute inset-0 z-[2]">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="ink-pattern" style={{ "--p1": hue[0], "--p2": hue[1], inset: "-30%" } as React.CSSProperties}></div>
                    )}
                  </div>
                  <div className="d-info">
                    <h4>{item.title}</h4>
                    <div className="d-meta">
                      {item.size ? `Size: ${item.size}` : 'Standard'}
                      {item.custom_print_metadata && (
                        <span className="block text-[var(--accent)] font-mono text-[9px] uppercase tracking-wider mt-1">
                          ● Custom Graphic Uploaded
                        </span>
                      )}
                    </div>

                    <div className="d-row">
                      <div className="qty">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} aria-label="Decrease quantity">&minus;</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <div className="d-price">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                    <button className="d-remove" onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="subtotal-row">
              <span className="font-mono text-xs uppercase text-neutral-400">Subtotal</span>
              <span className="font-mono text-sm font-bold text-white">{formatPrice(subtotal)}</span>
            </div>
            <div className="subtotal-row total">
              <span className="font-mono text-sm font-bold uppercase text-white">Total</span>
              <span className="font-mono text-lg font-black text-white">{formatPrice(subtotal)}</span>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleCheckout} 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-400 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Encrypted & Secure • UPI / COD / Cards</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


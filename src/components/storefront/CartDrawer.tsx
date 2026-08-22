'use client';

import { useCartStore } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { isCartDrawerOpen, setCartDrawerOpen, items, removeItem, updateQuantity } = useCartStore();
  const router = useRouter();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    setCartDrawerOpen(false);
    router.push('/checkout');
  };

  if (!isCartDrawerOpen) return null;

  return (
    <>
      <div className={`overlay ${isCartDrawerOpen ? 'open' : ''}`} onClick={() => setCartDrawerOpen(false)}></div>
      <div className={`drawer ${isCartDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-head">
          <h3>Your bag</h3>
          <button className="drawer-close" onClick={() => setCartDrawerOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
        
        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              Your bag is empty.<br/>Time to fix that.
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
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="subtotal-row total">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button className="btn btn-primary" onClick={handleCheckout} style={{ width: '100%', justifyContent: 'center' }}>
              Checkout
            </button>
            <div className="ship-note">Shipping calculated at next step</div>
          </div>
        )}
      </div>
    </>
  );
}

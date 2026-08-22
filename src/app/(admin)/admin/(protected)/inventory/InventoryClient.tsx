'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RefreshCw, Search, AlertTriangle, Plus, Minus } from 'lucide-react';

import { toast } from 'sonner';
import { adjustInventoryAction } from '@/app/actions/admin';

export default function InventoryClient({ initialVariants }: { initialVariants: any[] }) {
  const [variants, setVariants] = useState<any[]>(initialVariants);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<string | null>(null);

  const adjustStock = async (variantId: string, delta: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + delta);
    setAdjusting(variantId);
    
    // Optimistic Update
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock_quantity: newStock } : v));
    
    const result = await adjustInventoryAction(variantId, newStock);
    
    if (!result.success) {
      toast.error(result.error || 'Failed to adjust stock');
      // Revert Optimistic
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, stock_quantity: currentStock } : v));
    }
    
    setAdjusting(null);
  };

  const filtered = variants.filter(v =>
    !search ||
    (v.products?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = variants.filter(v => (v.stock_quantity - (v.reserved_stock || 0)) <= 5).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>Inventory</h1>
          <p style={{ color: 'var(--text-dim)' }}>Stock levels and quick adjustments for all variants.</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              {lowStockCount} Low Stock
            </div>
          )}
          <button onClick={() => window.location.reload()} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--line)', color: 'var(--text-dim)' }}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-dim)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by product or SKU..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none"
          style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1.5px solid var(--line)' }}
        />
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Product</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">SKU</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Size</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Color</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stock</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Reserved</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Available</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Adjust Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>
                    No variants found. Add products and variants first.
                  </td>
                </tr>
              ) : filtered.map(v => {
                const available = v.stock_quantity - (v.reserved_stock || 0);
                const isLow = available <= 5;
                const isOut = available <= 0;
                return (
                  <tr key={v.id} className="border-t transition-opacity hover:opacity-80" style={{ borderColor: 'var(--line)' }}>
                    <td className="px-6 py-4 font-semibold" style={{ color: 'var(--text)' }}>
                      {v.products?.title || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>{v.sku}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text)' }}>{v.size}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text)' }}>{v.color || '—'}</td>
                    <td className="px-6 py-4">
                      {v.stock_quantity}
                    </td>
                    <td className="px-6 py-4 text-amber-600 font-semibold">
                      {v.reserved_stock || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold px-2 py-1 rounded-lg text-xs ${
                        isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {isOut ? 'OUT' : isLow ? `LOW: ${available}` : available}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => adjustStock(v.id, -1, v.stock_quantity)}
                          disabled={adjusting === v.id || v.stock_quantity === 0}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-30 transition-opacity"
                          style={{ background: 'var(--bg-alt)', color: 'var(--text)' }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                          {v.stock_quantity}
                        </span>
                        <button
                          onClick={() => adjustStock(v.id, 1, v.stock_quantity)}
                          disabled={adjusting === v.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-30 transition-opacity"
                          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

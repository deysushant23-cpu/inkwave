'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, 
  Eye, 
  RefreshCw, 
  Search, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  ChevronRight, 
  X,
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  loyalty_points: number | null;
  fit_preferences: any;
  created_at: string | null;
  // Computed CRM fields
  total_spent: number;
  orders_count: number;
  last_order_date: string | null;
  orders: any[];
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'ALL' | 'VIP' | 'ACTIVE' | 'NEW'>('ALL');
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile | null>(null);
  const supabase = createClient();

  const fetchCRMData = async () => {
    setLoading(true);
    try {
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('id, user_id, total_amount, status, payment_status, created_at, shipping_address').order('created_at', { ascending: false })
      ]);

      const profiles = (profilesRes.data as any[]) || [];
      const orders = (ordersRes.data as any[]) || [];

      // Group orders by user_id
      const ordersByUser = new Map<string, any[]>();
      orders.forEach(order => {
        if (!order.user_id) return;
        const list = ordersByUser.get(order.user_id) || [];
        list.push(order);
        ordersByUser.set(order.user_id, list);
      });

      // Compute CRM metrics per profile
      const enriched: CustomerProfile[] = profiles.map(profile => {
        const userOrders = ordersByUser.get(profile.id) || [];
        const nonCancelled = userOrders.filter(o => o.status !== 'CANCELLED');
        const totalSpent = nonCancelled.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        const lastOrder = userOrders.length > 0 ? userOrders[0].created_at : null;

        return {
          ...profile,
          total_spent: totalSpent,
          orders_count: userOrders.length,
          last_order_date: lastOrder,
          orders: userOrders
        };
      });

      setCustomers(enriched);
    } catch (err) {
      console.error('Failed to fetch CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, []);

  // Summary Metrics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeBuyers = customers.filter(c => c.orders_count > 0).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
    const avgLtv = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
    const vipCount = customers.filter(c => c.total_spent >= 3000 || c.orders_count >= 3).length;

    return { totalCustomers, activeBuyers, totalRevenue, avgLtv, vipCount };
  }, [customers]);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = !search ||
        (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search) ||
        (c.id || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedSegment === 'VIP') return c.total_spent >= 3000 || c.orders_count >= 3;
      if (selectedSegment === 'ACTIVE') return c.orders_count > 0;
      if (selectedSegment === 'NEW') return c.orders_count === 0;

      return true;
    });
  }, [customers, search, selectedSegment]);

  const getTier = (c: CustomerProfile) => {
    if (c.total_spent >= 5000 || c.orders_count >= 5) {
      return { label: 'DIAMOND VIP', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    }
    if (c.total_spent >= 2000 || c.orders_count >= 2) {
      return { label: 'GOLD BUYER', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    }
    if (c.orders_count >= 1) {
      return { label: 'CUSTOMER', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
    return { label: 'PROSPECT', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
  };

  const getWhatsAppLink = (phone: string | null, name: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = '91' + clean;
    const msg = encodeURIComponent(`Hi ${name || 'there'}! Greetings from InkWave. How can we assist you with your streetwear collection today?`);
    return `https://wa.me/${clean}?text=${msg}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              CRM & Customer Intelligence
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-purple-500/15 text-purple-400 border border-purple-500/20">
              Live Engine
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-dim)' }}>
            Track customer lifetime value (LTV), order frequency, retention, and direct outreach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCRMData} 
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all hover:bg-white/5 active:scale-95"
            style={{ borderColor: 'var(--line)', color: 'var(--text)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync CRM
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border bg-black/40 backdrop-blur-md" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Total Audience</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black mt-2 font-display" style={{ color: 'var(--text)' }}>
            {stats.totalCustomers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Registered customer accounts
          </div>
        </div>

        <div className="p-5 rounded-3xl border bg-black/40 backdrop-blur-md" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Active Buyers</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black mt-2 font-display text-emerald-400">
            {stats.activeBuyers}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            {stats.totalCustomers > 0 ? Math.round((stats.activeBuyers / stats.totalCustomers) * 100) : 0}% conversion rate
          </div>
        </div>

        <div className="p-5 rounded-3xl border bg-black/40 backdrop-blur-md" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Audience LTV</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black mt-2 font-display" style={{ color: 'var(--text)' }}>
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Avg {formatPrice(stats.avgLtv)} per profile
          </div>
        </div>

        <div className="p-5 rounded-3xl border bg-black/40 backdrop-blur-md" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">VIP Club</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black mt-2 font-display text-purple-400">
            {stats.vipCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">
            High value recurring spenders
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, or customer ID..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-all"
            style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1.5px solid var(--line)' }}
          />
        </div>

        {/* Segments Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border bg-black/40 w-full md:w-auto overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
          {(['ALL', 'VIP', 'ACTIVE', 'NEW'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedSegment(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedSegment === tab 
                  ? 'bg-[var(--accent)] text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'ALL' ? `All (${customers.length})` :
               tab === 'VIP' ? `VIP (${stats.vipCount})` :
               tab === 'ACTIVE' ? `Active (${stats.activeBuyers})` :
               `New Leads (${customers.length - stats.activeBuyers})`}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Intelligence Table */}
      <div className="rounded-3xl border overflow-hidden shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }}>
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Customer</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Segment</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Lifetime Value</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Orders</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Loyalty</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Quick Contact</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[var(--accent)]" />
                    Loading customer intelligence data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-zinc-500">
                    No customers match your search filters.
                  </td>
                </tr>
              ) : filtered.map(c => {
                const tier = getTier(c);
                const waLink = getWhatsAppLink(c.phone, c.full_name);

                return (
                  <tr 
                    key={c.id} 
                    onClick={() => setActiveCustomer(c)}
                    className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    {/* Customer Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shrink-0">
                          {(c.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
                            {c.full_name || 'Anonymous Guest'}
                            {c.role === 'super_admin' && (
                              <span title="Super Admin">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                            {c.phone || <span className="italic text-zinc-600">No phone</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Segment Tier Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${tier.color}`}>
                        {tier.label}
                      </span>
                    </td>

                    {/* Lifetime Value */}
                    <td className="px-6 py-4">
                      <div className="font-bold font-mono" style={{ color: c.total_spent > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                        {formatPrice(c.total_spent)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {c.orders_count > 0 ? `Avg ${formatPrice(Math.round(c.total_spent / c.orders_count))}/order` : 'No orders yet'}
                      </div>
                    </td>

                    {/* Orders Count */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 font-bold text-xs" style={{ color: 'var(--text)' }}>
                        <ShoppingBag className="w-3 h-3 text-[var(--accent)]" />
                        {c.orders_count} {c.orders_count === 1 ? 'order' : 'orders'}
                      </div>
                      {c.last_order_date && (
                        <div className="text-[10px] text-zinc-500 mt-1">
                          Last: {new Date(c.last_order_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Loyalty Points */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 font-bold text-amber-400 text-xs">
                        <Award className="w-3.5 h-3.5" />
                        {c.loyalty_points || 0} pts
                      </div>
                    </td>

                    {/* Direct Contact */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      {waLink ? (
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>

                    {/* Action View */}
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-xl text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      {activeCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full bg-[#111113] border-l border-white/10 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-xl">
                    {(activeCustomer.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      {activeCustomer.full_name || 'Anonymous Guest'}
                    </h2>
                    <p className="text-xs font-mono text-zinc-400">
                      ID: {activeCustomer.id}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveCustomer(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Overview Card */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Spent</span>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{formatPrice(activeCustomer.total_spent)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Orders</span>
                  <p className="text-lg font-black text-white mt-0.5">{activeCustomer.orders_count}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Loyalty Pts</span>
                  <p className="text-lg font-black text-amber-400 mt-0.5">{activeCustomer.loyalty_points || 0}</p>
                </div>
              </div>

              {/* Contact & Address Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Contact & Info</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Phone className="w-4 h-4 text-purple-400" />
                      <span>{activeCustomer.phone || 'No phone recorded'}</span>
                    </div>
                    {activeCustomer.phone && (
                      <a 
                        href={getWhatsAppLink(activeCustomer.phone, activeCustomer.full_name) || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-zinc-300">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-zinc-200">Delivery Profile Address</p>
                      <p className="text-zinc-400 mt-0.5">
                        {(activeCustomer.fit_preferences as any)?.address || 
                         (activeCustomer.orders[0]?.shipping_address?.street ? 
                          `${activeCustomer.orders[0]?.shipping_address?.street}, ${activeCustomer.orders[0]?.shipping_address?.city || ''} ${activeCustomer.orders[0]?.shipping_address?.zip || ''}` : 
                          'No saved address')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-zinc-400">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>Joined: {activeCustomer.created_at ? new Date(activeCustomer.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Order History Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>Order History ({activeCustomer.orders.length})</span>
                </h3>

                {activeCustomer.orders.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 rounded-2xl border border-dashed border-white/10 text-xs">
                    This customer hasn't placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {activeCustomer.orders.map(order => (
                      <div key={order.id} className="p-3.5 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-white">#{order.id.slice(0, 8)}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300">
                              {order.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-white block">
                            {formatPrice(order.total_amount)}
                          </span>
                          <span className={`text-[10px] font-bold ${order.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-3">
              {activeCustomer.phone && (
                <a
                  href={getWhatsAppLink(activeCustomer.phone, activeCustomer.full_name) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Chat on WhatsApp
                </a>
              )}
              <button
                onClick={() => setActiveCustomer(null)}
                className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

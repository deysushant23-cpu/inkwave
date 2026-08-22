import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  ShoppingBag, Users, TrendingUp, Package,
  ArrowUpRight
} from 'lucide-react';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const supabase = await createAdminClient();

  const [ordersRes, profilesRes] = await Promise.all([
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id'),
  ]);

  const orders = (ordersRes.data as any[]) || [];
  const profiles = (profilesRes.data as any[]) || [];

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.order_status === 'ORDER_PLACED').length;

  const stats = {
    totalOrders: orders.length,
    totalRevenue,
    totalCustomers: profiles.length,
    pendingOrders,
    recentOrders: orders.slice(0, 6),
  };

  const statCards = [
    {
      label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'
    },
    {
      label: 'Total Orders', value: stats.totalOrders,
      icon: ShoppingBag, color: 'var(--accent)', bg: 'rgba(255,158,187,0.1)'
    },
    {
      label: 'Customers', value: stats.totalCustomers,
      icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'
    },
    {
      label: 'Pending Orders', value: stats.pendingOrders,
      icon: Package, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'
    },
  ];

  const statusColors: Record<string, string> = {
    ORDER_PLACED: 'bg-blue-100 text-blue-700',
    IN_FULFILLMENT: 'bg-amber-100 text-amber-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    RETURNED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };

  // We can use a Server Action for the refresh button
  async function refreshDashboard() {
    'use server';
    revalidatePath('/admin');
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-dim)' }}>Welcome back. Here is what is happening with your store.</p>
        </div>
        <form action={refreshDashboard}>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-80 border"
            style={{ borderColor: 'var(--line)', color: 'var(--text-dim)' }}
          >
            Refresh
          </button>
        </form>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-3xl p-6 border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>{label}</p>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <p className="font-display text-3xl font-extrabold" style={{ color: 'var(--text)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Add Product', href: '/admin/catalog', icon: '📦' },
          { label: 'New Category', href: '/admin/categories', icon: '🏷️' },
          { label: 'Set Banner', href: '/admin/cms', icon: '🖼️' },
          { label: 'View Orders', href: '/admin/orders', icon: '🛍️' },
        ].map(({ label, href, icon }) => (
          <Link
            key={label}
            href={href}
            className="block rounded-3xl p-5 border text-left hover:scale-105 transition-transform font-semibold"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--line)', color: 'var(--text)' }}
          >
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-sm">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
          <h2 className="font-display text-lg font-bold" style={{ color: 'var(--text)' }}>Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }}>
              <tr>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Order ID</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-3 font-semibold uppercase tracking-wider text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>No orders yet.</td></tr>
              ) : stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-t hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-6 py-4 font-mono font-bold" style={{ color: 'var(--text)' }}>
                    {order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 font-bold" style={{ color: 'var(--accent)' }}>
                    ${(order.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[order.order_status] || 'bg-gray-100 text-gray-500'}`}>
                      {order.order_status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

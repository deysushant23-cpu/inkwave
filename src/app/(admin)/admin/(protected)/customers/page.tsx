'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Eye, RefreshCw, Search } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setCustomers((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c =>
    !search ||
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-700',
      store_ops: 'bg-blue-100 text-blue-700',
      content_mgr: 'bg-amber-100 text-amber-700',
      user: 'bg-gray-100 text-gray-500',
    };
    return map[role] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text)' }}>Customers</h1>
          <p style={{ color: 'var(--text-dim)' }}>Registered users and their loyalty data.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl px-4 py-2 text-sm font-bold" style={{ background: 'var(--bg-card)', color: 'var(--accent)', border: '1.5px solid var(--line)' }}>
            {customers.length} Total
          </div>
          <button onClick={fetchCustomers} disabled={loading}
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
          placeholder="Search by name or phone..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm focus:outline-none"
          style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1.5px solid var(--line)' }}
        />
      </div>

      <div className="rounded-3xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--line)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: 'var(--bg-alt)', color: 'var(--text-dim)' }}>
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Phone</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Address</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Loyalty Pts</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center" style={{ color: 'var(--text-dim)' }}>No customers found.</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-t hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--line)' }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: 'var(--accent)', color: 'var(--bg)' }}>
                        {(c.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>{c.full_name || 'Anonymous'}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>{c.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs" style={{ color: 'var(--text-dim)' }}>{c.phone || '—'}</td>
                  <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                    <div className="truncate max-w-[150px]" title={(c as any).fit_preferences?.address || '—'}>
                      {(c as any).fit_preferences?.address || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${roleBadge((c as any).role)}`}>
                      {((c as any).role || 'user').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold" style={{ color: 'var(--text)' }}>{c.loyalty_points || 0}</td>
                  <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-dim)' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
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

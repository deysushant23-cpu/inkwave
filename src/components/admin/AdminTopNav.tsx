'use client';
import { Search, Bell, Grid3X3, Package, Store, Users, X, ShoppingBag, Menu } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUiStore } from '@/store/useUiStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function AdminTopNav() {
  const { toggleAdminSidebar } = useUiStore();
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const notifsRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders-notification');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNewOrdersCount(data.newOrdersCount || 0);
          if (data.latestOrders) {
            setNotifications(data.latestOrders);
          }
        }
      }
    } catch {
      // Non-blocking fetch
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);

    const supabase = createClient();
    const channel = supabase
      .channel('admin-top-orders-notifier')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setIsAppsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  };

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-20 bg-[var(--bg-card)] border-b border-[var(--line)] flex justify-between items-center px-4 md:px-8 z-40 shadow-sm shadow-[var(--accent)]/5">
      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Toggle Menu Button on Mobile */}
        <button 
          onClick={toggleAdminSidebar}
          className="md:hidden text-[var(--text-dim)] hover:text-[var(--text)] transition-colors p-2 cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          <input className="bg-[var(--bg-alt)] border-none rounded-full pl-10 pr-6 py-2 w-40 sm:w-80 font-mono text-[12px] font-semibold tracking-[0.15em] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-[var(--text)]" placeholder="SEARCH SYSTEM..." type="text"/>
        </div>
      </div>
      <div className="flex items-center space-x-6">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifsRef}>
          <button 
            onClick={() => { setIsNotifsOpen(!isNotifsOpen); setIsAppsOpen(false); }}
            className={`relative transition-colors cursor-pointer ${isNotifsOpen ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--accent)]'}`}
          >
            <Bell className="w-6 h-6" />
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
              </span>
            )}
          </button>
          
          {isNotifsOpen && (
            <div className="absolute right-0 mt-4 w-84 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-[var(--line)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold uppercase tracking-widest text-sm text-[var(--text)]">Notifications</h3>
                  {newOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white animate-pulse">
                      {newOrdersCount} PENDING
                    </span>
                  )}
                </div>
                <button onClick={() => setIsNotifsOpen(false)} className="text-[var(--text-dim)] hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-[var(--line)]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--text-dim)] font-mono">
                    No recent order notifications
                  </div>
                ) : (
                  notifications.map((order) => {
                    const isNew = order.order_status === 'ORDER_PLACED';
                    return (
                      <Link 
                        key={order.id} 
                        href="/admin/orders"
                        onClick={() => setIsNotifsOpen(false)}
                        className={`p-4 block hover:bg-[var(--bg-alt)] transition-colors cursor-pointer ${isNew ? 'bg-rose-500/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <h4 className="font-bold text-xs text-[var(--text)]">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text-dim)]">
                            {formatRelativeTime(order.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-dim)]">
                          {order.profiles?.full_name ? `${order.profiles.full_name} • ` : ''}
                          <span className="font-bold text-[var(--text)]">{formatPrice(order.total_amount)}</span>
                        </p>
                        <span className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                          isNew ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {order.order_status.replace(/_/g, ' ')}
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
              <div className="p-3 border-t border-[var(--line)] bg-[var(--bg-alt)] text-center">
                <Link 
                  href="/admin/orders"
                  onClick={() => setIsNotifsOpen(false)}
                  className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest hover:underline block"
                >
                  View All Orders →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Apps Dropdown */}
        <div className="relative" ref={appsRef}>
          <button 
            onClick={() => { setIsAppsOpen(!isAppsOpen); setIsNotifsOpen(false); }}
            className={`transition-colors cursor-pointer ${isAppsOpen ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--accent)]'}`}
          >
            <Grid3X3 className="w-6 h-6" />
          </button>
          
          {isAppsOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-[var(--bg-card)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-[var(--line)]">
                <h3 className="font-display font-bold uppercase tracking-widest text-sm">Quick Links</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <Link href="/admin/catalog" onClick={() => setIsAppsOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--bg-alt)] border border-transparent hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group">
                  <Package className="w-6 h-6 mb-2 text-[var(--text-dim)] group-hover:text-[var(--accent)]" />
                  <span className="text-xs font-bold uppercase">Products</span>
                </Link>
                <Link href="/admin/customers" onClick={() => setIsAppsOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--bg-alt)] border border-transparent hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group">
                  <Users className="w-6 h-6 mb-2 text-[var(--text-dim)] group-hover:text-[var(--accent)]" />
                  <span className="text-xs font-bold uppercase">Users</span>
                </Link>
                <Link href="/" className="col-span-2 flex flex-col items-center justify-center p-4 rounded-xl bg-[var(--accent)] text-black hover:opacity-90 transition-opacity">
                  <Store className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold uppercase">Live Storefront</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-[var(--line)]"></div>
        <div className="flex items-center space-x-3 text-right">
          <div className="flex flex-col">
            <span className="font-mono text-[12px] font-semibold tracking-[0.15em] uppercase text-[var(--text)]">
              {user ? user.email?.split('@')[0] || 'SUPER ADMIN' : 'SUPER ADMIN'}
            </span>
            {user && (
              <span className="text-[10px] text-[var(--text-dim)] font-mono">{user.email || user.phone}</span>
            )}
          </div>
          <div className="rounded-full border-2 border-[var(--accent)] flex items-center justify-center overflow-hidden w-11 h-11 bg-black text-white font-bold">
            {user ? user.email?.charAt(0).toUpperCase() || 'A' : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
}

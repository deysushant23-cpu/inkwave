'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LogOut, LayoutDashboard, ShoppingCart, Package, Tags, 
  Boxes, Users, PlaySquare, 
  Settings, Store, FileText, Sparkles, LayoutTemplate, Star, Mail, Layers, Clock, Receipt
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUiStore } from '@/store/useUiStore';
import { X } from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const { adminSidebarOpen, setAdminSidebarOpen } = useUiStore();

  const fetchOrderNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders-notification');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNewOrdersCount(data.newOrdersCount || 0);
        }
      }
    } catch {
      // Non-blocking fetch
    }
  }, []);

  useEffect(() => {
    fetchOrderNotifications();

    // Poll every 12 seconds
    const interval = setInterval(fetchOrderNotifications, 12000);

    // Setup Supabase Realtime for instant notification on new order placement
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders-notifier')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        () => {
          fetchOrderNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        () => {
          fetchOrderNotifications();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [fetchOrderNotifications]);

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { 
      href: '/admin/orders', 
      label: 'Orders', 
      icon: ShoppingCart,
      hasBlinkingBadge: newOrdersCount > 0,
      badgeCount: newOrdersCount
    },
    { href: '/admin/orders?tab=billing', label: 'Billing & Invoices', icon: Receipt },
    { href: '/admin/catalog', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/cms-categories', label: 'Categories Strip', icon: Layers },
    { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/reviews', label: 'Reviews', icon: Star },
    { href: '/admin/storefront-manage', label: 'Storefront Manage', icon: LayoutTemplate },
    { href: '/admin/homepage', label: 'New Home Banner', icon: Store },
    { href: '/admin/requested-prints', label: 'Requested Prints', icon: Sparkles },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { href: '/admin/cms-upcoming-drop', label: 'Upcoming Drop', icon: Clock },
    { href: '/admin/cms-pages', label: 'Footer Docs', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {adminSidebarOpen && (
        <div 
          onClick={() => setAdminSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300" 
        />
      )}

      <aside
        className={`h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50 shadow-lg transition-transform duration-300 md:translate-x-0 ${
          adminSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'var(--bg-card)', borderRight: '1.5px solid var(--line)' }}
      >
        {/* Close Button on Mobile */}
        <button 
          onClick={() => setAdminSidebarOpen(false)}
          className="md:hidden absolute top-5 right-5 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="px-6 mb-8">
          <Link href="/" className="block">
            <h1 className="font-sans text-2xl font-extrabold tracking-tighter" style={{ color: 'var(--text)' }}>
              INKWAVE
            </h1>
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="font-sans text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
              Admin Hub
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 custom-scrollbar">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setAdminSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl font-sans font-semibold text-sm transition-all duration-200 group ${
                  isActive 
                    ? 'bg-[var(--accent)] text-[var(--bg)] shadow-md shadow-[var(--accent)]/20' 
                    : 'text-[var(--text-dim)] hover:bg-[var(--line)] hover:text-[var(--text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{link.label}</span>
                </div>

                {/* Blinking Notify Motion for Orders */}
                {link.hasBlinkingBadge && (
                  <span className="relative flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-rose-500 opacity-80" />
                    <span className="relative inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>{link.badgeCount} NEW</span>
                    </span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-6 my-4" style={{ borderTop: '1px solid var(--line)' }} />

        {/* Go to Store */}
        <div className="px-3 mb-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-sans font-semibold text-sm transition-all text-[var(--text-dim)] hover:bg-[var(--line)] hover:text-[var(--text)]"
          >
            <Store className="w-5 h-5" />
            <span>View Store</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="px-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl font-sans font-semibold text-sm transition-all hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
            style={{ color: 'var(--text-dim)' }}
          >
            <LogOut className="w-5 h-5" />
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </aside>
    </>
  );
}

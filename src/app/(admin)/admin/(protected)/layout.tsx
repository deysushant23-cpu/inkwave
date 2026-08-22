import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopNav from '@/components/admin/AdminTopNav';
import AdminThemeManager from '@/components/admin/AdminThemeManager';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { verifyAdmin } from '@/lib/admin';

export const metadata = {
  title: 'Inkwave Admin | Hub',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await verifyAdmin();
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : 'Unauthorized';
    redirect(`/admin/login?error=${encodeURIComponent(msg)}`);
  }

  return (
    <div className="min-h-screen flex font-body" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminThemeManager />
      <AdminSidebar />
      <AdminTopNav />
      <main className="ml-0 md:ml-64 pt-20 flex-1 relative min-h-screen">
        {children}
      </main>
    </div>
  );
}

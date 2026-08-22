import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import MobileDock from "@/components/storefront/MobileDock";
import CartDrawer from "@/components/storefront/CartDrawer";
import AuthModal from "@/components/ui/AuthModal";
import SupportChatHub from "@/components/storefront/SupportChatHub";
import { createClient } from '@/lib/supabase/server';

import WishlistGlobalSync from "./WishlistGlobalSync";
import MaintenanceScreen from "@/components/storefront/MaintenanceScreen";
import SmoothScroll from "@/components/storefront/SmoothScroll";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const [catRes, themeRes, settingsRes] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true }),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'theme_config').single(),
    (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'store_settings').single()
  ]);

  const isMaintenanceMode = settingsRes.data?.json_content?.maintenance_mode === true;
  const printLabShowInHeader = settingsRes.data?.json_content?.print_lab_show_in_header !== false;
  let isAdmin = false;

  if (isMaintenanceMode) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await (supabase.from('profiles') as any).select('role').eq('id', user.id).single();
      isAdmin = ['super_admin', 'store_ops'].includes((profile as any)?.role || '');
    }
  }

  let categories = catRes.data as any[] || [];

  const theme = themeRes.data?.json_content || {};

  return (
    <>
      {theme && (
        <style dangerouslySetInnerHTML={{ __html: `
          :root, [data-theme], html, body {
            ${theme.accent ? `--accent: ${theme.accent} !important;` : ''}
            ${theme.bg ? `--bg: ${theme.bg} !important;` : ''}
            ${theme.bgAlt ? `--bg-alt: ${theme.bgAlt} !important;` : ''}
            ${theme.bgCard ? `--bg-card: ${theme.bgCard} !important;` : ''}
            ${theme.text ? `--text: ${theme.text} !important;` : ''}
            ${theme.textDim ? `--text-dim: ${theme.textDim} !important;` : ''}
            ${theme.line ? `--line: ${theme.line} !important;` : ''}
          }
        `}} />
      )}
      
      {isMaintenanceMode && !isAdmin ? (
        <MaintenanceScreen />
      ) : (
        <>
          {isMaintenanceMode && isAdmin && (
            <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-xs font-bold uppercase tracking-widest py-1.5 text-center z-[9999] shadow-md flex justify-center items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Maintenance Mode Active — You are bypassing the lock as an Admin
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </div>
          )}
          <WishlistGlobalSync />
          <SmoothScroll>
            <Header categories={categories} showPrintLab={printLabShowInHeader} />
            <main className="w-full max-w-full overflow-x-hidden relative">
              {children}
            </main>
            <Footer categories={categories} />
          </SmoothScroll>
          <MobileDock showPrintLab={printLabShowInHeader} />
          <CartDrawer />
          <SupportChatHub />
          <AuthModal />
        </>
      )}
    </>
  );
}


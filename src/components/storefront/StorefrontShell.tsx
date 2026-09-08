import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";
import MobileDock from "@/components/storefront/MobileDock";
import CartDrawer from "@/components/storefront/CartDrawer";
import AuthModal from "@/components/ui/AuthModal";
import SupportChatHub from "@/components/storefront/SupportChatHub";
import { createClient } from '@/lib/supabase/server';


interface StorefrontShellProps {
  children: React.ReactNode;
  categories?: any[];
  theme?: any;
}

export default async function StorefrontShell({
  children,
  categories: passedCategories,
  theme: passedTheme,
}: StorefrontShellProps) {
  let categories = passedCategories;
  let theme = passedTheme;

  // Only query database if not pre-fetched by parent page
  if (!categories || !theme) {
    const supabase = await createClient();
    const [catRes, themeRes] = await Promise.all([
      !categories ? supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true }) : Promise.resolve({ data: categories }),
      !theme ? (supabase.from('cms_sections') as any).select('json_content').eq('section_key', 'theme_config').single() : Promise.resolve({ data: { json_content: theme } })
    ]);

    if (!categories) {
      categories = (catRes.data as any[]) || [];
    }
    if (!theme) {
      theme = themeRes.data?.json_content || {};
    }
  }

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
      <Header categories={categories} />
      <main className="w-full max-w-full overflow-x-hidden relative">
        {children}
      </main>
      <Footer categories={categories} />
      <MobileDock />
      <CartDrawer />
      <SupportChatHub />
      <AuthModal />
    </>
  );
}


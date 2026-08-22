import { createAdminClient } from '@/lib/supabase/server';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'isomorphic-dompurify';
import OrderTracker from '@/components/storefront/OrderTracker';

export const revalidate = 60; // Cache pages and revalidate at most once every minute

export async function generateStaticParams() {
  const supabase = await createAdminClient();
  const { data } = await (supabase.from('cms_sections') as any)
    .select('section_key');

  if (!data) return [{ slug: 'track-order' }];

  const slugs = data
    .filter((s: any) => s.section_key && s.section_key.startsWith('page_'))
    .map((s: any) => ({
      slug: s.section_key.replace('page_', ''),
    }));

  // Ensure track-order is always compiled
  slugs.push({ slug: 'track-order' });

  return slugs;
}

export default async function DynamicFooterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Handle dedicated interactive Track Order page
  if (slug === 'track-order') {
    return (
      <div className="pt-32 sm:pt-40 pb-24 min-h-screen">
        <div className="wrap px-4 sm:px-6">
          <OrderTracker />
        </div>
      </div>
    );
  }

  const supabase = await createAdminClient();

  const { data: pageData, error } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', `page_${slug}`)
    .single();

  if (error || !pageData || !pageData.json_content) {
    return (
      <div className="pt-40 md:pt-48 pb-24 min-h-screen">
        <div className="wrap">
          <div className="max-w-3xl mx-auto text-center py-20 glass-panel rounded-2xl border border-[var(--line)]">
            <h1 className="font-display text-4xl font-bold mb-6 text-[var(--text)] uppercase tracking-wider">
              {slug.split('-').join(' ')}
            </h1>
            <div className="inline-block px-4 py-1 rounded-full bg-[var(--text)] text-[var(--bg)] font-bold text-xs tracking-widest mb-6">
              UNDER CONSTRUCTION
            </div>
            <p className="text-[var(--text-dim)] max-w-md mx-auto">
              This page is currently being updated by the Inkwave Studio team. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { title, content } = pageData.json_content;

  return (
    <>
      <div className="pt-40 md:pt-48 pb-24 min-h-screen bg-radial from-[rgba(255,255,255,0.01)] to-transparent">
        <div className="wrap px-4 sm:px-6">
          <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-2xl border border-[var(--line)] backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60"></div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-10 text-[var(--text)] uppercase tracking-wider">
              {title || 'Untitled Page'}
            </h1>
            
            <div className="prose prose-invert prose-lg max-w-none prose-p:text-[var(--text-dim)] prose-a:text-[var(--accent)] hover:prose-a:text-[var(--text)] prose-headings:font-display prose-headings:text-[var(--text)] prose-strong:text-[var(--text)] prose-li:text-[var(--text-dim)]">
              {content ? (
                content.includes('<') && content.includes('>') ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
                ) : (
                  <ReactMarkdown>{content}</ReactMarkdown>
                )
              ) : (
                <p>No content provided yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

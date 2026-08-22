import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from './NewsletterForm';
import { Category } from '@/types/database';
import { createClient } from '@/lib/supabase/server';

export default async function Footer({ categories = [] }: { categories?: Category[] }) {
  const supabase = await createClient();
  const { data } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'footer_config')
    .single();

  const columns = data?.json_content?.columns || [];

  const displayCategories = categories.filter(c => c.is_active !== false).slice(0, 4);

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="logo flex items-center mb-4 relative h-14 md:h-16 w-32">
              <Image 
                src="/logo.png" 
                alt="Inkwave Logo" 
                fill
                sizes="128px"
                className="object-contain object-left invert" 
              />
            </Link>
            <p>Premium menswear. Designed to move, built to hold its shape.</p>
            <NewsletterForm />
            <div className="mt-6 text-[12px] text-[var(--text-dim)] flex flex-col gap-1">
              <span className="font-bold text-[var(--text)] uppercase tracking-widest text-[10px]">Studio Address</span>
              <span className="font-mono">B/12 Sharmjivi Soc,</span>
              <span className="font-mono">Umra, Surat 395007</span>
            </div>
          </div>
          
          {columns.map((col: any, index: number) => (
            <div key={index} className="foot-col">
              <h5>{col.title}</h5>
              {col.links.map((link: any, linkIndex: number) => {
                const isExternal = link.url.startsWith('http');
                if (isExternal) {
                  return <a key={linkIndex} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>;
                }
                return <Link key={linkIndex} href={link.url}>{link.label}</Link>;
              })}
            </div>
          ))}
        </div>
        
        <div className="foot-bottom flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[var(--line)] pt-6 mt-16 text-[12px] text-[var(--text-dim)] font-mono">
          <div className="flex items-center gap-4">
            <span>&#169; 2026 Inkwave Studio. All rights reserved.</span>
          </div>
          <span>Visa &middot; Mastercard &middot; Amex &middot; Shop Pay</span>
        </div>
      </div>
    </footer>
  );
}

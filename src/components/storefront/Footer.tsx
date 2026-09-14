import Link from 'next/link';
import Image from 'next/image';
import NewsletterForm from './NewsletterForm';
import { Category } from '@/types/database';
import { createClient } from '@/lib/supabase/server';
import { Sparkles, MessageCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default async function Footer({ categories = [] }: { categories?: Category[] }) {
  const supabase = await createClient();
  const { data } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'footer_config')
    .single();

  const customColumns = data?.json_content?.columns;

  const allCategories = categories.filter(c => c.is_active !== false);

  const tshirtsCat = allCategories.find(c => {
    const s = (c.slug || '').toLowerCase();
    const n = (c.name || '').toLowerCase();
    return s.includes('t-shirt') || s.includes('tshirt') || s.includes('tee') || n.includes('t-shirt') || n.includes('tshirt') || n.includes('tee');
  });
  const tshirtsHref = tshirtsCat ? `/category/${tshirtsCat.slug}` : '/collections';

  const bottomsCat = allCategories.find(c => {
    const s = (c.slug || '').toLowerCase();
    const n = (c.name || '').toLowerCase();
    return s.includes('bottom') || s.includes('jean') || s.includes('pant') || s.includes('cargo') || s.includes('denim') || n.includes('bottom') || n.includes('jean') || n.includes('pant') || n.includes('cargo') || n.includes('denim');
  });
  const bottomsHref = bottomsCat ? `/category/${bottomsCat.slug}` : '/collections';

  const defaultColumns = [
    {
      title: 'Shop',
      links: [
        { label: 'All Collections', url: '/collections' },
        { label: 'T-Shirts & Oversized', url: tshirtsHref },
        { label: 'Bottoms & Denim', url: bottomsHref },
        { label: 'New Arrivals', url: '/showcase' },
        { label: '3D Custom Lab (₹600)', url: '/custom-print' },
      ]
    },
    {
      title: 'Help & Info',
      links: [
        { label: 'Size & Fit Guide', url: '/size-guide' },
        { label: 'Track My Order', url: '/track-order' },
        { label: 'Brand Pillars', url: '/brand-pillars' },
        { label: 'WhatsApp Support', url: 'https://wa.me/918160321453' },
      ]
    },
    {
      title: 'Policies',
      links: [
        { label: 'Shipping & Delivery', url: '/pages/shipping-policy' },
        { label: 'Returns & Size Exchange', url: '/pages/refund-policy' },
        { label: 'Privacy Policy', url: '/pages/privacy-policy' },
        { label: 'Terms of Service', url: '/pages/terms-and-conditions' },
      ]
    }
  ];

  const columns = Array.isArray(customColumns) && customColumns.length > 0 ? customColumns : defaultColumns;

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-24 md:pb-16 text-white overflow-hidden relative">
      <div className="wrap">
        
        {/* Top Trust Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/10 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">Free Express Delivery</h5>
              <p className="text-neutral-400 text-[11px]">Dispatched from Surat across India</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">Free Size Exchanges</h5>
              <p className="text-neutral-400 text-[11px]">7-day doorstep replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-white uppercase tracking-wider">240 GSM French Terry</h5>
              <p className="text-neutral-400 text-[11px]">100% Super-Combed Cotton Blanks</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Inkwave Logo" 
                  fill
                  sizes="32px"
                  className="object-contain invert brightness-200" 
                />
              </div>
              <span className="font-display text-2xl uppercase tracking-[0.1em] font-black text-white">
                INKWAVE
              </span>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed font-mono max-w-sm">
              Original streetwear built for people who don&apos;t blend in. Signature boxy drop-shoulder silhouettes and custom bespoke prints.
            </p>

            <div className="pt-2">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold mb-2">
                Join the Tribe
              </span>
              <NewsletterForm />
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-neutral-400">
              <a 
                href="https://instagram.com/inkwavefashion" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white flex items-center gap-1.5 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@inkwavefashion</span>
              </a>

              <a 
                href="https://wa.me/918160321453" 
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 transition-all"
                aria-label="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Care</span>
              </a>
            </div>
          </div>

          {/* Links Columns (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col: any, index: number) => (
              <div key={index} className="space-y-3">
                <h5 className="font-mono text-xs font-bold uppercase tracking-widest text-white border-b border-white/10 pb-2">
                  {col.title}
                </h5>
                <ul className="space-y-2 font-mono text-xs text-neutral-400">
                  {col.links.map((link: any, linkIndex: number) => {
                    const isExternal = link.url.startsWith('http');
                    if (isExternal) {
                      return (
                        <li key={linkIndex}>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hover:text-white transition-colors block py-0.5"
                          >
                            {link.label}
                          </a>
                        </li>
                      );
                    }
                    return (
                      <li key={linkIndex}>
                        <Link 
                          href={link.url}
                          className="hover:text-white transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="pt-10 mt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-neutral-500">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span>&copy; {new Date().getFullYear()} INKWAVE CLOTHING CO.</span>
            <span>&bull;</span>
            <span>Surat, Gujarat, India</span>
          </div>
          <div className="flex items-center gap-2">
            <span>UPI &bull; Razorpay &bull; Cards &bull; Cash on Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

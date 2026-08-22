import { getWishlistAction } from '@/app/actions/wishlist';
import { createAdminClient } from '@/lib/supabase/server';
import ProductCard from '@/components/storefront/ProductCard';
import Link from 'next/link';
import { HeartCrack } from 'lucide-react';
import WishlistClientSync from './WishlistClientSync';

export default async function WishlistPage() {
  const { wishlist, success } = await getWishlistAction();
  
  let products: any[] = [];
  
  if (success && wishlist && wishlist.length > 0) {
    const supabase = await createAdminClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', wishlist);
      
    if (data) {
      products = data;
    }
  }

  return (
    <div className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop min-h-screen">
      <WishlistClientSync initialWishlist={wishlist || []} />
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-12">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-[48px] uppercase leading-none text-[var(--text)]">
            Wishlist
          </h1>
          <p className="font-mono text-sm tracking-widest text-[var(--text)] opacity-60 mt-4 uppercase">
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Saved
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-[var(--line)] rounded-xl bg-black/20 backdrop-blur-md">
          <HeartCrack className="w-16 h-16 text-[var(--line)] mb-6" strokeWidth={1} />
          <h2 className="font-display text-2xl uppercase tracking-wider text-[var(--text)] mb-4">Nothing here yet</h2>
          <p className="font-mono text-sm text-[var(--text)] opacity-60 mb-8 max-w-md text-center">
            Your wishlist is looking a little empty. Go explore the drops and save your favorites.
          </p>
          <Link href="/showcase" className="px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-[var(--accent)] hover:text-black transition-colors" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
            Explore Showcase
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 items-start">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data: cats } = await supabase.from('categories').select('*');
  console.log('Categories:', cats);

  const jeansCat = cats.find(c => c.name.toLowerCase().includes('jean') || c.slug.toLowerCase().includes('jean'));
  console.log('Jeans category:', jeansCat);

  if (jeansCat) {
    const { data: products } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('category_id', jeansCat.id);
    
    console.log('Jeans products:');
    products.forEach(p => {
      console.log(`- ${p.title} (id: ${p.id}, slug: ${p.slug}): ${p.product_variants.length} variants:`, p.product_variants.map(v => `${v.size} (stock: ${v.stock_quantity})`).join(', '));
    });
  }
}

check().catch(console.error);

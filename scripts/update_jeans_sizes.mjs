import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: cats } = await supabase.from('categories').select('*');
  const jeansCat = cats.find(c => c.name.toLowerCase().includes('jean') || c.slug.toLowerCase().includes('jean'));
  
  if (!jeansCat) {
    console.error('Jeans category not found');
    return;
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('category_id', jeansCat.id);

  console.log(`Found ${products.length} jeans products.`);

  const jeansSizes = ['28', '30', '32', '34', '36'];

  for (const prod of products) {
    console.log(`\nProcessing product: ${prod.title} (slug: ${prod.slug})`);

    // Remove legacy variants if any
    const legacyVariants = prod.product_variants.filter(v => !jeansSizes.includes(v.size));
    if (legacyVariants.length > 0) {
      console.log(`Removing ${legacyVariants.length} legacy non-waist variants...`);
      for (const lv of legacyVariants) {
        await supabase.from('product_variants').delete().eq('id', lv.id);
      }
    }

    const { data: currentVariants } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', prod.id);

    const existingSizes = new Set((currentVariants || []).map(v => v.size));
    const prefix = prod.slug.toUpperCase().slice(0, 8);

    for (const sz of jeansSizes) {
      if (!existingSizes.has(sz)) {
        const payload = {
          product_id: prod.id,
          size: sz,
          sku: `${prefix}-${sz}-${Math.floor(100 + Math.random() * 900)}`,
          stock_quantity: 10,
          color: null,
          price_override: null
        };
        const { data: inserted, error } = await supabase.from('product_variants').insert(payload).select().single();
        if (error) {
          console.error(`Error inserting size ${sz}:`, error.message);
        } else {
          console.log(`Added variant size ${sz} for ${prod.title}`);
        }
      } else {
        console.log(`Size ${sz} already exists.`);
      }
    }
  }

  console.log('\nAll jeans sizes (28, 30, 32, 34, 36) updated successfully!');
}

run().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzzhakccqrmjouzcnor.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Fetching existing categories...');
  const { data: categories, error: fetchError } = await supabase.from('categories').select('*');
  if (fetchError) {
    console.error('Error fetching categories:', fetchError);
    return;
  }

  const targetCategories = [
    { name: 'T-shirt', slug: 't-shirt' },
    { name: 'shirt', slug: 'shirt' },
    { name: 'jeans', slug: 'jeans' },
    { name: 'combo', slug: 'combo' }
  ];

  console.log('Upserting target categories...');
  for (const cat of targetCategories) {
    const existing = categories.find(c => c.slug === cat.slug);
    if (existing) {
      await supabase.from('categories').update({ is_active: true, name: cat.name }).eq('id', existing.id);
    } else {
      await supabase.from('categories').insert([{ name: cat.name, slug: cat.slug, is_active: true }]);
    }
  }

  // Refetch to get all IDs
  const { data: updatedCategories } = await supabase.from('categories').select('*');
  const targetSlugs = targetCategories.map(c => c.slug);
  
  const categoriesToDelete = updatedCategories.filter(c => !targetSlugs.includes(c.slug));
  const defaultCategory = updatedCategories.find(c => c.slug === 't-shirt');

  if (categoriesToDelete.length > 0) {
    console.log(`Found ${categoriesToDelete.length} categories to remove/deactivate.`);
    for (const catToRemove of categoriesToDelete) {
      // Re-map products
      console.log(`Re-mapping products from ${catToRemove.slug} to default t-shirt`);
      await supabase.from('products').update({ category_id: defaultCategory.id }).eq('category_id', catToRemove.id);
      
      // Delete category
      console.log(`Deleting category: ${catToRemove.slug}`);
      await supabase.from('categories').delete().eq('id', catToRemove.id);
    }
  }

  console.log('Categories updated successfully!');
}

run();

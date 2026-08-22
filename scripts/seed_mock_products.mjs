import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzzhakccqrmjouzcnor.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const mockProducts = [
  {
    title: 'Slate Selvedge Denim',
    slug: 'slate-selvedge-denim',
    description: 'Relaxed fit jeans with a heavy graphite stone wash and subtle distressing.',
    base_price: 168.00,
    category_slug: 'jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Undertow Bomber Overshirt',
    slug: 'undertow-bomber-overshirt',
    description: 'A heavyweight button-down shirt that doubles as outerwear. Overdyed finish.',
    base_price: 228.00,
    category_slug: 'shirt',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Riptide Tee',
    slug: 'riptide-tee',
    description: 'Heavyweight cotton jersey with a vintage acid wash finish. Features dropped shoulders and a relaxed, boxy fit.',
    base_price: 48.00,
    category_slug: 't-shirt',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Static Crew Tee',
    slug: 'static-crew-tee',
    description: '300gsm heavy cotton t-shirt with a structured collar and drop shoulders.',
    base_price: 42.00,
    category_slug: 't-shirt',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Fathom Overshirt',
    slug: 'fathom-overshirt',
    description: 'Tactical button down overshirt with utility pockets.',
    base_price: 148.00,
    category_slug: 'shirt',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Monsoon Cargo Jeans',
    slug: 'monsoon-cargo-jeans',
    description: 'Technical denim cargo pants with articulated knees and utility pockets.',
    base_price: 138.00,
    category_slug: 'jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Ink Spill Graphic Tee',
    slug: 'ink-spill-graphic-tee',
    description: 'Oversized fit with a unique ink spill screenprint on the back.',
    base_price: 55.00,
    category_slug: 't-shirt',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    title: 'Midnight Rinse Denim',
    slug: 'midnight-rinse-denim',
    description: 'Clean, dark rinse selvedge jeans designed to break in over time.',
    base_price: 155.00,
    category_slug: 'jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?q=80&w=1000&auto=format&fit=crop',
  }
];

async function run() {
  console.log('Fetching existing categories...');
  let { data: categories, error: catError } = await supabase.from('categories').select('*');
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  
  if (!categories || categories.length === 0) {
    console.log('No categories found. Inserting default categories...');
    const defaultCats = [
      { name: 'Jeans', slug: 'jeans' },
      { name: 'Shirts', slug: 'shirt' },
      { name: 'T-Shirts', slug: 't-shirt' }
    ];
    const { error: insertError } = await supabase.from('categories').insert(defaultCats);
    if (insertError) console.error('Error inserting default categories:', insertError);
    
    // Refetch
    const { data: newCats, error: refetchError } = await supabase.from('categories').select('*');
    if (refetchError) console.error('Error refetching:', refetchError);
    categories = newCats;
  }
  
  console.log('Categories found:', categories.map(c => c.slug));

  const slugMap = {
    'jeans': categories.find(c => c.slug === 'jeans' || c.name.toLowerCase().includes('jean'))?.slug,
    'shirt': categories.find(c => c.slug === 'shirt' || c.slug === 'shirts' || c.name.toLowerCase().includes('shirt') && !c.name.toLowerCase().includes('t'))?.slug,
    't-shirt': categories.find(c => c.slug === 't-shirt' || c.slug === 't-shirts' || c.slug === 'tshirts' || c.name.toLowerCase().includes('t-shirt'))?.slug,
  };
  
  console.log('Slug Map:', slugMap);

  for (const product of mockProducts) {
    const mappedSlug = slugMap[product.category_slug] || product.category_slug;
    const category = categories.find(c => c.slug === mappedSlug);
    
    if (!category) {
      console.warn(`Category not found for slug: ${product.category_slug}. Skipping ${product.title}`);
      continue;
    }

    const payload = {
      title: product.title,
      slug: product.slug,
      description: product.description,
      base_price: product.base_price,
      category_id: category.id,
      is_drop: product.is_drop,
      overlay_mask_url: product.overlay_mask_url,
    };

    console.log(`Upserting ${product.title}...`);
    
    // Check if exists
    const { data: existing } = await supabase.from('products').select('id').eq('slug', product.slug).single();
    
    if (existing) {
      const { error } = await supabase.from('products').update(payload).eq('id', existing.id);
      if (error) console.error('Error updating:', error);
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) console.error('Error inserting:', error);
    }
  }
  
  console.log('Done!');
}

run();

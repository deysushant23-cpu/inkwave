import { Product, Category, ProductVariant } from '@/types/database';

export const mockCategories: any[] = [
  { id: 'cat_jeans', name: 'Jeans', slug: 'jeans', description: 'Premium ink-dyed denim.', is_active: true },
  { id: 'cat_shirts', name: 'Shirts', slug: 'shirts', description: 'Elevated button-downs and overshirts.', is_active: true },
  { id: 'cat_tshirts', name: 'T-Shirts', slug: 't-shirts', description: 'Heavyweight graphic and essential tees.', is_active: true }
];

export const mockProducts: any[] = [
  {
    id: 'prod_001',
    title: 'Slate Selvedge Denim',
    slug: 'slate-selvedge-denim',
    description: 'Relaxed fit jeans with a heavy graphite stone wash and subtle distressing.',
    base_price: 168.00,
    category_id: 'cat_jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_002',
    title: 'Undertow Bomber Overshirt',
    slug: 'undertow-bomber-overshirt',
    description: 'A heavyweight button-down shirt that doubles as outerwear. Overdyed finish.',
    base_price: 228.00,
    category_id: 'cat_shirts',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_003',
    title: 'Riptide Tee',
    slug: 'riptide-tee',
    description: 'Heavyweight cotton jersey with a vintage acid wash finish. Features dropped shoulders and a relaxed, boxy fit.',
    base_price: 48.00,
    category_id: 'cat_tshirts',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_004',
    title: 'Static Crew Tee',
    slug: 'static-crew-tee',
    description: '300gsm heavy cotton t-shirt with a structured collar and drop shoulders.',
    base_price: 42.00,
    category_id: 'cat_tshirts',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_005',
    title: 'Fathom Overshirt',
    slug: 'fathom-overshirt',
    description: 'Tactical button down overshirt with utility pockets.',
    base_price: 148.00,
    category_id: 'cat_shirts',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_006',
    title: 'Monsoon Cargo Jeans',
    slug: 'monsoon-cargo-jeans',
    description: 'Technical denim cargo pants with articulated knees and utility pockets.',
    base_price: 138.00,
    category_id: 'cat_jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_007',
    title: 'Ink Spill Graphic Tee',
    slug: 'ink-spill-graphic-tee',
    description: 'Oversized fit with a unique ink spill screenprint on the back.',
    base_price: 55.00,
    category_id: 'cat_tshirts',
    is_drop: false,
    overlay_mask_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod_008',
    title: 'Midnight Rinse Denim',
    slug: 'midnight-rinse-denim',
    description: 'Clean, dark rinse selvedge jeans designed to break in over time.',
    base_price: 155.00,
    category_id: 'cat_jeans',
    is_drop: true,
    overlay_mask_url: 'https://images.unsplash.com/photo-1611042553365-9b101441c135?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date().toISOString(),
  }
];

export async function getMockProducts(): Promise<any[]> {
  // Simulate network delay to ensure animations and loading states trigger correctly
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts);
    }, 500);
  });
}

export async function getMockProductBySlug(slug: string): Promise<any | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProducts.find(p => p.slug === slug));
    }, 300);
  });
}

export async function getMockCategories(): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 300);
  });
}

export async function getMockCategoryBySlug(slug: string): Promise<any | undefined> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCategories.find(c => c.slug === slug));
    }, 300);
  });
}

export const mockVariants: any[] = mockProducts.flatMap(p => [
  { id: `${p.id}-s`, product_id: p.id, sku: `${p.id}-S`, size: 'S', color: 'Midnight Black', stock_quantity: 10, price_override: null },
  { id: `${p.id}-m`, product_id: p.id, sku: `${p.id}-M`, size: 'M', color: 'Midnight Black', stock_quantity: 4, price_override: null },
  { id: `${p.id}-l`, product_id: p.id, sku: `${p.id}-L`, size: 'L', color: 'Midnight Black', stock_quantity: 0, price_override: null },
  { id: `${p.id}-xl`, product_id: p.id, sku: `${p.id}-XL`, size: 'XL', color: 'Midnight Black', stock_quantity: 15, price_override: null },
]);

export async function getMockVariantsByProductId(productId: string): Promise<any[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockVariants.filter(v => v.product_id === productId));
    }, 200);
  });
}


-- Seed Data for Inkwave Dynamic UI
-- Run this in your Supabase SQL Editor

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description)
VALUES 
  ('c1e95696-6e46-4a41-89ab-061b4d08a543', 'Men', 'men', 'Mens streetwear'),
  ('b91fb832-62cb-4f36-8a5e-2b740523e3e2', 'Women', 'women', 'Womens streetwear'),
  ('0db1a866-b33a-4be2-a3c9-d2b1dfeb3396', 'Oversized', 'oversized', 'Baggy fits'),
  ('7a31b402-95f7-4186-b40b-78330cfd2c14', 'Outerwear', 'outerwear', 'Jackets & Hoodies')
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Products
INSERT INTO public.products (id, category_id, title, slug, description, base_price, is_drop, overlay_mask_url)
VALUES 
  ('1a11a11a-1111-1111-1111-111111111111', '0db1a866-b33a-4be2-a3c9-d2b1dfeb3396', 'Shinjuku Pulse Hoodie', 'shinjuku-pulse-hoodie', 'Heavyweight acid wash hoodie with cyber-minimalist graphics. Perfect for late night city runs.', 120.00, true, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop'),
  ('2b22b22b-2222-2222-2222-222222222222', '7a31b402-95f7-4186-b40b-78330cfd2c14', 'Vanguard Utility Jacket', 'vanguard-utility-jacket', 'Multi-pocket tactical jacket built from water-resistant ripstop fabric.', 185.00, false, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'),
  ('3c33c33c-3333-3333-3333-333333333333', 'c1e95696-6e46-4a41-89ab-061b4d08a543', 'Archive Parachute Pants', 'archive-parachute-pants', 'Ultra-baggy nylon pants with adjustable drawstrings at the ankle.', 95.00, false, 'https://images.unsplash.com/photo-1622445272461-c6580cab6efa?q=80&w=1000&auto=format&fit=crop'),
  ('4d44d44d-4444-4444-4444-444444444444', 'b91fb832-62cb-4f36-8a5e-2b740523e3e2', 'Matrix Cropped Puffer', 'matrix-cropped-puffer', 'High-gloss cropped puffer jacket with extreme proportions.', 150.00, true, 'https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Product Variants (Sizes/Colors)
INSERT INTO public.product_variants (product_id, sku, size, color, stock_quantity)
VALUES 
  ('1a11a11a-1111-1111-1111-111111111111', 'SHIN-PULS-M-BLK', 'M', 'Washed Black', 12),
  ('1a11a11a-1111-1111-1111-111111111111', 'SHIN-PULS-L-BLK', 'L', 'Washed Black', 3),
  ('1a11a11a-1111-1111-1111-111111111111', 'SHIN-PULS-XL-BLK', 'XL', 'Washed Black', 0),
  ('2b22b22b-2222-2222-2222-222222222222', 'VANG-UTIL-L-OLV', 'L', 'Olive Drab', 5),
  ('2b22b22b-2222-2222-2222-222222222222', 'VANG-UTIL-XL-OLV', 'XL', 'Olive Drab', 8),
  ('3c33c33c-3333-3333-3333-333333333333', 'ARCH-PARA-M-GRY', 'M', 'Concrete', 20),
  ('4d44d44d-4444-4444-4444-444444444444', 'MATR-PUF-S-BLK', 'S', 'Gloss Black', 1)
ON CONFLICT (id) DO NOTHING;

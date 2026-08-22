-- Migration: Add compare_at_price (Crossed / Original MRP price) to products and variants
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS compare_at_price numeric(10,2);

ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS compare_at_price numeric(10,2);

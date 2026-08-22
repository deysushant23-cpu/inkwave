-- Add images array to products for the Additional Gallery Images feature
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add is_active to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update the existing seed data (this ensures existing categories are active)
UPDATE public.categories SET is_active = true WHERE is_active IS NULL;

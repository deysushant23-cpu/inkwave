import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(2, 'Title is required').max(150),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  base_price: z.number().min(0, 'Price must be greater than or equal to 0'),
  compare_at_price: z.number().min(0, 'Original price cannot be negative').optional().nullable(),
  category_id: z.string().uuid('Invalid category ID').optional().nullable(),
  is_drop: z.boolean().default(false),
  is_sale: z.boolean().optional().default(false),
  sale_badge_text: z.string().optional().nullable(),
  discount_percent: z.number().optional().nullable(),
  overlay_mask_url: z.string().url('Must be a valid URL').optional().nullable(),
  images: z.array(z.string().url('Invalid image URL')).optional().default([]),
});

export const productUpdateSchema = productSchema.partial();

export const variantSchema = z.object({
  product_id: z.string().uuid(),
  sku: z.string().min(1, 'SKU is required'),
  size: z.string().min(1, 'Size is required'),
  color: z.string().optional().nullable(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  price_override: z.number().min(0, 'Price cannot be negative').optional().nullable(),
  compare_at_price: z.number().min(0, 'Original price cannot be negative').optional().nullable(),
});

export const variantUpdateSchema = variantSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional().nullable(),
  show_in_header: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

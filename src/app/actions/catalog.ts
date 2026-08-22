'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { productSchema, productUpdateSchema, variantSchema, variantUpdateSchema, categorySchema, categoryUpdateSchema } from '@/lib/validations/catalog.schema';
import { verifyAdmin } from '@/lib/admin';
import { saveComparePriceFallback, enrichVariantsWithComparePrices, saveProductSaleConfig, bulkSaveProductSaleConfigs, ProductSaleConfig } from '@/lib/catalogPrices';

function sanitizeProductPayload(data: Record<string, any>) {
  const allowed = ['title', 'slug', 'description', 'base_price', 'category_id', 'is_drop', 'overlay_mask_url', 'images'];
  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (key in data) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

function sanitizeVariantPayload(data: Record<string, any>) {
  const allowed = ['product_id', 'sku', 'size', 'color', 'stock_quantity', 'price_override'];
  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (key in data) {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

export async function createProductAction(rawPayload: any) {
  const parseResult = productSchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: (parseResult as any).error.errors.map((e: any) => e.message).join(', ') };
  
  await verifyAdmin();
  const supabase = await createAdminClient();
  const insertData = sanitizeProductPayload(parseResult.data);
  
  const { data, error } = await (supabase.from('products') as any).insert([insertData]).select().single();

  if (error) return { success: false, error: error.message };

  if (data?.id) {
    const isSale = parseResult.data.is_sale ?? false;
    const compareAt = parseResult.data.compare_at_price ?? null;
    const badgeText = parseResult.data.sale_badge_text ?? (isSale ? 'SALE' : null);
    const discPct = parseResult.data.discount_percent ?? (compareAt && Number(compareAt) > Number(data.base_price) ? Math.round(((Number(compareAt) - Number(data.base_price)) / Number(compareAt)) * 100) : null);

    await Promise.all([
      saveComparePriceFallback('product_compare_prices', data.id, compareAt),
      saveProductSaleConfig(data.id, isSale || compareAt ? {
        is_sale: isSale,
        compare_at_price: compareAt,
        sale_badge_text: badgeText,
        discount_percent: discPct
      } : null)
    ]);

    data.compare_at_price = compareAt;
    data.is_sale = isSale;
    data.sale_badge_text = badgeText;
  }

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/showcase', 'page');
  revalidatePath('/collections', 'page');
  return { success: true, product: data };
}

export async function updateProductAction(id: string, rawPayload: any) {
  const parseResult = productUpdateSchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: (parseResult as any).error.errors.map((e: any) => e.message).join(', ') };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const updateData = sanitizeProductPayload(parseResult.data);

  const { error } = await (supabase.from('products') as any).update(updateData).eq('id', id);

  if (error) return { success: false, error: error.message };

  const isSale = parseResult.data.is_sale;
  const compareAt = parseResult.data.compare_at_price;
  const badgeText = parseResult.data.sale_badge_text;
  const discPct = parseResult.data.discount_percent;

  const promises: Promise<any>[] = [];
  if (compareAt !== undefined) {
    promises.push(saveComparePriceFallback('product_compare_prices', id, compareAt ?? null));
  }

  if (isSale !== undefined || compareAt !== undefined || badgeText !== undefined || discPct !== undefined) {
    const saleConfig: ProductSaleConfig | null = (isSale || compareAt) ? {
      is_sale: Boolean(isSale),
      compare_at_price: compareAt ?? null,
      sale_badge_text: badgeText || (isSale ? 'SALE' : null),
      discount_percent: discPct ?? null
    } : null;
    promises.push(saveProductSaleConfig(id, saleConfig));
  }

  await Promise.all(promises);

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/showcase', 'page');
  revalidatePath('/collections', 'page');
  return { success: true };
}

export async function toggleProductSaleAction(
  productId: string, 
  isSale: boolean, 
  compareAtPrice?: number | null, 
  saleBadgeText?: string | null,
  discountPercent?: number | null
) {
  if (!productId) return { success: false, error: 'Product ID is required' };
  
  await verifyAdmin();

  const saleConfig: ProductSaleConfig | null = isSale ? {
    is_sale: true,
    compare_at_price: compareAtPrice ?? null,
    sale_badge_text: saleBadgeText || 'SALE',
    discount_percent: discountPercent ?? null
  } : null;

  await Promise.all([
    saveProductSaleConfig(productId, saleConfig),
    saveComparePriceFallback('product_compare_prices', productId, compareAtPrice ?? null)
  ]);

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/showcase', 'page');
  revalidatePath('/collections', 'page');
  return { success: true };
}

export async function bulkSetCategorySaleAction(
  categoryId: string | 'all',
  isSale: boolean,
  discountPercent: number = 20,
  badgeText: string = 'SALE'
) {
  await verifyAdmin();
  const supabase = await createAdminClient();

  let query = (supabase.from('products') as any).select('id, base_price, category_id');
  if (categoryId !== 'all') {
    query = query.eq('category_id', categoryId);
  }

  const { data: targetProducts, error } = await query;
  if (error || !targetProducts) {
    return { success: false, error: error?.message || 'Failed to fetch category products' };
  }

  const saleConfigs: Record<string, ProductSaleConfig | null> = {};
  const comparePricePromises: Promise<any>[] = [];

  targetProducts.forEach((p: any) => {
    if (isSale) {
      const base = Number(p.base_price || 0);
      // If discount is 20%, calculate original compare price so selling price is base
      const originalCompare = Math.round(base / (1 - (discountPercent / 100)));
      saleConfigs[p.id] = {
        is_sale: true,
        compare_at_price: originalCompare,
        sale_badge_text: badgeText,
        discount_percent: discountPercent
      };
      comparePricePromises.push(saveComparePriceFallback('product_compare_prices', p.id, originalCompare));
    } else {
      saleConfigs[p.id] = null;
      comparePricePromises.push(saveComparePriceFallback('product_compare_prices', p.id, null));
    }
  });

  await Promise.all([
    bulkSaveProductSaleConfigs(saleConfigs),
    ...comparePricePromises
  ]);

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/showcase', 'page');
  revalidatePath('/collections', 'page');
  return { success: true, count: targetProducts.length };
}

export async function deleteProductAction(id: string) {
  if (!id) return { success: false, error: 'Invalid product ID' };

  await verifyAdmin();
  const supabase = await createAdminClient();

  // 1. Delete associated variants
  await (supabase.from('product_variants') as any).delete().eq('product_id', id);

  // 2. Delete product
  const { error } = await (supabase.from('products') as any).delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  // 3. Clean up compare prices fallback and sale configs
  await Promise.all([
    saveComparePriceFallback('product_compare_prices', id, null),
    saveProductSaleConfig(id, null)
  ]);

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  revalidatePath('/showcase', 'page');
  revalidatePath('/collections', 'page');
  return { success: true };
}

export async function addVariantAction(rawPayload: any) {
  const parseResult = variantSchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: 'Validation failed' };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const insertData = sanitizeVariantPayload(parseResult.data);

  const { data, error } = await (supabase.from('product_variants') as any).insert([insertData]).select().single();

  if (error) return { success: false, error: error.message };

  if (data?.id) {
    await saveComparePriceFallback('variant_compare_prices', data.id, parseResult.data.compare_at_price ?? null);
    data.compare_at_price = parseResult.data.compare_at_price ?? null;
  }

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true, variant: data };
}

export async function updateVariantAction(id: string, rawPayload: any) {
  const parseResult = variantUpdateSchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: 'Validation failed' };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const updateData = sanitizeVariantPayload(parseResult.data);

  const { error } = await (supabase.from('product_variants') as any).update(updateData).eq('id', id);

  if (error) return { success: false, error: error.message };

  if (parseResult.data.compare_at_price !== undefined) {
    await saveComparePriceFallback('variant_compare_prices', id, parseResult.data.compare_at_price ?? null);
  }

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}

export async function deleteVariantAction(id: string) {
  if (!id) return { success: false, error: 'Invalid ID' };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const { error } = await (supabase.from('product_variants') as any).delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  await saveComparePriceFallback('variant_compare_prices', id, null);

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}

export async function bulkAddVariantsAction(productId: string, variantList: Array<{ size: string; color?: string | null; sku: string; stock_quantity: number; price_override?: number | null; compare_at_price?: number | null }>) {
  if (!productId || !variantList || variantList.length === 0) return { success: false, error: 'No variants provided' };

  await verifyAdmin();
  const supabase = await createAdminClient();

  const insertData = variantList.map(v => ({
    product_id: productId,
    sku: v.sku,
    size: v.size,
    color: v.color || null,
    stock_quantity: typeof v.stock_quantity === 'number' ? v.stock_quantity : parseInt(v.stock_quantity) || 0,
    price_override: v.price_override ? Number(v.price_override) : null
  }));

  const { data, error } = await (supabase.from('product_variants') as any).insert(insertData).select();
  if (error) return { success: false, error: error.message };

  // Save compare prices for each if provided
  for (let i = 0; i < (data || []).length; i++) {
    const created = data[i];
    const original = variantList[i];
    if (original?.compare_at_price) {
      await saveComparePriceFallback('variant_compare_prices', created.id, Number(original.compare_at_price));
      created.compare_at_price = Number(original.compare_at_price);
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true, variants: data };
}

export async function getProductVariantsAction(productId: string) {
  if (!productId) return { success: false, error: 'Invalid product ID', variants: [] };
  const supabase = await createClient();
  const { data, error } = await (supabase.from('product_variants') as any)
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });
  if (error) return { success: false, error: error.message, variants: [] };
  const enriched = await enrichVariantsWithComparePrices(data || []);
  return { success: true, variants: enriched };
}

export async function createCategoryAction(rawPayload: any) {
  const parseResult = categorySchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: 'Validation failed' };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const { data, error } = await (supabase.from('categories') as any).insert([parseResult.data]).select().single();
  if (error) return { success: false, error: error.message };
  revalidatePath('/', 'layout');
  return { success: true, category: data };
}

export async function toggleCategoryStatusAction(id: string, isActive: boolean) {
  if (typeof isActive !== 'boolean') return { success: false, error: 'Invalid input' };
  
  await verifyAdmin();
  const supabase = await createAdminClient();
  const { error } = await (supabase.from('categories') as any).update({ is_active: isActive }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}
export async function toggleCategoryHeaderAction(id: string, showInHeader: boolean) {
  if (typeof showInHeader !== 'boolean') return { success: false, error: 'Invalid input' };
  
  await verifyAdmin();
  const supabase = await createAdminClient();
  const { error } = await (supabase.from('categories') as any).update({ show_in_header: showInHeader }).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}

export async function updateCategoryAction(id: string, rawPayload: any) {
  const parseResult = categoryUpdateSchema.safeParse(rawPayload);
  if (!parseResult.success) return { success: false, error: 'Validation failed' };

  await verifyAdmin();
  const supabase = await createAdminClient();
  const { error } = await (supabase.from('categories') as any).update(parseResult.data).eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  if (!id) return { success: false, error: 'Invalid ID' };
  
  await verifyAdmin();
  const supabase = await createAdminClient();
  const { error } = await (supabase.from('categories') as any).delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/', 'layout');
  revalidatePath('/category/[slug]', 'page');
  revalidatePath('/product/[slug]', 'page');
  return { success: true };
}

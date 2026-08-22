import { createAdminClient } from './supabase/server';

export interface ProductSaleConfig {
  is_sale: boolean;
  compare_at_price?: number | null;
  sale_badge_text?: string | null;
  discount_percent?: number | null;
}

export async function getComparePricesMap(key: 'variant_compare_prices' | 'product_compare_prices'): Promise<Record<string, number>> {
  try {
    const supabase = await createAdminClient();
    const { data } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', key)
      .single();
    return (data?.json_content as Record<string, number>) || {};
  } catch {
    return {};
  }
}

export async function getSaleConfigsMap(): Promise<Record<string, ProductSaleConfig>> {
  try {
    const supabase = await createAdminClient();
    const { data } = await (supabase.from('cms_sections') as any)
      .select('json_content')
      .eq('section_key', 'product_sale_configs')
      .single();
    return (data?.json_content as Record<string, ProductSaleConfig>) || {};
  } catch {
    return {};
  }
}

export async function saveComparePriceFallback(key: 'variant_compare_prices' | 'product_compare_prices', id: string, price: number | null) {
  try {
    const supabase = await createAdminClient();
    const { data } = await (supabase.from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', key)
      .single();

    const currentMap = (data?.json_content as Record<string, number>) || {};
    if (price === null || price === undefined || isNaN(Number(price))) {
      delete currentMap[id];
    } else {
      currentMap[id] = Number(price);
    }

    if (data?.id) {
      await (supabase.from('cms_sections') as any)
        .update({ json_content: currentMap, updated_at: new Date().toISOString() })
        .eq('id', data.id);
    } else {
      await (supabase.from('cms_sections') as any).insert([{
        section_key: key,
        json_content: currentMap,
        is_published: true
      }]);
    }
  } catch (err) {
    console.error(`Error saving ${key} fallback:`, err);
  }
}

export async function saveProductSaleConfig(id: string, config: ProductSaleConfig | null) {
  try {
    const supabase = await createAdminClient();
    const { data } = await (supabase.from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', 'product_sale_configs')
      .single();

    const currentMap = (data?.json_content as Record<string, ProductSaleConfig>) || {};
    if (!config) {
      delete currentMap[id];
    } else {
      currentMap[id] = config;
    }

    if (data?.id) {
      await (supabase.from('cms_sections') as any)
        .update({ json_content: currentMap, updated_at: new Date().toISOString() })
        .eq('id', data.id);
    } else {
      await (supabase.from('cms_sections') as any).insert([{
        section_key: 'product_sale_configs',
        json_content: currentMap,
        is_published: true
      }]);
    }
  } catch (err) {
    console.error('Error saving product_sale_configs:', err);
  }
}

export async function bulkSaveProductSaleConfigs(configs: Record<string, ProductSaleConfig | null>) {
  try {
    const supabase = await createAdminClient();
    const { data } = await (supabase.from('cms_sections') as any)
      .select('id, json_content')
      .eq('section_key', 'product_sale_configs')
      .single();

    const currentMap = (data?.json_content as Record<string, ProductSaleConfig>) || {};
    for (const [id, cfg] of Object.entries(configs)) {
      if (!cfg) {
        delete currentMap[id];
      } else {
        currentMap[id] = cfg;
      }
    }

    if (data?.id) {
      await (supabase.from('cms_sections') as any)
        .update({ json_content: currentMap, updated_at: new Date().toISOString() })
        .eq('id', data.id);
    } else {
      await (supabase.from('cms_sections') as any).insert([{
        section_key: 'product_sale_configs',
        json_content: currentMap,
        is_published: true
      }]);
    }
  } catch (err) {
    console.error('Error bulk saving product_sale_configs:', err);
  }
}

export async function enrichProductsWithComparePrices(products: any[]): Promise<any[]> {
  if (!products || products.length === 0) return products;
  const [prodMap, varMap, saleMap] = await Promise.all([
    getComparePricesMap('product_compare_prices'),
    getComparePricesMap('variant_compare_prices'),
    getSaleConfigsMap()
  ]);

  return products.map(p => {
    const saleCfg = saleMap[p.id] || null;
    const compare_at_price = p.compare_at_price ?? saleCfg?.compare_at_price ?? prodMap[p.id] ?? null;
    
    // Explicit sale toggle or calculated from compare_at_price
    const hasDiscount = Boolean(compare_at_price && Number(compare_at_price) > Number(p.base_price || p.price || 0));
    const is_sale = p.is_sale !== undefined ? Boolean(p.is_sale) : (saleCfg?.is_sale !== undefined ? Boolean(saleCfg.is_sale) : hasDiscount);
    
    const sale_badge_text = p.sale_badge_text || saleCfg?.sale_badge_text || (is_sale ? 'SALE' : null);
    
    const baseNum = Number(p.base_price || p.price || 0);
    const compareNum = compare_at_price ? Number(compare_at_price) : 0;
    const discount_percent = compareNum > baseNum ? Math.round(((compareNum - baseNum) / compareNum) * 100) : (saleCfg?.discount_percent ?? null);

    const variants = (p.product_variants || []).map((v: any) => ({
      ...v,
      compare_at_price: v.compare_at_price ?? varMap[v.id] ?? null
    }));

    return {
      ...p,
      compare_at_price,
      is_sale,
      sale_badge_text,
      discount_percent,
      product_variants: variants
    };
  });
}

export async function enrichVariantsWithComparePrices(variants: any[]): Promise<any[]> {
  if (!variants || variants.length === 0) return variants;
  const varMap = await getComparePricesMap('variant_compare_prices');
  return variants.map(v => ({
    ...v,
    compare_at_price: v.compare_at_price ?? varMap[v.id] ?? null
  }));
}

import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PremiumCategoriesBentoClient, { CategoryCardProps } from './PremiumCategoriesBentoClient';

export default async function PremiumCategoriesBento() {
  const supabase = await createClient();

  const { data } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'categories_config')
    .single();

  const config = data?.json_content || {};
  const isEnabled = config.is_enabled !== false;

  // If admin turned off this section, do not render
  if (!isEnabled) {
    return null;
  }

  const sectionTag = config.section_tag || 'Curated Aesthetics';
  const sectionTitle = config.section_title || 'Categories';

  let rawCategories: CategoryCardProps[] = [];

  if (Array.isArray(config.categories) && config.categories.length > 0) {
    rawCategories = config.categories;
  } else {
    rawCategories = [
      {
        title: 'T-Shirts',
        tag: 'Shop Now',
        bgImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1600&auto=format&fit=crop',
        link: '/category/t-shirts',
        is_active: true,
      },
      {
        title: 'Shirts',
        tag: 'Explore',
        bgImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1600&auto=format&fit=crop',
        link: '/category/shirts',
        is_active: true,
      },
      {
        title: 'Jeans',
        tag: 'View Fits',
        bgImage: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?q=80&w=1600&auto=format&fit=crop',
        link: '/category/jeans',
        is_active: true,
      },
      {
        title: 'Hoodies',
        tag: 'Drop Now',
        bgImage: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=1600&auto=format&fit=crop',
        link: '/category/hoodies',
        is_active: true,
      },
    ];
  }

  // Filter only categories that are active and have a title
  const activeCategories = rawCategories.filter(cat => cat.is_active !== false && cat.title?.trim() !== '');

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="section" id="categories" style={{ paddingTop: '80px', paddingBottom: 0 }}>
      <div className="wrap">
        <div className="sec-head reveal in">
          <div>
            <span className="sec-tag">{sectionTag}</span>
            <h2>{sectionTitle}</h2>
          </div>
        </div>
      </div>
      {/* Full-bleed strip — no wrap padding */}
      <div className="mt-10">
        <PremiumCategoriesBentoClient categories={activeCategories} />
      </div>
    </section>
  );
}

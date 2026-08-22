import React from 'react';
import { createClient } from '@/lib/supabase/server';
import OffersSectionClient, { OfferProps } from './OffersSectionClient';

export default async function OffersSection() {
  const supabase = await createClient();

  const { data } = await (supabase
    .from('cms_sections') as any)
    .select('json_content')
    .eq('section_key', 'offers_config')
    .single();

  let offers: OfferProps[] = [];

  if (data?.json_content && Array.isArray(data.json_content.offers)) {
    offers = data.json_content.offers;
  }

  return <OffersSectionClient offers={offers} />;
}

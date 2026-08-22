const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const legalPages = [
  {
    section_key: 'page_privacy-policy',
    json_content: {
      title: 'Privacy Policy',
      content: '# Privacy Policy\n\nThis Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store.\n\n## Personal Information We Collect\nWhen you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.\n\n## How Do We Use Your Personal Information?\nWe use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).'
    },
    is_published: true
  },
  {
    section_key: 'page_shipping-policy',
    json_content: {
      title: 'Shipping Policy',
      content: '# Shipping Policy\n\nAll our garments are dyed in small batches. Orders are processed within 1-2 business days. Standard shipping takes 3-5 business days.\n\n## International Shipping\nWe ship worldwide. International rates are calculated at checkout.\n\n## Returns\nIf you are not 100% satisfied with your purchase, you can return it within 30 days of receipt. All items must be unworn, unwashed, and in their original condition.'
    },
    is_published: true
  }
];

async function run() {
  console.log('Upserting CMS pages for Privacy and Shipping Policy...');
  for (const page of legalPages) {
    const { data: existing } = await supabase
      .from('cms_sections')
      .select('id')
      .eq('section_key', page.section_key)
      .single();
    
    if (existing) {
      await supabase.from('cms_sections').update(page).eq('id', existing.id);
    } else {
      await supabase.from('cms_sections').insert([page]);
    }
  }

  console.log('Updating footer_config...');
  const { data: footerData } = await supabase
    .from('cms_sections')
    .select('json_content, id')
    .eq('section_key', 'footer_config')
    .single();

  if (footerData && footerData.json_content && footerData.json_content.columns) {
    let jsonContent = footerData.json_content;
    let helpColumn = jsonContent.columns.find(col => col.title.toLowerCase() === 'help' || col.title.toLowerCase() === 'legal');
    
    if (!helpColumn) {
      helpColumn = { title: 'Legal', links: [] };
      jsonContent.columns.push(helpColumn);
    }

    // Add Shipping Policy
    if (!helpColumn.links.some(l => l.url.includes('shipping-policy'))) {
      helpColumn.links.push({ label: 'Shipping Policy', url: '/pages/shipping-policy' });
    }
    // Add Privacy Policy
    if (!helpColumn.links.some(l => l.url.includes('privacy-policy'))) {
      helpColumn.links.push({ label: 'Privacy Policy', url: '/pages/privacy-policy' });
    }

    // Remove the old 'Shipping & returns' if we are replacing it
    helpColumn.links = helpColumn.links.filter(l => l.url !== '/pages/shipping');

    await supabase.from('cms_sections').update({ json_content: jsonContent }).eq('id', footerData.id);
    console.log('Successfully added policies to footer.');
  }
}
run();

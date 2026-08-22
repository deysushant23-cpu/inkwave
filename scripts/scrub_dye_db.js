const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Updating homepage_config...');
  const { data: homeConfig } = await supabase.from('cms_sections').select('id, json_content').eq('section_key', 'homepage_config').single();
  if (homeConfig && homeConfig.json_content) {
    let json = homeConfig.json_content;
    if (json.heroLede && json.heroLede.includes('vats')) {
      json.heroLede = 'Premium readymade apparel. Designed for everyday comfort and effortless style.';
    }
    if (json.heroEyebrow && json.heroEyebrow.includes('Small Batch')) {
      json.heroEyebrow = 'SS26 — Vol. 01 — New Arrivals';
    }
    if (json.giantMarqueeText && json.giantMarqueeText.includes('VATS')) {
      json.giantMarqueeText = 'INKWAVE // VOL 04 // PREMIUM READYMADE //';
    }
    if (json.marqueeItems) {
      json.marqueeItems = json.marqueeItems.map(item => {
        if (item.text.includes('Small batch')) return { ...item, text: 'Premium quality, always in style' };
        if (item.text.includes('Dyed in small vats')) return { ...item, text: 'Designed for effortless comfort' };
        return item;
      });
    }
    await supabase.from('cms_sections').update({ json_content: json }).eq('id', homeConfig.id);
  }

  console.log('Updating page_about...');
  const { data: aboutPage } = await supabase.from('cms_sections').select('id, json_content').eq('section_key', 'page_about').single();
  if (aboutPage && aboutPage.json_content) {
    let json = aboutPage.json_content;
    json.content = json.content.replace(/small-batch, hand-dyed garments/g, 'premium readymade garments');
    json.content = json.content.replace(/dyed in small vats in our studio to achieve deep, complex washes that cannot be replicated in mass production/g, 'crafted to ensure you always look your best');
    await supabase.from('cms_sections').update({ json_content: json }).eq('id', aboutPage.id);
  }

  console.log('Updating page_size-guide...');
  const { data: sizeGuide } = await supabase.from('cms_sections').select('id, json_content').eq('section_key', 'page_size-guide').single();
  if (sizeGuide && sizeGuide.json_content) {
    let json = sizeGuide.json_content;
    json.content = json.content.replace(/Due to the small-batch dye process, allow for a 1-2cm variance./g, 'Please allow for a 1-2cm variance.');
    await supabase.from('cms_sections').update({ json_content: json }).eq('id', sizeGuide.id);
  }
  
  console.log('Updating page_shipping...');
  const { data: shipping } = await supabase.from('cms_sections').select('id, json_content').eq('section_key', 'page_shipping-policy').single();
  if (shipping && shipping.json_content) {
    let json = shipping.json_content;
    json.content = json.content.replace(/All our garments are dyed in small batches. /g, 'All our garments are premium readymade quality. ');
    await supabase.from('cms_sections').update({ json_content: json }).eq('id', shipping.id);
  }

  console.log('DB Update complete!');
}
run();

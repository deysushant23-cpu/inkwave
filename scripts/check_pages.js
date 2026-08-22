const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: footerData } = await supabase
    .from('cms_sections')
    .select('json_content')
    .eq('section_key', 'footer_config')
    .single();

  console.log('Footer Config:', JSON.stringify(footerData, null, 2));

  const { data: pages } = await supabase
    .from('cms_pages')
    .select('slug, title, is_published');
    
  console.log('CMS Pages:', JSON.stringify(pages, null, 2));
}
run();

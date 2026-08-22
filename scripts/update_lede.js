const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: config } = await supabase
    .from('cms_sections')
    .select('id, json_content')
    .eq('section_key', 'homepage_config')
    .single();

  if (config && config.json_content) {
    const updatedContent = { ...config.json_content };
    updatedContent.heroLede = 'Hand-dyed garments cut for movement. Every piece takes its own bath — no two vats run the same, so no two garments run identical.';
    
    await supabase
      .from('cms_sections')
      .update({ json_content: updatedContent })
      .eq('id', config.id);
      
    console.log('Successfully updated homepage_config in DB.');
  }
}
run();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('cms_sections')
    .select('json_content')
    .eq('section_key', 'homepage_config')
    .single();

  if (error) {
    console.error(error);
  } else {
    console.log(JSON.stringify(data.json_content, null, 2));
  }
}
run();

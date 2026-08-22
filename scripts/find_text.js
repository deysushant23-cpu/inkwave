const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('cms_sections')
    .select('section_key, json_content');

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(row => {
    const text = JSON.stringify(row.json_content).toLowerCase();
    if (text.includes('hand') || text.includes('dyed') || text.includes('dyied') || text.includes('garment')) {
      console.log(`Found in section: ${row.section_key}`);
      if (text.includes('dyied') || text.includes('garmet')) {
        console.log(`-> POTENTIAL TYPO in ${row.section_key}:`, text.substring(Math.max(0, text.indexOf('dyied') - 20), text.indexOf('dyied') + 50));
      }
    }
  });
}
run();

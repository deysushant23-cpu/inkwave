import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzzhakccqrmjouzcnor.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Set target date to 5 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 5);
  targetDate.setHours(20, 0, 0, 0); // 8 PM

  const payload = {
    targetDate: targetDate.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    title: 'VOL. 05: TOKYO NOCTURNE',
    description: 'Heavyweight silhouettes crafted in limited numbers. The countdown begins. Prepare for the drop.',
    buttonText: 'Join the Waitlist',
    buttonLink: '#',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1574246830500-1c4b8e2193e4?q=80&w=2560&auto=format&fit=crop',
  };

  console.log('Upserting upcoming_drop_config...');
  
  const { data: existing } = await supabase.from('cms_sections').select('id').eq('section_key', 'upcoming_drop_config').single();
  
  if (existing) {
    const { error } = await supabase.from('cms_sections').update({ json_content: payload }).eq('id', existing.id);
    if (error) console.error('Error updating:', error);
    else console.log('Successfully updated!');
  } else {
    const { error } = await supabase.from('cms_sections').insert([{ section_key: 'upcoming_drop_config', json_content: payload, is_published: true }]);
    if (error) console.error('Error inserting:', error);
    else console.log('Successfully inserted!');
  }
}

run();

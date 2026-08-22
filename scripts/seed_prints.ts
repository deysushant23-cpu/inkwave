import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzzhakccqrmjouzcnor.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  const svgStr1 = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="#FF5733" /><text x="50" y="110" font-size="40" fill="white" font-weight="bold" font-family="sans-serif">INK</text></svg>`;
  const b64_1 = `data:image/svg+xml;base64,${Buffer.from(svgStr1).toString('base64')}`;
  
  const svgStr2 = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="160" height="160" rx="20" fill="#000000" /><text x="35" y="115" font-size="28" fill="#FFFFFF" font-weight="bold" font-family="monospace">WAVE</text></svg>`;
  const b64_2 = `data:image/svg+xml;base64,${Buffer.from(svgStr2).toString('base64')}`;

  const requests = [
    {
      section_key: `custom_print_request_req-${Date.now()}-1`,
      json_content: {
        id: `req-${Date.now()}-1`,
        user_name: 'Alex Mercer',
        uploaded_design: b64_1,
        scale: 45,
        rotate: 0,
        top: 35,
        left: 0,
        side: 'Front',
        color: 'Ink Black',
        size: 'L',
        created_at: new Date().toISOString()
      },
      is_published: true
    },
    {
      section_key: `custom_print_request_req-${Date.now()}-2`,
      json_content: {
        id: `req-${Date.now()}-2`,
        user_name: 'Jordan Chase',
        uploaded_design: b64_2,
        scale: 30,
        rotate: 15,
        top: 45,
        left: 10,
        side: 'Back',
        color: 'Pure White',
        size: 'M',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      is_published: true
    }
  ];

  for (const req of requests) {
    const { error } = await supabase.from('cms_sections').insert(req);
    if (error) {
      console.error('Error inserting:', error);
    } else {
      console.log('Inserted request:', req.json_content.id);
    }
  }
}

seed().catch(console.error);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bpzzhakccqrmjouzcnor.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not defined in your environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const defaultPages = [
  {
    section_key: 'page_shipping',
    json_content: {
      title: 'Shipping & Returns',
      content: '# Shipping Policy\n\nAll our garments are dyed in small batches. Orders are processed within 1-2 business days. Standard shipping takes 3-5 business days.\n\n## International Shipping\nWe ship worldwide. International rates are calculated at checkout.\n\n## Returns\nIf you are not 100% satisfied with your purchase, you can return it within 30 days of receipt. All items must be unworn, unwashed, and in their original condition.'
    },
    is_published: true
  },
  {
    section_key: 'page_size-guide',
    json_content: {
      title: 'Size Guide',
      content: 'Our garments are designed for a relaxed, slightly oversized fit. We recommend ordering your true size for the intended fit, or sizing down if you prefer a more tailored look.\n\n### T-Shirts\n* **S**: Chest 38-40" | Length 27"\n* **M**: Chest 40-42" | Length 28"\n* **L**: Chest 42-44" | Length 29"\n* **XL**: Chest 44-46" | Length 30"\n\n### Denim\nOur denim runs true to size. If you are between sizes, we recommend sizing up as our heavyweight denim has minimal stretch.'
    },
    is_published: true
  },
  {
    section_key: 'page_track-order',
    json_content: {
      title: 'Track Your Order',
      content: 'Once your order ships, you will receive an email with a tracking link. Please allow 24 hours for the tracking information to update.\n\nIf you have an account with us, you can also view your order history and tracking status in your [Dashboard](/dashboard).'
    },
    is_published: true
  },
  {
    section_key: 'page_contact',
    json_content: {
      title: 'Contact Us',
      content: '# Contact Us\n\nHave a question about our process, an upcoming drop, or an existing order? Get in touch with us.\n\n**Email**: inkwave1620@gmail.com\n**Phone**: +91 9624468344\n**Address**: B/12 Sharmjivi Soc, Umra, Surat - 395007, Gujarat, India\n\n**Hours**: Monday - Saturday, 10 AM - 6 PM IST\n\nWe aim to respond to all inquiries within 24 hours.'
    },
    is_published: true
  },
  {
    section_key: 'page_about',
    json_content: {
      title: 'About Inkwave',
      content: 'Inkwave is an independent menswear studio focused on small-batch, hand-dyed garments.\n\nWe believe in creating clothes that hold their shape, age beautifully, and feel unique to the wearer. Every piece is cut from premium heavyweight cotton and denim, then dyed in small vats in our studio to achieve deep, complex washes that cannot be replicated in mass production.\n\nOnce a drop sells out, it is gone forever.'
    },
    is_published: true
  },
  {
    section_key: 'page_lookbook',
    json_content: {
      title: 'Lookbook',
      content: 'Explore our latest collections and styling inspiration.\n\n*(Admin: You can upload lookbook images here via the rich text editor or HTML).*'
    },
    is_published: true
  },
  {
    section_key: 'page_journal',
    json_content: {
      title: 'Journal',
      content: 'Behind the scenes at the Inkwave studio, dive into our dyeing process, and read interviews with the team.'
    },
    is_published: true
  },
  {
    section_key: 'page_careers',
    json_content: {
      title: 'Careers',
      content: 'We are currently a small team, but we are always looking for passionate creatives to join us.\n\nThere are no open positions at the moment, but feel free to send your portfolio to careers@inkwave.studio.'
    },
    is_published: true
  },
  {
    section_key: 'page_refund-policy',
    json_content: {
      title: 'Refund & Cancellation Policy',
      content: '# Refund & Cancellation Policy\n\nAt **Inkwave**, we strive to ensure our customers are 100% satisfied with their purchases. Since our garments are hand-dyed in small batches, please review our terms below:\n\n## 1. Cancellations\n- We accept order cancellation requests **only before the order is shipped**. \n- Once your order is dispatched, it cannot be cancelled. You can request a cancellation by emailing us at support@inkwave.studio with your Order ID.\n- Cancelled orders will receive a full refund to the original payment method within 5-7 business days.\n\n## 2. Returns & Exchanges\n- You can request a return or exchange within **7 days of delivery**.\n- To be eligible, items must be **unworn, unwashed, and in their original packaging** with tags intact.\n- Reverse pick-up charges or return shipping costs may be applicable unless the product received was defective or incorrect.\n\n## 3. Refunds Processing\n- Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund.\n- Approved refunds will be credited back to your original payment gateway (UPI, Card, Net Banking) within **5-7 business days** (as per standard bank timelines).'
    },
    is_published: true
  },
  {
    section_key: 'page_terms',
    json_content: {
      title: 'Terms & Conditions',
      content: '# Terms & Conditions\n\nWelcome to **Inkwave**. By accessing and placing orders on our website, you agree to comply with and be bound by the following terms:\n\n## 1. General Conditions\n- We reserve the right to refuse service to anyone for any reason at any time.\n- All content on this site (images, designs, text) is the intellectual property of Inkwave and cannot be used without permission.\n\n## 2. Products & Pricing\n- We make every effort to display the colors and textures of our hand-dyed streetwear as accurately as possible. However, because our garments are dyed in small vats, minor batch-to-batch color variations are normal.\n- Prices for our products are subject to change without notice.\n\n## 3. Order Acceptance & Billing\n- We reserve the right to limit or cancel quantities purchased per person or per order.\n- You agree to provide current, complete, and accurate purchase and account information for all purchases.\n\n## 4. Governing Law\n- These Terms and Conditions shall be governed by and construed in accordance with the laws of India.'
    },
    is_published: true
  },
  {
    section_key: 'page_privacy',
    json_content: {
      title: 'Privacy Policy',
      content: '# Privacy Policy\n\nAt **Inkwave**, we respect your privacy and are committed to protecting the personal data you share with us.\n\n## 1. Information We Collect\n- **Account Registration & Login**: When you register or log in using your Phone Number or Email, we verify your identity using a One-Time Password (OTP).\n- **Checkout Details**: We collect your name, shipping address, landmark, pin code, phone number, and email to process and deliver your order.\n\n## 2. How We Use Your Information\n- To process, package, ship, and track your orders.\n- To verify your login sessions and prevent unauthorized access.\n- To notify you of drop confirmations and order tracking status.\n- We **never sell, lease, or trade** your personal details to third parties.\n\n## 3. Security\n- All financial transactions are handled securely by our payment processor, **Razorpay**. We do not store your credit card or bank details on our servers.\n- Our website utilizes standard encryption protocols (HTTPS/SSL) to protect data transit.'
    },
    is_published: true
  }
];

async function run() {
  console.log('Seeding footer pages...');
  
  for (const page of defaultPages) {
    console.log(`Upserting ${page.section_key}...`);
    
    // Check if exists
    const { data: existing } = await supabase
      .from('cms_sections')
      .select('id')
      .eq('section_key', page.section_key)
      .single();
    
    if (existing) {
      const { error } = await supabase
        .from('cms_sections')
        .update(page)
        .eq('id', existing.id);
      if (error) console.error(`Error updating ${page.section_key}:`, error);
    } else {
      const { error } = await supabase
        .from('cms_sections')
        .insert([page]);
      if (error) console.error(`Error inserting ${page.section_key}:`, error);
    }
  }
  
  console.log('Done!');
}

run();

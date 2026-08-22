const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const legalPages = [
  {
    section_key: 'page_contact',
    json_content: {
      title: 'Contact Us',
      content: `# Contact Us\n\nHave a question about our small-batch dyeing process, an upcoming drop, or an existing order? Get in touch with us.\n\n---\n\n### **Customer Support**\n*   **Email**: support@inkwave.studio\n*   **Phone**: +91 98765 43210\n*   **Support Hours**: Monday to Friday, 10:00 AM – 6:00 PM IST\n*   **Average Response Time**: 12–24 Hours on business days\n\n### **Corporate & Registered Office**\n*   **Legal Name**: Inkwave Studio\n*   **Registered Address**: B/12 Sharmjivi Soc, Umra, Surat, Gujarat, India - 395007\n*   **City / State**: Surat, Gujarat\n\n---\n\n*For order tracking, returns, or replacement status, please visit our [Track Order](/pages/track-order) portal.*`
    },
    is_published: true
  },
  {
    section_key: 'page_privacy-policy',
    json_content: {
      title: 'Privacy Policy',
      content: `# Privacy Policy\n\nEffective Date: August 18, 2026\n\nAt Inkwave Studio, we value your privacy and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, and share your personal information when you visit or purchase from our website.\n\n### **1. Personal Information We Collect**\nWhen you visit our Site or place an order, we collect certain details to fulfill the transaction, including:\n*   **Order Information**: Name, billing address, shipping address, email address, and phone number.\n*   **Device Information**: IP address, web browser type, time zone, and cookie data to optimize site performance.\n*   **Payment details**: All transactions are processed securely through our payment gateway provider (Razorpay). We do not store credit/debit card numbers or UPI credentials on our servers.\n\n### **2. How We Use Your Information**\nWe use this data to:\n*   Process, ship, and deliver your orders.\n*   Send order confirmations, invoices, and tracking links.\n*   Communicate with you regarding support tickets or customized print approvals.\n*   Prevent potential risk, fraud, or abuse.\n\n### **3. Data Sharing & Security**\nWe share your data only with trusted partners necessary to run our store (such as Supabase for secure cloud storage, Resend for transactional emails, and Razorpay for payment processing). Your data is never sold or traded to third-party advertisers.\n\n### **4. Your Rights**\nYou have the right to access, update, or request deletion of the personal information we hold about you. To do so, please contact us at **support@inkwave.studio**.`
    },
    is_published: true
  },
  {
    section_key: 'page_terms-conditions',
    json_content: {
      title: 'Terms & Conditions',
      content: `# Terms & Conditions\n\nWelcome to Inkwave Studio. By accessing our website and purchasing our premium readymade or custom-print menswear, you agree to comply with and be bound by the following Terms & Conditions.\n\n### **1. General Agreement**\n*   These terms govern the use of Inkwave Studio services, products, and website.\n*   We reserve the right to update, modify, or replace any part of these Terms at any time without prior notice.\n\n### **2. Product Accuracy & Variations**\n*   **Small-Batch Vat Dyeing**: Many of our garments are dyed in small batches. Due to this handcrafted process, minor variations in shade, print gradient, and texture may occur. These are not defects but markers of a unique garment.\n*   **Sizing**: Please consult our official [Size Guide](/pages/size-guide) before purchasing to ensure a perfect fit.\n\n### **3. Pricing & Payments**\n*   All prices are in Indian Rupees (INR) and include applicable taxes unless specified otherwise.\n*   Payments are processed securely via **Razorpay**. By initiating a payment, you represent that you are authorized to use the chosen payment method.\n\n### **4. Governing Law**\n*   These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in **Surat, Gujarat, India**.`
    },
    is_published: true
  },
  {
    section_key: 'page_cancellation-refunds',
    json_content: {
      title: 'Cancellation & Refund Policy',
      content: `# Cancellation & Refund Policy\n\nThank you for shopping at Inkwave Studio. We are dedicated to providing premium garments and a seamless customer experience. Please read our guidelines on order cancellations, returns, and refunds.\n\n### **1. Order Cancellations**\n*   **Standard Orders**: You can cancel your order within **2 hours** of placement or before it has been dispatched, whichever is earlier. To cancel, please contact us at **support@inkwave.studio** with your order number.\n*   **Custom Print Orders**: Once design approval is finalized and production begins, custom print orders cannot be cancelled.\n\n### **2. Returns & Exchanges**\n*   We offer a **7-day return and exchange policy** from the date of delivery.\n*   To be eligible, items must be **unworn, unwashed, undamaged**, and in their original packaging with all tags intact.\n*   To initiate a return or exchange, contact our support team at **support@inkwave.studio** or submit a request on our [Track Order](/pages/track-order) page.\n\n### **3. Refund Processing**\n*   Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.\n*   If approved, the refund will be processed and automatically credited back to your **original payment method (UPI, Bank Account, or Card)** via Razorpay.\n*   Refunds typically take **5–7 business days** to reflect in your account, depending on your bank's processing cycles.`
    },
    is_published: true
  },
  {
    section_key: 'page_shipping-policy',
    json_content: {
      title: 'Shipping & Delivery Policy',
      content: `# Shipping & Delivery Policy\n\nAt Inkwave Studio, we strive to deliver your premium menswear securely and efficiently. We ship our small-batch items across India using reliable courier partners.\n\n### **1. Processing & Dispatch Timelines**\n*   **Standard Products**: Orders are processed and dispatched within **1–2 business days** of payment confirmation.\n*   **Custom Print Products**: Please allow **3–5 business days** for custom canvas printing and quality checks before dispatch.\n*   We do not ship orders on Sundays or National Holidays.\n\n### **2. Delivery Rates & Timelines**\n*   **Shipping Fee**: Free shipping on all orders above **₹2000**. A flat shipping rate of **₹100** is charged for orders under ₹2000.\n*   **Delivery Time**: Once dispatched, orders typically reach their destination in:\n    *   **Metro Cities**: 2–3 business days\n    *   **Rest of India**: 4–5 business days\n\n### **3. Order Tracking**\n*   Upon dispatch, you will receive an SMS and email notification containing your shipment's tracking ID and link.\n*   You can track the progress of your delivery live on our dedicated [Track Order](/pages/track-order) page.`
    },
    is_published: true
  }
];

async function run() {
  console.log('Upserting legal pages into public.cms_sections...');
  for (const page of legalPages) {
    const { data: existing, error: selectError } = await supabase
      .from('cms_sections')
      .select('id')
      .eq('section_key', page.section_key)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('cms_sections')
        .update(page)
        .eq('id', existing.id);
      if (updateError) console.error(`Error updating ${page.section_key}:`, updateError);
      else console.log(`Successfully updated ${page.section_key}`);
    } else {
      const { error: insertError } = await supabase
        .from('cms_sections')
        .insert([page]);
      if (insertError) console.error(`Error inserting ${page.section_key}:`, insertError);
      else console.log(`Successfully inserted ${page.section_key}`);
    }
  }

  console.log('Updating footer_config columns to output balanced columns...');
  const { data: footerData, error: footerSelectError } = await supabase
    .from('cms_sections')
    .select('json_content, id')
    .eq('section_key', 'footer_config')
    .single();

  if (footerSelectError) {
    console.error('Error fetching footer config:', footerSelectError);
    return;
  }

  const updatedFooterContent = {
    columns: [
      {
        title: 'Help',
        links: [
          { label: 'Size Guide', url: '/pages/size-guide' },
          { label: 'Track Order', url: '/pages/track-order' },
          { label: 'Contact Us', url: '/pages/contact' }
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', url: '/pages/privacy-policy' },
          { label: 'Terms & Conditions', url: '/pages/terms-conditions' },
          { label: 'Cancellation & Refunds', url: '/pages/cancellation-refunds' },
          { label: 'Shipping Policy', url: '/pages/shipping-policy' }
        ]
      },
      {
        title: 'Studio',
        links: [
          { label: 'About', url: '/pages/about' }
        ]
      },
      {
        title: 'Follow',
        links: [
          { label: 'Instagram', url: 'https://www.instagram.com/inkwavefashion?igsh=M3ExbWZqZ2ZyN284' }
        ]
      }
    ]
  };

  const { error: footerUpdateError } = await supabase
    .from('cms_sections')
    .update({ json_content: updatedFooterContent })
    .eq('id', footerData.id);

  if (footerUpdateError) {
    console.error('Error updating footer_config:', footerUpdateError);
  } else {
    console.log('Successfully updated footer_config.');
  }
}
run();

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawMessage = body.message || '';
    const message = rawMessage.toLowerCase().trim();

    if (!message) {
      return NextResponse.json({ reply: "Hey! What can I help you find today? Ask me about our ₹600 3D Custom Tees, new drops, sizing, or tracking an order!" });
    }

    // 1. Custom Print Lab Intent
    const isCustomPrint = [
      'custom', 'print', 'customize', 'customise', 'design', 'make my own',
      'create shirt', 'create t-shirt', 'print lab', 'bespoke', '600', '699', 'diy', 'tshirt design'
    ].some(k => message.includes(k));

    if (isCustomPrint) {
      return NextResponse.json({
        reply: `✨ **Inkwave 3D Custom Print Studio** lets you create bespoke streetwear tees for **₹600 FLAT RATE** (all prints & free delivery included)!\n\n• **Garment**: 240 GSM Luxury Super-Combed French Terry Cotton\n• **Placement**: Chest, Back, Left Sleeve & Right Sleeve\n• **Features**: Photoshop resize/stretch, 35+ Streetwear fonts, background remover & AI upscaling\n\n👉 [**Launch 3D Custom Print Studio (₹600)**](/custom-print)`
      });
    }

    // 2. Track Order Intent
    const isTrackOrder = [
      'track', 'order status', 'where is my order', 'tracking', 'shipment', 'delivery time', 'dispatch'
    ].some(k => message.includes(k));

    if (isTrackOrder) {
      return NextResponse.json({
        reply: `📦 **Track Your Order**:\n\nYou can track live transit and dispatch status using your Order ID or phone number:\n\n👉 [**Go to Live Order Tracker**](/track-order)\n👉 [**View Order History in My Profile**](/profile)\n\n⚡ *Orders are hand-printed and dispatched from Surat, delivered across India within 4–7 business days.*`
      });
    }

    // 3. Size & Fit Guide Intent
    const isSizeGuide = [
      'size', 'sizing', 'fit', 'oversized', 'gsm', 'measurements', 'fabric', 'chart', 'heavyweight', 'fit guide'
    ].some(k => message.includes(k));

    if (isSizeGuide) {
      return NextResponse.json({
        reply: `📏 **Inkwave Fit & Fabric Spec**:\n\nAll Inkwave tees feature our signature **boxy drop-shoulder streetwear cut** crafted in **240 GSM Heavyweight French Terry Cotton**:\n\n• **S**: Chest 40" | Length 28"\n• **M**: Chest 42" | Length 29"\n• **L**: Chest 44" | Length 30" *(Signature oversized fit)*\n• **XL**: Chest 46" | Length 31"\n• **XXL**: Chest 48" | Length 32"\n\n💡 *Tip: For a classic relaxed streetwear drape, select your regular size. For a snug fitted look, size down one size.*`
      });
    }

    // 4. Return & Exchange Policy Intent
    const isReturn = [
      'return', 'exchange', 'refund', 'damage', 'replace', 'policy', 'cancel'
    ].some(k => message.includes(k));

    if (isReturn) {
      return NextResponse.json({
        reply: `🔄 **7-Day Hassle-Free Returns & Free Size Exchanges**:\n\nWe ensure 100% satisfaction on all apparel orders:\n• Free size replacements if the fit isn't perfect.\n• 7-day doorstep exchange & return pickup.\n\nNeed immediate support for an exchange? Chat directly with our team on WhatsApp:\n\n👉 [**Chat with Support on WhatsApp**](https://wa.me/918160321453)`
      });
    }

    // 5. Contact & Support Intent
    const isContact = [
      'contact', 'support', 'help', 'phone', 'call', 'whatsapp', 'human', 'agent', 'email', 'talk to someone'
    ].some(k => message.includes(k));

    if (isContact) {
      return NextResponse.json({
        reply: `💬 **Inkwave Customer Care**:\n\nWe're online 7 days a week (10:00 AM – 8:00 PM IST)!\n\n• 📲 **WhatsApp Support**: [**Chat on WhatsApp (+91 81603 21453)**](https://wa.me/918160321453)\n• ✉️ **Email**: \`inkwave.help@gmail.com\`\n• 📦 **HQ & Dispatch**: Surat, Gujarat`
      });
    }

    // 6. Dynamic Database Product Search
    const supabase = await createClient();
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, title, slug, base_price, images, is_drop, created_at, category_id, categories(id, name, slug)')
      .limit(30);

    if (dbError) {
      console.error('Chatbot database error:', dbError);
    }

    const products = dbProducts || [];

    // Price Extraction
    let maxPrice: number | null = null;
    const priceMatch = message.match(/(?:under|below|<|less than)\s*(?:₹|rs\.?|rs)?\s*(\d+)/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1], 10);
    } else if (message.includes('cheap') || message.includes('budget') || message.includes('affordable')) {
      maxPrice = 800;
    }

    // Category / Keyword Search
    const keywords = ['jeans', 'shirt', 'tee', 't-shirt', 'hoodie', 'cargo', 'oversize', 'drop', 'pant', 'acid', 'anime', 'vintage', 'street'];
    const matchedKeywords = keywords.filter(k => message.includes(k));

    let filtered = products;

    if (maxPrice !== null) {
      filtered = filtered.filter((p: any) => (p.base_price || 0) <= maxPrice!);
    }

    if (matchedKeywords.length > 0) {
      filtered = filtered.filter((p: any) => {
        const catName = (p.categories?.name || p.categories?.slug || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        return matchedKeywords.some(kw => catName.includes(kw) || title.includes(kw));
      });
    }

    const isGreeting = ['hello', 'hi', 'hey', 'yo', 'sup', 'namaste', 'good morning', 'good evening'].some(g => message.startsWith(g) || message === g);

    if (isGreeting && !maxPrice && matchedKeywords.length === 0) {
      return NextResponse.json({
        reply: "Hey there! Welcome to Inkwave. 🌊 What's your vibe today? I can show you our latest drops, filter pieces by budget, tell you about our **₹600 Custom T-Shirt Lab**, or help track an order!"
      });
    }

    if (filtered.length > 0) {
      let reply = '';
      if (maxPrice && matchedKeywords.length > 0) {
        reply = `Here are some standout **${matchedKeywords.join(', ')}** under ₹${maxPrice}:\n\n`;
      } else if (maxPrice) {
        reply = `Here are some top picks under **₹${maxPrice}**:\n\n`;
      } else if (matchedKeywords.length > 0) {
        reply = `Here's what we have in **${matchedKeywords.join(', ')}**:\n\n`;
      } else {
        reply = `Here are some featured styles you might like:\n\n`;
      }

      filtered.slice(0, 4).forEach((p: any) => {
        reply += `• [**${p.title}**](/product/${p.slug}) — ₹${p.base_price}\n`;
      });

      if (filtered.length > 4) {
        reply += `\n*Plus ${filtered.length - 4} more in our collection!*`;
      }

      return NextResponse.json({ reply });
    }

    if (maxPrice) {
      return NextResponse.json({
        reply: `I couldn't find active styles under ₹${maxPrice} right now. However, you can create your own custom 240GSM tee in our [**3D Custom Print Studio for just ₹600**](/custom-print)!`
      });
    }

    return NextResponse.json({
      reply: "I'm here to help! You can ask me about:\n\n• 👕 [**3D Custom T-Shirt Studio (₹600 Flat)**](/custom-print)\n• 📦 [**Track Your Order**](/track-order)\n• 📏 **Size & Fit Guide**\n• 💬 [**WhatsApp Support**](https://wa.me/918160321453)\n• 🔍 Finding styles (e.g. *\"show me tees under 800\"*)"
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: "Sorry, I had a brief connection glitch. Please try asking again or reach out on [WhatsApp](https://wa.me/918160321453)!" },
      { status: 200 }
    );
  }
}

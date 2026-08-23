import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message?.toLowerCase() || '';
    
    // Simulate slight network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const supabase = await createClient();
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('id, title, slug, base_price, images, is_drop, created_at, category_id, categories(id, name, slug)');

    if (dbError) {
      console.error('Chatbot database error:', dbError);
    }

    const products = dbProducts || [];
    let reply = '';

    // Simple Intent Parsing
    const isGreeting = ['hello', 'hi', 'hey', 'sup', 'yo'].some(g => message.includes(g));
    const isHelp = message.includes('help');
    
    // Price Extraction: look for "under X", "< X", "below X"
    let maxPrice = null;
    const priceMatch = message.match(/(?:under|below|<|less than)\s*(?:₹|rs\.?|rs)?\s*(\d+)/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1], 10);
    } else if (message.includes('cheap') || message.includes('affordable')) {
      maxPrice = 800; // Adjusted based on dynamic price averages
    }

    // Category Extraction
    const categories = ['jeans', 'shirts', 't-shirts', 'tees', 'denim', 'cargo'];
    const requestedCategories = categories.filter(c => message.includes(c));

    // Filter Logic
    let filtered = products;

    if (maxPrice) {
      filtered = filtered.filter((p: any) => (p.base_price || 0) <= maxPrice);
    }

    if (requestedCategories.length > 0) {
      filtered = filtered.filter((p: any) => {
        const catName = (p.categories?.name || p.category_id || '').toLowerCase();
        const title = p.title.toLowerCase();
        return requestedCategories.some(rc => catName.includes(rc) || title.includes(rc));
      });
    }

    // Format Response
    if (isGreeting && !maxPrice && requestedCategories.length === 0) {
      reply = "Hey! Welcome to Inkwave. 🌊 What's your vibe today? I can help you find specific styles, or you can ask me to show you clothes under a certain budget!";
    } else if (filtered.length > 0) {
      if (maxPrice && requestedCategories.length > 0) {
        reply = `I found some killer **${requestedCategories.join(', ')}** under ₹${maxPrice} for you:\n\n`;
      } else if (maxPrice) {
        reply = `Here are some of our best drops under **₹${maxPrice}**:\n\n`;
      } else if (requestedCategories.length > 0) {
        reply = `I've got exactly what you need. Check out these **${requestedCategories.join(', ')}**:\n\n`;
      } else {
        reply = `Based on what you said, here's what I recommend:\n\n`;
      }

      // Add product links
      filtered.slice(0, 4).forEach((p: any) => {
        reply += `- [**${p.title}**](/product/${p.slug}) — ₹${p.base_price}\n`;
      });

      if (filtered.length > 4) {
        reply += `\n*Plus ${filtered.length - 4} more! Check our catalog for the full list.*`;
      }
    } else {
      if (maxPrice) {
        reply = `Ah, sorry! I couldn't find anything that matches exactly under ₹${maxPrice} right now. We sell out fast. 😅 Anything else you're looking for?`;
      } else {
        reply = "I'm not totally sure I caught that. I can help you find specific items like 'jeans', or look for things 'under 1000'. What are you hunting for?";
      }
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { reply: "Sorry, my circuits are a bit fried right now. Please try asking again later!" },
      { status: 500 }
    );
  }
}

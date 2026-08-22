import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Apply Rate Limiting (e.g., 20 requests per 10 seconds per IP)
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  if (!rateLimit(ip, 20, 10000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'newest'; // newest, price_asc, price_desc
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = await createClient();

    let dbQuery = supabase
      .from('products')
      .select('id, title, slug, base_price, images, overlay_mask_url, is_drop, created_at, category_id', { count: 'exact' });

    if (query) {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    if (category) {
      // Find category ID by slug or name
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .or(`slug.eq.${category},name.ilike.${category}`)
        .single();
      
      if (catData) {
        dbQuery = dbQuery.eq('category_id', (catData as any).id);
      }
    }

    if (minPrice) {
      dbQuery = dbQuery.gte('base_price', parseFloat(minPrice));
    }
    if (maxPrice) {
      dbQuery = dbQuery.lte('base_price', parseFloat(maxPrice));
    }

    if (sort === 'newest') {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    } else if (sort === 'price_asc') {
      dbQuery = dbQuery.order('base_price', { ascending: true });
    } else if (sort === 'price_desc') {
      dbQuery = dbQuery.order('base_price', { ascending: false });
    }

    const { data, count, error } = await dbQuery.range(offset, offset + limit - 1);

    if (error) {
      console.error('Search API error:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      results: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (err: any) {
    console.error('Search handler error:', err);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

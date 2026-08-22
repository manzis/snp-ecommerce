import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const supabase = getSupabaseAdmin();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 1. Fetch Product Price & Stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, original_price, discounted_price, stock_status')
      .eq('slug', slug)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Fetch Active Sale for this product
    const { data: saleData, error: saleError } = await supabase
      .from('sales_offers_products')
      .select(`
          sales_offers (
              id, name, slug, discount_type, discount_value, ends_at, is_active
          )
      `)
      .eq('product_id', product.id);

    let activeSale = null;
    if (!saleError && saleData && saleData.length > 0) {
      // Find the first active sale that hasn't expired
      const validSale = saleData.map((d: any) => d.sales_offers).find((sale: any) =>
          sale && sale.is_active && new Date(sale.ends_at) > new Date()
      );
      if (validSale) {
        activeSale = validSale;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        original_price: product.original_price,
        discounted_price: product.discounted_price,
        stock_status: product.stock_status,
        activeSale: activeSale
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: any) {
    console.error('Volatile API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

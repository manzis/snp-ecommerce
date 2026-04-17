import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    
    // 1. Verify Admin Role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // 2. Format a bare minimum draft payload, preventing NOT NULL failures
    const name = body.name || `Draft Product - ${new Date().toLocaleTimeString()}`;
    const baseSlug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-draft-${Date.now()}`;

    const payload = {
        name: name,
        title: body.title || name,
        slug: slug,
        is_draft: true,
        is_published: false,
        stock_count: 0,
        original_price: body.original_price ? Number(body.original_price) : 0,
        discounted_price: body.discounted_price ? Number(body.discounted_price) : 0,
        category_id: body.category_id || null,
        brand_id: body.brand_id || null,
        seller_id: body.seller_id || null,
        stock_status: 'out_of_stock'
    };

    // 3. Insert Draft Product
    const { data, error } = await finalClient
      .from('products')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
        console.error('Draft autosave error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. (Optional) Could insert basic relations here if needed, but for "mistake reload" 
    // saving just the core fields for recovery is usually sufficient as the user can edit it.
    // If we want to save everything, we apply the same logic as `createProductAction`.
    // Let's attempt to blindly insert the product info
    if (body.product_info) {
       await finalClient.from('product_info').insert([{
           ...body.product_info,
           product_id: data.id
       }]);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    console.error('Action Error: Autosave Draft:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

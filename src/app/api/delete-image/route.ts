import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deleteFromCloudinary } from '@/services/cloudinary';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
    }

    // 2. Admin role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    // 3. Parse payload
    const { public_id, resource_type } = await req.json();

    if (!public_id) {
      return NextResponse.json({ success: false, message: 'Missing public_id.' }, { status: 400 });
    }

    // 3. Delete from Cloudinary
    const result = await deleteFromCloudinary(public_id, resource_type || 'image');

    if (!result.success) {
      return NextResponse.json({ success: false, message: `Cloudinary error: ${result.result}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Asset deleted successfully.' });
  } catch (error: any) {
    console.error('[delete-image] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Deletion failed.' },
      { status: 500 }
    );
  }
}

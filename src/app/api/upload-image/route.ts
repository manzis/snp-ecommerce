import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadToCloudinary } from '@/services/cloudinary';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB for videos

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

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'snp-store';

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided.' }, { status: 400 });
    }

    // 3. Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: `Invalid file type: ${file.type}. Allowed: images and videos (MP4, WEBM, OGG)` },
        { status: 400 }
      );
    }

    // 4. Validate size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 100 MB.' },
        { status: 400 }
      );
    }

    // 5. Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine resource type
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

    const result = await uploadToCloudinary(buffer, file.name, folder, resourceType);

    return NextResponse.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (error: any) {
    console.error('[upload-image] Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed.' },
      { status: 500 }
    );
  }
}

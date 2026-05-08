'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/services/cloudinary';

/**
 * Uploads a file to Cloudinary directly from the server.
 * Existing Supabase image URLs are unaffected.
 */
export async function uploadFileAction(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: 'Unauthorized. Please log in.' };
    }

    // 2. Permission check: Admin can upload anywhere, customers only to their order folders
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const folder = (formData.get('folder') as string || formData.get('path') as string) || 'snp-store';

    // Security: Only admins can upload to general folders (brands, products, etc.)
    // Customers can only upload to 'orders/{userId}' or 'payment-proofs'
    if (!isAdmin) {
        const isOrderFolder = folder.startsWith('orders/') || folder.startsWith('payment-proofs');
        if (!isOrderFolder) {
            return { success: false, message: 'Forbidden. Admin access required.' };
        }
    }

    const file = formData.get('file') as File;
    if (!file) return { success: false, message: 'No file provided.' };

    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

        const result = await uploadToCloudinary(buffer, file.name, folder, resourceType);

        return { success: true, url: result.secure_url, path: result.public_id };
    } catch (error: any) {
        console.error('Action Error: uploadFileAction:', error);
        return { success: false, message: error.message || 'Failed to upload image.' };
    }
}

/**
 * Deletes a file from Cloudinary (new assets).
 */
export async function deleteFileAction(pathOrPublicId: string, type: 'image' | 'video' = 'image') {
    if (!pathOrPublicId) return { success: false, message: 'No ID provided.' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Unauthorized.' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, message: 'Forbidden.' };
    }

    try {
        const result = await deleteFromCloudinary(pathOrPublicId, type);
        return result;
    } catch (error: any) {
        console.error('Action Error: deleteFileAction:', error);
        return { success: false, message: error.message || 'Failed to delete asset.' };
    }
}


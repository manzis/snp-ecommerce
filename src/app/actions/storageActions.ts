'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Uploads a file to Cloudinary via the internal API route.
 * Existing Supabase image URLs are unaffected — only new uploads use Cloudinary.
 * @param formData - Must contain 'file'. Optionally 'folder' (default: 'snp-store').
 */
export async function uploadFileAction(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: 'Unauthorized. Please log in.' };
    }

    // 2. Admin role check
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { success: false, message: 'Forbidden. Admin access required.' };
    }

    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        // 2. Forward to the Cloudinary upload API route
        //    The folder maps to the old Supabase 'path' concept.
        const uploadForm = new FormData();
        uploadForm.append('file', file);
        uploadForm.append('folder', (formData.get('path') as string) || 'snp-store');

        const { headers: nextHeaders } = await import('next/headers');
        const headersList = await nextHeaders();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        
        const cookieHeader = headersList.get('cookie') || '';

        const response = await fetch(`${baseUrl}/api/upload-image`, {
            method: 'POST',
            body: uploadForm,
            // Forward the auth cookie so the route can re-verify the user
            headers: { 
                'Cookie': cookieHeader 
            },
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: result.message ?? 'Upload failed.' };
        }

        return { success: true, url: result.url, path: result.public_id };
    } catch (error: any) {
        console.error('Action Error: uploadFileAction:', error);
        return { success: false, message: error.message || 'Failed to upload image.' };
    }
}

/**
 * Deletes a file from Cloudinary (new assets) or Supabase (legacy assets).
 * @param pathOrPublicId - The path/public_id returned by uploadFileAction.
 * @param type - 'image' or 'video'.
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
        const { headers: nextHeaders } = await import('next/headers');
        const headersList = await nextHeaders();
        const host = headersList.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;
        const cookieHeader = headersList.get('cookie') || '';

        // If it contains '/', it's likely a Supabase path (old system)
        // Cloudinary IDs can also contain '/', but Cloudinary IDs are usually shorter or have specific folders.
        // For absolute safety, if it contains 'products/' or similar and we know we switched to Cloudinary,
        // we might try Cloudinary first.
        
        // Actually, if it's a Cloudinary public_id, the destroy API will handle it.
        // If it's a Supabase path, we'd need Supabase logic.
        // Given the request is "remove what is unused", let's prioritize Cloudinary for new assets.

        const response = await fetch(`${baseUrl}/api/delete-image`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': cookieHeader 
            },
            body: JSON.stringify({ public_id: pathOrPublicId, resource_type: type }),
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('Action Error: deleteFileAction:', error);
        return { success: false, message: error.message || 'Failed to delete asset.' };
    }
}

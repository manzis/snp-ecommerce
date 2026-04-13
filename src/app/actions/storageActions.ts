'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * @param formData - Must contain 'file' and 'path' fields.
 */
export async function uploadFileAction(formData: FormData) {
    const supabase = await createClient();
    
    // 1. Auth Check - Ensure user is logged in
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, message: 'Unauthorized. Please log in.' };
    }

    // 2. Extract data
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'snp-storage';
    const subfolder = formData.get('path') as string || 'general';

    if (!file) {
        return { success: false, message: 'No file provided.' };
    }

    try {
        // 3. Prepare unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${subfolder}/${fileName}`;

        // 4. Upload to Storage
        const { data, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                upsert: true,
                contentType: file.type,
            });

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            return { success: false, message: uploadError.message };
        }

        // 5. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { 
            success: true, 
            url: publicUrl,
            path: filePath
        };
    } catch (error: any) {
        console.error('Action Error: uploadFileAction:', error);
        return { success: false, message: error.message || 'Failed to upload image.' };
    }
}

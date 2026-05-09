/**
 * Client-side Cloudinary upload utility.
 * Use this in Admin components to upload large files (videos) directly to Cloudinary,
 * bypassing Vercel's 4.5MB Server Action limit.
 */

import imageCompression from 'browser-image-compression';

export interface ClientUploadResult {
    success: boolean;
    url?: string;
    public_id?: string;
    message?: string;
}

export async function uploadFileClientSide(
    file: File,
    folder: string = 'snp-store'
): Promise<ClientUploadResult> {
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();

        // 0. Compress if it's an image
        let fileToUpload = file;
        const isImage = file.type.startsWith('image/');
        const isAnim = file.type.includes('gif') || file.type.includes('svg');
        
        if (isImage && !isAnim) {
            try {
                const options = {
                    maxSizeMB: 0.3, // Compress to max 300KB
                    maxWidthOrHeight: 1200, // Max 1200px width/height
                    useWebWorker: true,
                    fileType: 'image/webp' as string, // Convert to webp
                };
                fileToUpload = await imageCompression(file, options);
            } catch (error) {
                console.error("Image compression failed, falling back to original:", error);
            }
        }

        // 1. Get signature from our API
        const signResponse = await fetch('/api/cloudinary/sign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timestamp, folder }),
        });

        const signData = await signResponse.json();
        if (!signData.success) {
            throw new Error(signData.message || 'Failed to get upload signature.');
        }

        const { signature, apiKey, cloudName } = signData;

        // 2. Prepare Form Data for Cloudinary
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        // Determine resource type (image vs video)
        const resourceType = fileToUpload.type.startsWith('video/') ? 'video' : 'image';
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        // 3. Upload directly to Cloudinary
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok) {
            throw new Error(uploadResult.error?.message || 'Cloudinary upload failed.');
        }

        return {
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };
    } catch (error: any) {
        console.error('[uploadFileClientSide] Error:', error);
        return {
            success: false,
            message: error.message || 'Direct upload failed.',
        };
    }
}

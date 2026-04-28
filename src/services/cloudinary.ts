/**
 * Cloudinary upload service.
 * SERVER-SIDE ONLY — never import this in client components.
 */

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/**
 * Uploads a file buffer to Cloudinary via the REST upload API.
 * Returns the secure_url of the uploaded asset.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'snp-store',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<CloudinaryUploadResult> {
  // Build multipart form for the unsigned/signed upload endpoint
  const formData = new FormData();

  const blob = new Blob([new Uint8Array(fileBuffer)]);
  formData.append('file', blob, fileName);
  formData.append('folder', folder);
  formData.append('api_key', CLOUDINARY_API_KEY);

  // Generate SHA-1 signature  (timestamp + folder + secret)
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signaturePayload = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(signaturePayload);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message ?? 'Cloudinary upload failed.');
  }

  const result = await response.json();
  return {
    secure_url: result.secure_url as string,
    public_id: result.public_id as string,
  };
}

/**
 * Deletes an asset from Cloudinary using the Admin/Upload API.
 * @param publicId - The public_id of the asset (including folder).
 * @param resourceType - 'image' or 'video'.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; result?: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signaturePayload = `public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(signaturePayload);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);

  const deleteUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`;

  const response = await fetch(deleteUrl, {
    method: 'POST',
    body: formData,
  });

  const resData = await response.json();

  if (!response.ok || resData.result !== 'ok') {
    console.error('Cloudinary Delete Error:', resData);
    return { success: false, result: resData.result || 'failed' };
  }

  return { success: true, result: resData.result };
}

/**
 * Extracts a Cloudinary public_id from a secure_url.
 * Handles patterns like: .../upload/v12345/folder/id.jpg
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) return null;

  try {
    // Split by '/upload/' to get the part after the versioning/transformations
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // The second part starts with 'v123456789/' (optional) or directly the public_id
    const afterUpload = parts[1];
    
    // Remove the version (e.g., 'v123456789/') if it exists
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');

    // Remove the file extension (e.g., '.jpg', '.mp4')
    const lastDotIndex = withoutVersion.lastIndexOf('.');
    if (lastDotIndex === -1) return withoutVersion;
    
    return withoutVersion.substring(0, lastDotIndex);
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

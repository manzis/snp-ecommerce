/**
 * Mock utility for Image / Media Storage
 * 
 * Recommended Folder Structure (AWS S3 or Supabase Storage):
 * - /images/products/
 * - /images/brands/
 * - /images/customers/
 * - /images/categories/
 */

export async function uploadImageToStorage(file: File, path: string): Promise<string> {
  console.log(`Uploading ${file.name} to ${path}...`);
  // Mock upload delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a mock URL
  return `https://mock-storage.com/${path}/${file.name}`;
}

export function getImageUrl(path: string): string {
  // In production, this would append your S3/Supabase base URL
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://mock-storage.com';
  return `${baseUrl}/${path}`;
}

/**
 * Example Usage:
 * const imageUrl = await uploadImageToStorage(file, 'images/products/gold-standard-whey');
 */

/**
 * Utility to automatically inject Cloudinary optimization parameters 
 * (f_auto, q_auto, w_width) into raw Cloudinary upload URLs.
 * This ensures lightning-fast image loading since Next.js unoptimized=true is set.
 */

export function optimizeImage(url: string | undefined | null, width: number = 800, quality: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' = 'auto'): string {
  if (!url) return '/icon.png';

  // Only apply to Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // If it already contains transformations, return as-is to avoid stacking
    if (url.includes('/upload/f_') || url.includes('/upload/q_')) {
      return url;
    }

    // Inject format auto (WebP/AVIF), quality, max width, and DPR awareness
    return url.replace('/upload/', `/upload/f_auto,q_${quality},w_${width},dpr_auto/`);
  }

  // Return local or other URLs as-is
  return url;
}

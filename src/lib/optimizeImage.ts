/**
 * Utility to automatically inject Cloudinary optimization parameters 
 * (f_auto, q_auto, w_width) into raw Cloudinary upload URLs.
 * This ensures lightning-fast image loading since Next.js unoptimized=true is set.
 */

export function optimizeImage(url: string | undefined | null, width: number = 800): string {
  if (!url) return '/images/shoplogo.png';

  // Only apply to Cloudinary URLs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // If it already contains transformations, return as-is to avoid stacking
    if (url.includes('/upload/f_') || url.includes('/upload/q_')) {
      return url;
    }

    // Inject format auto (WebP/AVIF), quality auto, and a max width
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }

  // Return Supabase or local URLs as-is
  return url;
}

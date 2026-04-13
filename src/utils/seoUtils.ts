/**
 * SEO Stop words to filter out of slugs
 */
const SEO_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'if', 'then', 'else', 'when',
  'at', 'from', 'by', 'on', 'off', 'for', 'in', 'out', 'over', 'to', 'into', 'with'
]);

/**
 * Generates an SEO-optimized slug from a product name and optional brand.
 * Inspired by Amazon/Flipkart patterns.
 */
export function generateSEOSlug(name: string, brandName?: string): string {
  // Combine brand and name for context
  const base = brandName ? `${brandName} ${name}` : name;
  
  return base
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric except spaces/hyphens
    .split(/\s+/)             // Split into tokens
    .filter(token => token.length > 0 && !SEO_STOP_WORDS.has(token)) // Filter tokens
    .join('-')                // Join with hyphens
    .replace(/--+/g, '-')     // Remove double hyphens
    .replace(/^-+|-+$/g, '')  // Trim hyphens from ends
    .substring(0, 100);       // Cap length for URL safety
}

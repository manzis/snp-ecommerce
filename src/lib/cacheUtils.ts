import { revalidateTag } from 'next/cache';

/**
 * Surgically invalidate all caches related to a specific product to prevent Vercel ISR Write spikes.
 * This avoids nuking the entire store cache (e.g. `revalidateTag('products')`).
 */
export function revalidateProduct(productId: string, slug?: string) {
    if (slug) {
        revalidateTag(`product-slug-${slug}`, 'max');
    }
    revalidateTag(`product-related-${productId}`, 'max');
    revalidateTag(`product-brand-related-${productId}`, 'max');
    revalidateTag(`product-reviews-${productId}`, 'max');
    revalidateTag(`product-qa-${productId}`, 'max');

    // Always invalidate lists and homepage when a product changes
    revalidateTag('products-list', 'max');
    revalidateTag('homepage-products', 'max');

}

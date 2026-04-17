'use server';

import { fetchHomepageProducts, updateHomepageProducts } from '@/services/productService';
import { revalidatePath } from 'next/cache';

/**
 * Fetch products for a section
 */
export async function fetchHomepageProductsAction(sectionKey?: string) {
  try {
    const products = await fetchHomepageProducts(sectionKey);
    return { success: true, data: products };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Update products for a section
 */
export async function updateHomepageProductsAction(sectionKey: string, productIds: string[]) {
  try {
    const success = await updateHomepageProducts(sectionKey, productIds);
    if (success) {
      revalidatePath('/'); // Revalidate storefront homepage
      revalidatePath('/admin/layouts');
      return { success: true, message: `Successfully updated ${sectionKey}` };
    }
    return { success: false, message: `Failed to update ${sectionKey}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

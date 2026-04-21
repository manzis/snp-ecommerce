import { Product, Category, Brand } from '@/services/productService';

/**
 * SEO Auto-Fallback Engine
 * Generated optimized SEO when Admin dashboard overrides are missing.
 */

// Format generic strings
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export function generateProductFallbackSeo(product: Product, brandName?: string, categoryName?: string) {
  const brandSub = brandName || product.brands?.name || 'Bright Supplements';
  const catSub = categoryName || product.categories?.name || 'Supplements';

  const title = `Buy ${product.title || product.name} in Nepal | ${brandSub}`;
  const description = product.discounted_price && Number(product.discounted_price) < Number(product.original_price)
    ? `Get ${product.title || product.name} by ${brandSub} in Nepal. Authentic ${catSub} at the best price - Rs. ${product.discounted_price}. Shop now at Bright Supplements!`
    : `Buy authentic ${product.title || product.name} by ${brandSub} in Nepal. Get the best ${catSub} deals at Bright Supplements.`;
  
  const keywords = `${product.title}, buy ${product.name} nepal, ${brandSub} nepal, ${catSub} nepal, supplement store nepal`;

  return { title, description, keywords };
}

export function generateCategoryFallbackSeo(category: Category) {
  const title = `Best ${category.name} Supplements in Nepal | Bright Supplements`;
  const description = `Shop authentic ${category.name} in Nepal. Explore our premium range of ${category.name} supplements at the best prices with nationwide delivery from Bright Supplements.`;
  const keywords = `buy ${category.name} nepal, best ${category.name} supplements nepal, authentic ${category.name} online`;

  return { title, description, keywords };
}

export function generateBrandFallbackSeo(brand: Brand) {
  const title = `${brand.name} Supplements in Nepal | Authentic Products | Bright Supplements`;
  const description = `Buy 100% authentic ${brand.name} supplements in Nepal. Get the best prices on premium ${brand.name} nutrition products at Bright Supplements. Fast delivery nationwide.`;
  const keywords = `buy ${brand.name} nepal, authentic ${brand.name} supplements, ${brand.name} dealer nepal, best ${brand.name} prices`;

  return { title, description, keywords };
}

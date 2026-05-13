import { Product, Category, Brand } from '@/services/productService';

/**
 * SEO Auto-Fallback Engine — Nepal Supplement Industry Optimized
 * Generates research-grade SEO metadata when Admin dashboard overrides are missing.
 * Keyword strategy targets: local intent, brand trust, price comparison, COD signals.
 */

const BRAND_NAME = 'Supplyment Nepal';
const BRAND_ALIAS = 'Bright Supplements'; // Secondary known name — kept for dual-brand discoverability
const SITE_URL = 'https://www.brightsupplements.store';
const DEFAULT_OG_IMAGE = '/icon.png';

// Keyword-rich location + intent modifiers
const NEPAL_QUALIFIERS = [
  'in Nepal',
  'online Nepal',
  'in Kathmandu',
  'Nepal price',
];

const HIGH_INTENT_SUFFIXES = [
  'best price',
  'genuine product',
  'authentic supplement',
  'cash on delivery',
  'nationwide delivery Nepal',
];

// ─── PRODUCT SEO FALLBACK ─────────────────────────────────────────────────────
export function generateProductFallbackSeo(
  product: Product,
  brandName?: string,
  categoryName?: string
) {
  const brandSub = brandName || product.brands?.name || BRAND_NAME;
  const catSub = categoryName || product.categories?.name || 'Supplement';
  const productTitle = product.title || product.name;
  const discountedPrice = Number(product.discounted_price);
  const hasDiscount =
    discountedPrice > 0 &&
    discountedPrice < Number(product.original_price);

  // Intent-rich title targeting "buy X in Nepal" pattern (proven high CTR)
  const title = `Buy ${productTitle} in Nepal | Best Price | ${brandSub} – ${BRAND_NAME}`;

  // Description with price signal + trust + local intent
  const description = hasDiscount
    ? `Buy authentic ${productTitle} by ${brandSub} in Nepal at Rs. ${product.discounted_price}. ${catSub} with guaranteed genuine quality. Fast delivery Kathmandu & nationwide. Cash on delivery available. Shop at ${BRAND_NAME} (brightsupplements.store).`
    : `Buy original ${productTitle} by ${brandSub} online in Nepal. Best price on authentic ${catSub} at ${BRAND_NAME}. Free shipping above Rs. 2000. Genuine product guaranteed.`;

  // Long-tail keyword cluster for the product
  const keywords = [
    `buy ${productTitle} in Nepal`,
    `${productTitle} price Nepal`,
    `buy ${brandSub} ${productTitle} in nepal`,
    `${brandSub} products in nepal`,
    `${productTitle} ${brandSub} Nepal`,
    `${brandSub} ${catSub} Nepal`,
    `authentic ${productTitle} Kathmandu`,
    `${productTitle} online Nepal`,
    `buy ${catSub} supplement Nepal`,
    `best ${catSub} Nepal price`,
    `genuine supplement store Nepal`,
    `supplement shop Nepal`,
    `${productTitle} cash on delivery Nepal`,
    `${productTitle} cod Nepal`,
    `${BRAND_NAME} ${productTitle}`,
    `${BRAND_ALIAS} ${productTitle} Nepal`,
  ].join(', ');

  return { title, description, keywords };
}

// ─── CATEGORY SEO FALLBACK ───────────────────────────────────────────────────
export function generateCategoryFallbackSeo(category: Category) {
  const catName = category.name;

  // Category title targets "Best X Supplements in Nepal" — high-volume pattern
  const title = `Buy ${catName} Supplements in Nepal | Best Price | ${BRAND_NAME}`;

  const description =
    `Shop 100% authentic ${catName} supplements in Nepal at ${BRAND_NAME} (brightsupplements.store). Premium range of ${catName} products — best prices, fast delivery to Kathmandu & all Nepal. ` +
    `Genuine brands, cash on delivery available.`;

  const keywords = [
    `buy ${catName} supplement Nepal`,
    `best ${catName} Nepal`,
    `${catName} price in Nepal`,
    `${catName} online Nepal`,
    `cheap ${catName} Kathmandu`,
    `authentic ${catName} supplement Nepal`,
    `best ${catName} supplement store Nepal`,
    `${catName} Nepal delivery`,
    `${catName} supplement price Nepal`,
    `buy ${catName} online Nepal cod`,
    `genuine supplement Nepal`,
    `supplement store Kathmandu`,
    `${BRAND_NAME} ${catName}`,
    `${BRAND_ALIAS} ${catName} Nepal`,
  ].join(', ');

  return { title, description, keywords };
}

// ─── BRAND SEO FALLBACK ───────────────────────────────────────────────────────
export function generateBrandFallbackSeo(brand: Brand) {
  const brandName = brand.name;

  // Brand title targets: "[Brand] Nepal" — exactly what users search when brand-aware
  const title = `Buy ${brandName} Products in Nepal | 100% Authentic | ${BRAND_NAME}`;

  const description =
    `Buy 100% authentic ${brandName} supplements in Nepal. ${BRAND_NAME} (brightsupplements.store) is an authorized dealer of ${brandName} — get genuine products at the best Nepal price. ` +
    `Fast delivery to Kathmandu, Pokhara & all of Nepal. Cash on delivery available.`;

  const keywords = [
    `${brandName} Nepal`,
    `buy ${brandName} products in nepal`,
    `${brandName} products in nepal`,
    `buy ${brandName} online Nepal`,
    `${brandName} price in Nepal`,
    `${brandName} supplement Nepal`,
    `authentic ${brandName} Nepal`,
    `original ${brandName} Nepal`,
    `${brandName} authorized dealer Nepal`,
    `${brandName} Kathmandu`,
    `${brandName} supplement store Nepal`,
    `buy ${brandName} cod Nepal`,
    `genuine ${brandName} Nepal`,
    `${brandName} cheapest price Nepal`,
    `${BRAND_NAME} ${brandName}`,
    `${BRAND_ALIAS} ${brandName} Nepal`,
  ].join(', ');

  return { title, description, keywords };
}

// ─── HOME PAGE SEO FALLBACK ───────────────────────────────────────────────────
export function generateHomeFallbackSeo() {
  const title = `${BRAND_NAME} | Buy Authentic Supplements Online in Nepal`;

  const description =
    `${BRAND_NAME} — Nepal's most trusted supplement store (brightsupplements.store). Buy 100% genuine whey protein, mass gainer, creatine, pre-workout & vitamins online. ` +
    `Best prices in Nepal with fast delivery to Kathmandu, Pokhara & nationwide. Cash on delivery available.`;

  const keywords = [
    'buy supplements online Nepal',
    'best supplement store Nepal',
    'authentic whey protein Nepal',
    'protein powder price Nepal',
    'mass gainer Nepal',
    'creatine Nepal',
    'pre-workout Nepal',
    'gym supplements Nepal',
    'buy protein powder online Nepal',
    'supplement shop Kathmandu',
    'genuine supplement Nepal',
    'cheap protein Nepal',
    'best gym nutrition Nepal',
    'whey protein price in Nepal',
    'online supplement store Nepal cod',
    'supplement delivery Nepal',
    'fitness nutrition Nepal',
    'muscle gainer Nepal',
    'bcaa Nepal',
    'vitamin supplements Nepal',
    'Supplyment Nepal supplements',
    'Supplyment Nepal Nepal',
    'brightsupplements.store',
  ].join(', ');

  return { title, description, keywords };
}

// ─── STATIC PAGE SEO FALLBACKS ───────────────────────────────────────────────
export function generatePageFallbackSeo(pageId: string): {
  title: string;
  description: string;
  keywords: string;
} {
  const pages: Record<string, { title: string; description: string; keywords: string }> = {
    home: generateHomeFallbackSeo(),
    products: {
      title: `Buy Supplements Online Nepal | Best Price | ${BRAND_NAME}`,
      description: `Browse ${BRAND_NAME}'s widest collection of authentic supplements. Whey protein, mass gainers, creatine, pre-workout & vitamins — all at the best prices with fast nationwide delivery. Shop at brightsupplements.store.`,
      keywords: `all supplements Nepal, buy protein online Nepal, supplement collection Nepal, buy vitamins Nepal, gym supplements store`,
    },
    brands: {
      title: `Top Supplement Brands in Nepal | Authentic | ${BRAND_NAME}`,
      description: `Shop top international supplement brands in Nepal — MuscleBlaze, ON, Dymatize, MyProtein, BSN & more. 100% authentic with best Nepal prices.`,
      keywords: `supplement brands Nepal, international brands Nepal, whey protein brands Nepal, ON whey Nepal, MuscleBlaze Nepal, Dymatize Nepal`,
    },
    contact: {
      title: `Contact Us | ${BRAND_NAME} Nepal`,
      description: `Get in touch with ${BRAND_NAME}. We are Nepal's trusted supplement store based in Kathmandu. Reach us for orders, queries or partnerships.`,
      keywords: `contact supplement store Nepal, Supplyment Nepal Kathmandu, Supplyment Nepal contact, supplement help Nepal`,
    },
    shipping: {
      title: `Shipping & Delivery Info | ${BRAND_NAME} Nepal`,
      description: `Fast and reliable supplement delivery across Nepal. Same-day delivery in Kathmandu, nationwide delivery in 2-5 days. Cash on delivery available.`,
      keywords: `supplement delivery Nepal, fast shipping Nepal, supplement cod Nepal, Kathmandu delivery supplements`,
    },
    refund: {
      title: `Refund Policy | ${BRAND_NAME} Nepal`,
      description: `Easy and transparent refund policy at ${BRAND_NAME}. Customer satisfaction is our top priority. Return genuine supplements within 7 days.`,
      keywords: `supplement refund policy Nepal, return policy supplement store Nepal`,
    },
    terms: {
      title: `Terms & Conditions | ${BRAND_NAME} Nepal`,
      description: `Read the terms and conditions for shopping at ${BRAND_NAME}, Nepal's premier supplement store.`,
      keywords: `supplement store terms Nepal, Supplyment Nepal terms conditions, Supplyment Nepal terms`,
    },
    distributor: {
      title: `Become a Distributor | ${BRAND_NAME} Nepal`,
      description: `Join ${BRAND_NAME} as a distributor and sell premium authentic supplements in Nepal. Authorized dealer opportunities for Kathmandu and beyond.`,
      keywords: `supplement distributor Nepal, become supplement dealer Nepal, authorized supplement dealer Kathmandu`,
    },
    essentials: {
      title: `Daily Essentials & Vitamins | ${BRAND_NAME} Nepal`,
      description: `Shop essential daily vitamins, omega-3, multivitamins and health supplements in Nepal. Best prices with fast delivery nationwide.`,
      keywords: `vitamins Nepal, daily essentials Nepal, multivitamin Nepal, omega 3 Nepal, health supplements Nepal`,
    },
  };

  return (
    pages[pageId] || {
      title: `${BRAND_NAME} | Nepal's Best Supplement Store`,
      description: `Shop authentic supplements in Nepal at ${BRAND_NAME}. Best prices, genuine products, fast delivery.`,
      keywords: `supplement store Nepal, buy supplements online Nepal, authentic supplements Nepal`,
    }
  );
}

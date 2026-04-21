import { supabase } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { cache } from 'react';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  benefits?: string;
  product_count?: number;
  is_other_category?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  cover_image?: string;
  rating?: number;
  total_purchases?: number;
  description?: string;
  product_count?: number;
}

/** Mirrors the public.reviews table schema exactly */
export interface Review {
  id: string;
  product_id: string | null;       // uuid FK → products.id, on delete CASCADE
  author: string;                   // varchar(255) NOT NULL
  role: string | null;              // varchar(255) nullable
  text: string;                     // text NOT NULL
  rating: number;                   // numeric(2,1) NOT NULL — e.g. 4.5, 5.0
  image: string | null;             // varchar(1000) nullable
  media_type?: 'image' | 'video';   // UI-only or DB if added later
  author_avatar?: string | null;    // New field for reviewer profile photo
  is_verified: boolean;             // boolean, default false
  is_featured_home?: boolean;       // boolean, default false
  home_title?: string | null;       // varchar(255) nullable
  created_at: string;               // timestamptz, auto-set by DB
  products?: {                      // Nested product data from join
    title: string;
    name: string;
    images?: string[];
  };
}

export interface ProductSize {
  id: string;
  size_label: string;
  image_url?: string;
  is_available: boolean;
}

export interface ProductFlavour {
  id: string;
  flavour_name: string;
  image_url: string;
  is_available: boolean;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  is_verified: boolean;
  rating: number;
  details: string;
  image_url?: string;
}

export interface ProductHighlightItem {
  type: 'video' | 'image';
  src: string;
  poster?: string;
  alt: string;
}

export interface ProductInfo {
  id: string;
  product_id: string;
  description: string;
  ingredients_image: string;
  manufacture_info: Record<string, string>;
  other_details: Record<string, string>;
}


export interface QAPair {
  id: string;
  product_id: string;
  question: string;
  answer: string | null;
  author: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_id: string | null;
  flavour_id: string | null;
  original_price: number;
  discounted_price: number;
  stock_count: number;
  is_available: boolean;
  size?: ProductSize;
  flavour?: ProductFlavour;
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    title: string;
    original_price: string;
    discounted_price: string;
    discount_percentage: string;
    rating: number;
    reviews_count: string;
    images: string[];
    highlights: ProductHighlightItem[];
    stock_status?: 'in_stock' | 'out_of_stock' | 'pre_order';
    is_published?: boolean;
    is_draft?: boolean;
    category_id?: string;
    brand_id?: string;
    seller_id?: string;
    stock_count: number;
    tags?: string[];
    categories?: Category;  // Due to PostgREST relationship mapping
    brands?: Brand;         // Due to PostgREST relationship mapping
    sellers?: Seller;       // Due to PostgREST relationship mapping
    product_sizes?: ProductSize[];
    product_flavours?: ProductFlavour[];
    product_info?: ProductInfo[] | ProductInfo; 
    product_variants?: ProductVariant[];
    product_banners?: any[];
    banner_image1?: string;
    banner_image2?: string;
    banner_image3?: string;
    banner_image4?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_cart_value: number;
  product_id: string | null;
  description: string | null;
  is_active: boolean;
  expires_at: string | null;
  max_discount: number | null;
  created_at: string;
  products?: { id: string, title: string } | null;
}



/**
 * Update product attributes (Visibility, stock_status, is_draft, etc.)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  // Filter out non-DB fields before updating
  const dbUpdates = { ...updates };
  const fieldsToStrip = [
    'categories', 'brands', 'sellers', 'product_sizes', 
    'product_flavours', 'product_info', 'product_variants', 'id',
    'hasManuallyEditedSlug', 'has_variants', 'temp_sizes', 'temp_flavours'
  ];
  
  fieldsToStrip.forEach(field => delete (dbUpdates as any)[field]);

  const { data, error, status } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select(); // Request data back to verify it actually matched a row

  if (error) {
    console.error(`[productService] Error updating product ${id}:`, error);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn(`[productService] No product found with id ${id} to update. Status: ${status}`);
    return false;
  }

  console.log(`[productService] Successfully updated product ${id}. Rows affected: ${data.length}`);
  return true;
}

/**
 * Fetch all categories with product counts
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      products:products(count)
    `)
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Map the product count from the nested array
  return (data as any[]).map(cat => ({
    ...cat,
    product_count: cat.products?.[0]?.count || 0
  })) as Category[];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
  return data as Category;
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select(`
      *,
      products:products(count)
    `)
    .order('name');
    
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }

  return (data as any[]).map(b => ({
    ...b,
    product_count: b.products?.[0]?.count || 0
  })) as Brand[];
}

/**
 * Fetch a single brand by slug
 */
export async function fetchBrandBySlug(slug: string): Promise<Brand | null> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) {
    console.error(`Error fetching brand ${slug}:`, error);
    return null;
  }
  return data as Brand;
}

/**
 * Fetch all sellers
 */
export async function fetchSellers(): Promise<Seller[]> {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching sellers:', error);
    return [];
  }
  return data as Seller[];
}

/**
 * Fetch products with relations, optionally filtered
 */
export async function fetchProducts(options?: { brandSlug?: string; categorySlug?: string; search?: string }): Promise<Product[]> {
  const brandPart = options?.brandSlug ? 'brands!inner(*)' : 'brands(*)';
  const categoryPart = options?.categorySlug ? 'categories!inner(*)' : 'categories(*)';

  let query = supabase
    .from('products')
    .select(`
      *,
      ${categoryPart},
      ${brandPart},
      sellers (*),
      product_sizes (*),
      product_flavours (*),
      product_info (*),
      product_variants (*)
    `)
    .eq('is_published', true);

  if (options?.brandSlug) {
    query = query.eq('brands.slug', options.brandSlug);
  }
  
  if (options?.categorySlug) {
    query = query.eq('categories.slug', options.categorySlug);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,title.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return (data as any[]).map(p => ({
    ...p,
    categories: Array.isArray(p.categories) ? p.categories[0] : (p.categories || null),
    brands: Array.isArray(p.brands) ? p.brands[0] : (p.brands || null),
    sellers: Array.isArray(p.sellers) ? p.sellers[0] : (p.sellers || null)
  })) as Product[];
}

/**
 * Fetch products with pagination and total count
 */
export async function fetchProductsPaginated(page: number, pageSize: number, options?: { brandSlug?: string; categorySlug?: string; search?: string }): Promise<{ products: Product[]; totalCount: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(`
      id, slug, name, title, images,
      original_price, discounted_price, discount_percentage,
      stock_count, stock_status, is_published, is_draft,
      rating, reviews_count, created_at,
      brands (id, name, slug),
      product_sizes (id, size_label),
      product_flavours (id, flavour_name),
      product_variants (id, original_price, discounted_price, stock_count, is_available)
    `, { count: 'estimated' });

  if (options?.brandSlug) {
    query = query.eq('brands.slug', options.brandSlug);
  }
  
  if (options?.categorySlug) {
    query = query.eq('categories.slug', options.categorySlug);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,title.ilike.%${options.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) {
    console.error('Error fetching paginated products:', error);
    return { products: [], totalCount: 0 };
  }
  
  return { 
    products: (data as any[]).map(p => ({
      ...p,
      brands: Array.isArray(p.brands) ? p.brands[0] || null : p.brands,
    })) as Product[], 
    totalCount: count || 0 
  };
}

/**
 * Fetch a single product tightly coupled with variants
 */
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (*),
      brands (*),
      sellers (*),
      product_sizes (*),
      product_flavours (*),
      product_info (*),
      product_variants (*, size:product_sizes(*), flavour:product_flavours(*)),
      product_banners (*, banner:banners (*, products!banners_target_product_id_fkey(id, slug)))
    `)
    .eq('id', id)
    .single();
    
  if (!data) return null;
  
  return {
    ...data,
    categories: Array.isArray(data.categories) ? data.categories[0] : (data.categories || null),
    brands: Array.isArray(data.brands) ? data.brands[0] : (data.brands || null),
    sellers: Array.isArray(data.sellers) ? data.sellers[0] : (data.sellers || null)
  } as Product;
}

/**
 * Fetch a single product tightly coupled with variants by slug
 */
export const fetchProductBySlug = cache(async function(slug: string, options?: { requirePublished?: boolean }): Promise<Product | null> {
  const requirePublished = options?.requirePublished ?? true;
  
  let query = supabase
    .from('products')
    .select(`
      *,
      categories (*),
      brands (*),
      sellers (*),
      product_sizes (*),
      product_flavours (*),
      product_info (*),
      product_variants (*, size:product_sizes(*), flavour:product_flavours(*)),
      product_banners (*, banner:banners (*, target_product:products!banners_target_product_id_fkey(id, slug)))
    `)
    .eq('slug', slug);

  if (requirePublished) {
    query = query.eq('is_published', true);
  }
  
  const { data, error } = await query.single();
    
  if (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }

  if (!data) return null;
  
  return {
    ...data,
    categories: Array.isArray(data.categories) ? data.categories[0] : (data.categories || null),
    brands: Array.isArray(data.brands) ? data.brands[0] : (data.brands || null),
    sellers: Array.isArray(data.sellers) ? data.sellers[0] : (data.sellers || null)
  } as Product;
});

/**
 * Fetch reviews for a specific product
 */
export const fetchProductReviews = cache(async function(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, author_avatar')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Error fetching reviews for ${productId}:`, error);
    return [];
  }
  return data as Review[];
});

/**
 * Fetch QA for a specific product
 */
export const fetchProductQA = cache(async function(productId: string): Promise<QAPair[]> {
  const { data, error } = await supabase
    .from('product_qa')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Error fetching QA for ${productId}:`, error);
    return [];
  }
  return data as QAPair[];
});

/**
 * Update product stock status
 */
export async function updateProductStatus(id: string, status: Product['stock_status']): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update({ stock_status: status })
    .eq('id', id);

  if (error) {
    console.error(`Error updating product status for ${id}:`, error);
    return false;
  }
  return true;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
  return true;
}

/**
 * Update variant prices (Upsert pattern for variety management)
 */
export async function updateProductVariantPrices(productId: string, variants: Partial<ProductVariant>[]): Promise<boolean> {
  // Map and sanitize the variants - IMPORTANT: strip UI-only fields like 'size' and 'flavour'
  const variantsToUpsert = variants.map(v => {
    const cleanVariant = {
        product_id: productId,
        size_id: v.size_id,
        flavour_id: v.flavour_id,
        original_price: v.original_price,
        discounted_price: v.discounted_price,
        stock_count: v.stock_count ?? 0,
        is_available: v.is_available ?? true
    };
    
    // Remove null keys if you want to allow global defaults, 
    // but here we need them for the onConflict match
    return cleanVariant;
  });

  const { error } = await supabase
    .from('product_variants')
    .upsert(variantsToUpsert, { onConflict: 'product_id,size_id,flavour_id' });

  if (error) {
    console.error(`Error updating variant prices for ${productId}:`, error);
    return false;
  }
  return true;
}

/**
 * HOMEPAGE LAYOUT SERVICES
 */

/**
 * Fetch products associated with a specific homepage section
 */
export async function fetchHomepageProducts(sectionKey?: string): Promise<Product[]> {
  let query = supabase
    .from('homepage_products')
    .select(`
      product:products (
        *,
        categories (*),
        brands (*)
      )
    `)
    .order('display_order', { ascending: true });

  if (sectionKey) {
    query = query.eq('section_key', sectionKey);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('[productService] Error fetching homepage products:', error);
    return [];
  }

  // Format the nested select results back into flat Product array
  return (data as any[]).map(item => ({
    ...item.product,
    categories: Array.isArray(item.product.categories) ? item.product.categories[0] : (item.product.categories || null),
    brands: Array.isArray(item.product.brands) ? item.product.brands[0] : (item.product.brands || null)
  })) as Product[];
}

/**
 * Update (Replace) products in a specific homepage section
 */
export async function updateHomepageProducts(sectionKey: string, productIds: string[]): Promise<boolean> {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    console.error('[productService] Admin client could not be initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
    // Fall back to standard client if admin is unavailable
    return await updateHomepageProductsWithClient(supabase, sectionKey, productIds);
  }

  return await updateHomepageProductsWithClient(adminClient, sectionKey, productIds);
}

/**
 * Internal helper to handle the actual update logic with any client
 */
async function updateHomepageProductsWithClient(client: any, sectionKey: string, productIds: string[]): Promise<boolean> {
  // 1. Delete existing assignments for this section
  const { error: deleteError } = await client
    .from('homepage_products')
    .delete()
    .eq('section_key', sectionKey);

  if (deleteError) {
    console.error(`[productService] Error clearing section ${sectionKey}:`, deleteError);
    return false;
  }

  if (productIds.length === 0) return true;

  // 2. Insert new assignments
  const newAssignments = productIds.map((pid, index) => ({
    section_key: sectionKey,
    product_id: pid,
    display_order: index
  }));

  const { error: insertError } = await client
    .from('homepage_products')
    .insert(newAssignments);

  if (insertError) {
    console.error(`[productService] Error updating section ${sectionKey}:`, insertError);
    return false;
  }

  return true;
}

/**
 * Fetch related products combining same-category and fallback-category products
 * up to a specified limit.
 */
export const fetchRelatedProducts = cache(async function(
  baseProductId: string,
  categoryId: string | null | undefined,
  limit: number = 10
): Promise<Product[]> {
  const resultProducts: Product[] = [];

  // 1. Fetch from the specific category first
  if (categoryId) {
    const { data: catData, error: catError } = await supabase
      .from('products')
      .select(`
        *,
        categories (*),
        brands (*),
        sellers (*),
        product_sizes (*),
        product_flavours (*),
        product_info (*),
        product_variants (*)
      `)
      .eq('is_published', true)
      .eq('category_id', categoryId)
      .neq('id', baseProductId)
      .limit(limit);

    if (!catError && catData) {
      resultProducts.push(...(catData as any[]));
    }
  }

  // 2. If we haven't reached the limit, fetch fallback products from other categories
  const remaining = limit - resultProducts.length;
  if (remaining > 0) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (*),
        brands (*),
        sellers (*),
        product_sizes (*),
        product_flavours (*),
        product_info (*),
        product_variants (*)
      `)
      .eq('is_published', true)
      .neq('id', baseProductId);

    if (categoryId) {
      query = query.neq('category_id', categoryId);
    }
    
    // Order by created_at descending just as a naive placeholder for "popular/new"
    query = query.order('created_at', { ascending: false }).limit(remaining);

    const { data: fallbackData, error: fallbackError } = await query;
    if (!fallbackError && fallbackData) {
      resultProducts.push(...(fallbackData as any[]));
    }
  }

  return resultProducts.map((p) => ({
    ...p,
    categories: Array.isArray(p.categories) ? p.categories[0] : (p.categories || null),
    brands: Array.isArray(p.brands) ? p.brands[0] : (p.brands || null),
    sellers: Array.isArray(p.sellers) ? p.sellers[0] : (p.sellers || null),
  })) as Product[];
});

/**
 * Fetch featured testimonials for the home page
 */
export const fetchHomeTestimonials = cache(async function(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_featured_home', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching home testimonials:', error);
    return [];
  }

  return (data || []) as Review[];
});

/**
 * Fetch all active coupons for storefront
 */
export async function fetchActiveCoupons(): Promise<Coupon[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('coupons')
    .select('*, products(id, title)')
    .eq('is_active', true)
    .or(`expires_at.gt.${now},expires_at.is.null`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active coupons:', error);
    return [];
  }
  return data as any[];
}


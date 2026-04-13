import { supabase } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}

export interface ProductSize {
  id: string;
  size_label: string;
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

export interface Review {
  id: string;
  product_id: string;
  author: string;
  role: string | null;
  text: string;
  rating: number;
  image: string | null;
  is_verified: boolean;
  created_at: string;
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
    categories?: Category;  // Due to PostgREST relationship mapping
    brands?: Brand;         // Due to PostgREST relationship mapping
    sellers?: Seller;       // Due to PostgREST relationship mapping
    product_sizes?: ProductSize[];
    product_flavours?: ProductFlavour[];
    product_info?: ProductInfo[] | ProductInfo; 
    product_variants?: ProductVariant[];
}


/**
 * Update product attributes (Visibility, stock_status, is_draft, etc.)
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  console.log(`[productService] Updating product ${id}:`, updates);
  
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
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
}

/**
 * Fetch all brands
 */
export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  return data as Brand[];
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
export async function fetchProducts(options?: { brandSlug?: string; categorySlug?: string }): Promise<Product[]> {
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
    .eq('is_published', true);

  if (options?.brandSlug) {
    query = query.eq('brands.slug', options.brandSlug);
  }
  
  if (options?.categorySlug) {
    query = query.eq('categories.slug', options.categorySlug);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data as Product[];
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
      *,
      categories (*),
      brands (*),
      sellers (*),
      product_sizes (*),
      product_flavours (*),
      product_info (*),
      product_variants (*)
    `, { count: 'exact' });

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
    products: data as Product[], 
    totalCount: count || 0 
  };
}

/**
 * Fetch a single product tightly coupled with variants
 */
export async function fetchProductBySlug(slug: string, options?: { requirePublished?: boolean }): Promise<Product | null> {
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
      product_variants (*)
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
  
  return data as Product;
}

/**
 * Fetch reviews for a specific product
 */
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(`Error fetching reviews for ${productId}:`, error);
    return [];
  }
  return data as Review[];
}

/**
 * Fetch QA for a specific product
 */
export async function fetchProductQA(productId: string): Promise<QAPair[]> {
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
}

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

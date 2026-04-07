import { supabase } from '@/lib/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
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
    stock_status?: 'in_stock' | 'pre_order';
    categories?: Category;  // Due to PostgREST relationship mapping
    brands?: Brand;         // Due to PostgREST relationship mapping
    sellers?: Seller;       // Due to PostgREST relationship mapping
    product_sizes?: ProductSize[];
    product_flavours?: ProductFlavour[];
    product_info?: ProductInfo[] | ProductInfo; // Depending on how Supabase maps 1:1 vs 1:M relationships initially
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
      product_info (*)
    `);

  if (options?.brandSlug) {
    // In Supabase we query relations by dot notation: brands!inner(slug)
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
 * Fetch a single product tightly coupled with variants
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (*),
      brands (*),
      sellers (*),
      product_sizes (*),
      product_flavours (*),
      product_info (*)
    `)
    .eq('slug', slug)
    .single();
    
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

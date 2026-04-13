'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { ProductVariant } from '@/services/productService';

/**
 * Server action to update a product's basic attributes
 */
export async function updateProductAction(id: string, updates: any) {
  const supabase = await createClient();
  
  // 1. Verify Admin Role (Security Layer)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    // 2. Filter out non-DB fields
    const dbUpdates = { ...updates };
    const fieldsToStrip = [
      'categories', 'brands', 'sellers', 'product_sizes', 
      'product_flavours', 'product_info', 'product_variants', 'id',
      'hasManuallyEditedSlug', 'has_variants', 'temp_sizes', 'temp_flavours'
    ];
    fieldsToStrip.forEach(field => delete dbUpdates[field]);

    // 3. Update Database (Priority: adminClient, Fallback: sessionClient)
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    const { data, error } = await finalClient
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Product not found or update failed.');

    // 3a. Sync stock_count to default variant if provided
    if (updates.stock_count !== undefined && !updates.has_variants) {
      await finalClient
        .from('product_variants')
        .update({ stock_count: updates.stock_count })
        .eq('product_id', id)
        .is('size_id', null)
        .is('flavour_id', null);
    }

    // 4. Revalidate cache
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    
    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error('Action Error: updateProductAction:', error);
    return { success: false, message: error.message || 'Failed to update product.' };
  }
}

/**
 * Server action to update product variant prices (Upsert)
 */
export async function updateProductVariantPricesAction(productId: string, variants: any[]) {
  const supabase = await createClient();
  
  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    // 2. Sanitize variants
    const variantsToUpsert = variants.map(v => ({
      product_id: productId,
      size_id: v.size_id,
      flavour_id: v.flavour_id,
      original_price: v.original_price,
      discounted_price: v.discounted_price,
      stock_count: v.stock_count ?? 0,
      is_available: v.is_available ?? true
    }));

    // 3. Upsert into database (Priority: adminClient, Fallback: sessionClient)
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    const { error } = await finalClient
      .from('product_variants')
      .upsert(variantsToUpsert, { onConflict: 'product_id,size_id,flavour_id' });

    if (error) throw error;

    // 4. Revalidate cache
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: updateProductVariantPricesAction:', error);
    return { success: false, message: error.message || 'Failed to update variant prices.' };
  }
}

/**
 * Server action to create a new product from scratch
 */
export async function createProductAction(productData: any) {
  const supabase = await createClient();
  
  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // 2. Prepare product fields
    const { 
      product_variants, 
      product_info, 
      categories, 
      brands, 
      sellers,
      qa,
      reviews,
      tags,
      slug: providedSlug,
      name,
      hasManuallyEditedSlug,
      has_variants,
      temp_sizes,
      temp_flavours,
      stock_count: providedStock,
      ...mainFields 
    } = productData;

    // 2a. Generate/Harden Slug
    const baseSlug = (providedSlug || name || 'product')
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    let finalSlug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const { data: existing } = await finalClient
        .from('products')
        .select('id')
        .eq('slug', finalSlug)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // 2b. Auto-calculate discount percentage if not provided
    const oPrice = Number(mainFields.original_price) || 0;
    const dPrice = Number(mainFields.discounted_price) || 0;
    const calculatedDiscount = (oPrice > 0 && oPrice > dPrice) 
        ? Math.round(((oPrice - dPrice) / oPrice) * 100).toString() 
        : '0';

    // 3. Insert Product (Cleaned main fields)
    const { data: newProduct, error: productError } = await finalClient
      .from('products')
      .insert([{
        ...mainFields,
        discount_percentage: calculatedDiscount,
        name,
        slug: finalSlug,
        stock_count: providedStock || 0
      }])
      .select()
      .single();

    if (productError) throw productError;

    const productId = newProduct.id;

    // 4. Resolve and Insert Variants
    // If no variants provided, create a default one from top-level prices
    const variantsToProcess = (product_variants && product_variants.length > 0) 
      ? product_variants 
      : [{
          size_label: null,
          flavour_name: null,
          original_price: mainFields.original_price,
          discounted_price: mainFields.discounted_price,
          stock_count: providedStock || 0,
          is_available: true
        }];

    if (variantsToProcess.length > 0) {
      // Extract unique flavours and sizes to upsert
      const uniqueFlavours = Array.from(new Set(variantsToProcess.map((v: any) => v.flavour_name))).filter(Boolean) as string[];
      const uniqueSizes = Array.from(new Set(variantsToProcess.map((v: any) => v.size_label))).filter(Boolean) as string[];

      // Insert Flavours ensuring product_id and non-null image_url
      const flavourMap: Record<string, string> = {};
      if (uniqueFlavours.length > 0) {
        const flavourData = uniqueFlavours.map(name => {
          const firstVariantWithImage = variantsToProcess.find((v: any) => v.flavour_name === name && v.image_url);
          return {
            product_id: productId,
            flavour_name: name,
            image_url: firstVariantWithImage?.image_url || '',
            is_available: true
          };
        });
        const { data: insertedFlavours, error: fError } = await finalClient
          .from('product_flavours')
          .insert(flavourData)
          .select();
        if (fError) throw new Error(`Flavor Error: ${fError.message}`);
        insertedFlavours?.forEach(f => { flavourMap[f.flavour_name] = f.id; });
      }

      // Insert Sizes ensuring product_id
      const sizeMap: Record<string, string> = {};
      if (uniqueSizes.length > 0) {
        const sizeData = uniqueSizes.map(label => ({
          product_id: productId,
          size_label: label,
          is_available: true
        }));
        const { data: insertedSizes, error: sError } = await finalClient
          .from('product_sizes')
          .insert(sizeData)
          .select();
        if (sError) throw new Error(`Size Error: ${sError.message}`);
        insertedSizes?.forEach(s => { sizeMap[s.size_label] = s.id; });
      }


      // Prepare Variants with IDs
      const variantsToInsert = variantsToProcess.map((v: any) => ({
        product_id: productId,
        size_id: v.size_label ? sizeMap[v.size_label] : null,
        flavour_id: v.flavour_name ? flavourMap[v.flavour_name] : null,
        original_price: v.original_price,
        discounted_price: v.discounted_price,
        stock_count: v.stock_count || 0,
        is_available: v.is_available ?? true
      }));

      const { error: variantError } = await finalClient
        .from('product_variants')
        .insert(variantsToInsert);
      
      if (variantError) throw new Error(`Variant Error: ${variantError.message}`);
    }

    // 5. Insert Product Info if any
    if (product_info) {
      const infoToInsert = {
        ...product_info,
        product_id: productId
      };
      const { error: infoError } = await finalClient
        .from('product_info')
        .insert([infoToInsert]);
      if (infoError) console.error('Error inserting product info:', infoError);
    }

    // 6. Insert QA if any
    if (qa && qa.length > 0) {
      const qaToInsert = qa.map((q: any) => ({
        product_id: productId,
        question: q.question,
        answer: q.answer,
        author: q.author || 'Admin'
      }));
      const { error: qaError } = await finalClient
        .from('product_qa')
        .insert(qaToInsert);
      if (qaError) console.error('Error inserting QA:', qaError);
    }

    // 7. Insert Reviews if any
    if (reviews && reviews.length > 0) {
      const reviewsToInsert = reviews.map((r: any) => ({
        product_id: productId,
        author: r.author,
        role: r.role || 'Verified Buyer',
        text: r.text,
        rating: r.rating || 5,
        is_verified: true
      }));
      const { error: reviewError } = await finalClient
        .from('reviews')
        .insert(reviewsToInsert);
      if (reviewError) console.error('Error inserting reviews:', reviewError);
    }

    // 8. Handle Tags
    if (tags && tags.length > 0) {
      const { error: tagError } = await finalClient
        .from('products')
        .update({ tags })
        .eq('id', productId);
      if (tagError) console.error('Error updating tags:', tagError);
    }

    // 9. Revalidate cache
    revalidatePath('/admin/products');

    return { success: true, data: newProduct };
  } catch (error: any) {
    console.error('Action Error: createProductAction:', error);
    return { success: false, message: error.message || 'Failed to create product.' };
  }
}

/**
 * Server action to delete a product securely
 */
export async function deleteProductAction(id: string) {
  const supabase = await createClient();

  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    const { error } = await finalClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteProductAction:', error);
    return { success: false, message: error.message || 'Failed to delete product.' };
  }
}

/**
 * Server action to duplicate a product
 */
export async function duplicateProductAction(id: string) {
  const supabase = await createClient();

  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { success: false, message: 'Forbidden. Admin access required.' };
  }

  try {
    const adminClient = getSupabaseAdmin();
    const finalClient = adminClient || supabase;

    // 2. Fetch original product with all relations
    const { data: original, error: fetchError } = await finalClient
      .from('products')
      .select(`
        *,
        product_sizes (*),
        product_flavours (*),
        product_info (*),
        product_variants (*),
        product_qa (*),
        reviews (*)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !original) throw new Error('Could not find original product to duplicate.');

    // 3. Prepare data for duplication
    const duplicateData = {
      ...original,
      name: `Copy of ${original.name}`,
      title: `${original.title} (Copy)`,
      slug: `copy-of-${original.slug}-${Date.now().toString().slice(-4)}`,
      product_variants: original.product_variants?.map((v: any) => ({
        size_label: original.product_sizes?.find((s: any) => s.id === v.size_id)?.size_label,
        flavour_name: original.product_flavours?.find((f: any) => f.id === v.flavour_id)?.flavour_name,
        original_price: v.original_price,
        discounted_price: v.discounted_price,
        stock_count: v.stock_count,
        is_available: v.is_available,
        image_url: original.product_flavours?.find((f: any) => f.id === v.flavour_id)?.image_url
      })),
      product_info: original.product_info?.[0] || original.product_info || {},
      qa: original.product_qa?.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        author: q.author
      })),
      reviews: original.reviews?.map((r: any) => ({
        author: r.author,
        role: r.role,
        text: r.text,
        rating: r.rating
      }))
    };

    // Strip internal IDs from duplicateData to prevent collision
    delete (duplicateData as any).id;
    delete (duplicateData as any).created_at;
    delete (duplicateData as any).updated_at;
    delete (duplicateData as any).product_sizes;
    delete (duplicateData as any).product_flavours;
    delete (duplicateData as any).product_qa;
    // ... createProductAction will handle the rest

    // 4. Call createProductAction to handle the heavy lifting
    return await createProductAction(duplicateData);

  } catch (error: any) {
    console.error('Action Error: duplicateProductAction:', error);
    return { success: false, message: error.message || 'Failed to duplicate product.' };
  }
}

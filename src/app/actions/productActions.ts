'use server';

import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import { revalidateProduct } from '@/lib/cacheUtils';
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
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/');
    revalidateProduct(id, data[0]?.slug);
    
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

    // Update size and flavour names if provided
    for (const v of variants) {
      if (v.size_id && v.size?.size_label) {
        const { error: sError } = await finalClient.from('product_sizes').update({ size_label: v.size.size_label }).eq('id', v.size_id);
        if (sError) throw new Error(`Size update error: ${sError.message}`);
      }
      if (v.flavour_id && v.flavour?.flavour_name) {
        const { error: fError } = await finalClient.from('product_flavours').update({ flavour_name: v.flavour.flavour_name }).eq('id', v.flavour_id);
        if (fError) throw new Error(`Flavour update error: ${fError.message}`);
      }
    }

    const { error } = await finalClient
      .from('product_variants')
      .upsert(variantsToUpsert, { onConflict: 'product_id,size_id,flavour_id' });

    if (error) throw error;

    const { data: pData } = await finalClient.from('products').select('slug').eq('id', productId).single();

    // 4. Revalidate cache
    revalidatePath('/admin/products');
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/');
    revalidateProduct(productId, pData?.slug);
    
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
      reviews,
      tags,
      slug: providedSlug,
      name,
      hasManuallyEditedSlug,
      has_variants,
      temp_sizes,
      temp_flavours,
      product_flavours,
      product_sizes,
      stock_count: providedStock,
      linked_banner_ids,
      product_banners, // Exclude this too
      product_review_mapping,
      products_data,
      products: productsJoin,
      product_qa,
      qa,
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

      // Insert Sizes ensuring product_id and image_url
      const sizeMap: Record<string, string> = {};
      if (uniqueSizes.length > 0) {
        const sizeData = uniqueSizes.map(label => {
          const firstVariantWithImage = variantsToProcess.find((v: any) => (v.size_label === label || v.size?.size_label === label) && (v.image_url || v.size?.image_url));
          return {
            product_id: productId,
            size_label: label,
            image_url: firstVariantWithImage?.image_url || firstVariantWithImage?.size?.image_url || null,
            is_available: true
          };
        });
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
    const validQa = (qa || []).filter((q: any) => q.question?.trim());
    if (validQa.length > 0) {
      const qaToInsert = validQa.map((q: any) => ({
        product_id: productId,
        question: q.question.trim(),
        answer: q.answer?.trim() || null,
        author: q.author || 'Admin'
      }));
      const { error: qaError } = await finalClient
        .from('product_qa')
        .insert(qaToInsert);
      if (qaError) throw new Error(`QA Error: ${qaError.message}`);
    }

    // 7. Handle Reviews (Many-to-Many logic)
    if (reviews && reviews.length > 0) {
      const newReviews = reviews.filter((r: any) => !r.id && !r.linked_from_id);
      const existingReviews = reviews.filter((r: any) => r.id || r.linked_from_id);

      // 7a. Insert brand new reviews
      let newReviewIds: string[] = [];
      if (newReviews.length > 0) {
        const reviewsToInsert = newReviews.map((r: any) => ({
          author: r.author,
          author_avatar: r.author_avatar,
          role: r.role || 'Verified Buyer',
          text: r.text,
          rating: r.rating || 5,
          image: r.image,
          is_verified: true
        }));
        const { data: inserted, error: rError } = await finalClient.from('reviews').insert(reviewsToInsert).select('id');
        if (rError) console.error('Error creating new reviews:', rError);
        if (inserted) newReviewIds = inserted.map(r => r.id);
      }

      // 7b. Map both new and existing reviews to this product
      const allReviewIdsToLink = Array.from(new Set([
        ...newReviewIds,
        ...existingReviews.map((r: any) => r.id || r.linked_from_id)
      ]));

      if (allReviewIdsToLink.length > 0) {
        const mappingRows = allReviewIdsToLink.map(rid => ({
          product_id: productId,
          review_id: rid
        }));
        const { error: mError } = await finalClient.from('product_review_mapping').insert(mappingRows);
        if (mError) console.error('Error linking reviews to product:', mError);
      }
    }

    // 8. Handle Tags
    if (tags && tags.length > 0) {
      const { error: tagError } = await finalClient
        .from('products')
        .update({ tags })
        .eq('id', productId);
      if (tagError) console.error('Error updating tags:', tagError);
    }

    // 8a. Handle Linked Banners
    if (linked_banner_ids && linked_banner_ids.length > 0) {
      const bannerLinks = linked_banner_ids.map((bannerId: string) => ({
        product_id: productId,
        banner_id: bannerId
      }));
      const { error: bannerError } = await finalClient
        .from('product_banners')
        .insert(bannerLinks);
      if (bannerError) console.error('Error linking banners:', bannerError);
    }

    // 9. Revalidate cache
    revalidatePath('/admin/products');
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/');
    revalidateProduct(productId, newProduct.slug);

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

    // 2. Fetch all media URLs before deletion for cleanup
    const { data: product } = await finalClient
      .from('products')
      .select(`
        *,
        product_info (ingredients_image),
        product_variants (*),
        product_flavours (image_url),
        product_sizes (image_url)
      `)
      .eq('id', id)
      .single();

    if (product) {
      const { extractPublicId, deleteFromCloudinary } = await import('@/services/cloudinary');
      
      // Collect all potential Cloudinary URLs
      const urls: { url: string; type: 'image' | 'video' }[] = [];
      
      if (product.image_url) urls.push({ url: product.image_url, type: 'image' });
      if (product.banner_image1) urls.push({ url: product.banner_image1, type: 'image' });
      if (product.banner_image2) urls.push({ url: product.banner_image2, type: 'image' });
      if (product.banner_image3) urls.push({ url: product.banner_image3, type: 'image' });
      if (product.banner_image4) urls.push({ url: product.banner_image4, type: 'image' });
      
      // Highlights (JSON array of { type: 'video' | 'image', src: string })
      if (Array.isArray(product.highlights)) {
        product.highlights.forEach((h: any) => {
          if (h.src) urls.push({ url: h.src, type: h.type === 'video' ? 'video' : 'image' });
        });
      }
      // Relational media
      const processRelational = (data: any, field: string, type: 'image' | 'video' = 'image') => {
        if (!data) return;
        const items = Array.isArray(data) ? data : [data];
        items.forEach(item => {
          if (item && item[field]) urls.push({ url: item[field], type });
        });
      };

      processRelational(product.product_info, 'ingredients_image');
      processRelational(product.product_flavours, 'image_url');
      processRelational(product.product_sizes, 'image_url');
      const publicIds = urls
        .map(u => ({ id: extractPublicId(u.url), type: u.type }))
        .filter(u => u.id);

      await Promise.allSettled(
        publicIds.map(p => deleteFromCloudinary(p.id!, p.type))
      );
    }

    // 3. Delete from Database
    const { error } = await finalClient
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/products');
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/');
    revalidateProduct(id, product?.slug);
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
        is_available: v.is_available
      })),
      product_info: original.product_info?.[0] || original.product_info || {},
      qa: original.product_qa?.map((q: any) => ({
        question: q.question,
        answer: q.answer,
        author: q.author
      })),
      reviews: original.reviews?.map((r: any) => ({
        author: r.author,
        author_avatar: r.author_avatar,
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
/**
 * Server action to update a product and all its relations (deep update)
 */
export async function updateProductDeepAction(id: string, productData: any) {
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
      product_flavours,
      product_sizes,
      stock_count: providedStock,
      id: productIdInData,
      created_at,
      roles,
      linked_banner_ids,
      product_banners, // Exclude relational field
      product_review_mapping, // Exclude join table field
      products_data, // Exclude join data
      products: productsJoin, // Exclude join data
      product_qa,
      ...mainFields 
    } = productData;

    // 2a. Auto-calculate discount percentage
    const oPrice = Number(mainFields.original_price) || 0;
    const dPrice = Number(mainFields.discounted_price) || 0;
    const calculatedDiscount = (oPrice > 0 && oPrice > dPrice) 
        ? Math.round(((oPrice - dPrice) / oPrice) * 100).toString() 
        : '0';

    // 3. Update Main Product
    const { data: updatedProduct, error: productError } = await finalClient
      .from('products')
      .update({
        ...mainFields,
        discount_percentage: calculatedDiscount,
        name,
        slug: providedSlug,
        stock_count: providedStock || 0,
        tags: tags || []
      })
      .eq('id', id)
      .select()
      .single();

    if (productError) throw productError;

    const productId = id;

    // 4. Sequential Deletion of existing relations to maintain clean state
    // We moved info, qa, review deletions closer to their inserts to prevent data loss on error.
    
    // 5. Resolve and Insert/Update Variants
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
      // Upsert Sizes
      const sizeMap: Record<string, string> = {};
      const uniqueSizes = Array.from(new Set(variantsToProcess.map((v: any) => v.size_label || v.size?.size_label))).filter(Boolean) as string[];
      if (uniqueSizes.length > 0) {
        for (const label of uniqueSizes) {
           const variantWithSize = variantsToProcess.find((v:any) => (v.size_label === label || v.size?.size_label === label));
           const variantWithNewImage = variantsToProcess.find((v:any) => (v.size_label === label || v.size?.size_label === label) && v.image_url && v.image_url.trim() !== '');
           const sId = variantWithSize?.size_id;
           const sImage = variantWithNewImage ? variantWithNewImage.image_url : (variantWithSize?.size?.image_url || null);
           
           if (sId) {
              const { error } = await finalClient.from('product_sizes').update({ size_label: label, image_url: sImage }).eq('id', sId);
              if (error) throw new Error(`Size update error: ${error.message}`);
              sizeMap[label] = sId;
           } else {
              const { data, error } = await finalClient.from('product_sizes').insert({ product_id: productId, size_label: label, image_url: sImage, is_available: true }).select('id').single();
              if (error) throw new Error(`Size insert error: ${error.message}`);
              if (data) sizeMap[label] = data.id;
           }
        }
      }

      // Upsert Flavours
      const flavourMap: Record<string, string> = {};
      const uniqueFlavours = Array.from(new Set(variantsToProcess.map((v: any) => v.flavour_name || v.flavour?.flavour_name))).filter(Boolean) as string[];
      if (uniqueFlavours.length > 0) {
        for (const name of uniqueFlavours) {
           const variantWithFlavour = variantsToProcess.find((v:any) => (v.flavour_name === name || v.flavour?.flavour_name === name));
           const variantWithNewImage = variantsToProcess.find((v:any) => (v.flavour_name === name || v.flavour?.flavour_name === name) && v.image_url && v.image_url.trim() !== '');
           const fId = variantWithFlavour?.flavour_id;
           const fImage = variantWithNewImage ? variantWithNewImage.image_url : (variantWithFlavour?.flavour?.image_url || null);
           
           if (fId) {
              const { error } = await finalClient.from('product_flavours').update({ flavour_name: name, image_url: fImage }).eq('id', fId);
              if (error) throw new Error(`Flavour update error: ${error.message}`);
              flavourMap[name] = fId;
           } else {
              const { data, error } = await finalClient.from('product_flavours').insert({ product_id: productId, flavour_name: name, image_url: fImage, is_available: true }).select('id').single();
              if (error) throw new Error(`Flavour insert error: ${error.message}`);
              if (data) flavourMap[name] = data.id;
           }
        }
      }

      // Upsert Variants
      const activeVariantIds: string[] = [];
      for (const v of variantsToProcess) {
          const sLabel = v.size_label || v.size?.size_label;
          const fName = v.flavour_name || v.flavour?.flavour_name;
          const sId = sLabel ? sizeMap[sLabel] : null;
          const fId = fName ? flavourMap[fName] : null;
          
          if (v.id) {
             const { error } = await finalClient.from('product_variants').update({
                size_id: sId,
                flavour_id: fId,
                original_price: v.original_price,
                discounted_price: v.discounted_price,
                stock_count: v.stock_count || 0,
                is_available: v.is_available ?? true
             }).eq('id', v.id);
             if (error) throw new Error(`Variant update error: ${error.message}`);
             activeVariantIds.push(v.id);
          } else {
             const { data, error } = await finalClient.from('product_variants').insert({
                product_id: productId,
                size_id: sId,
                flavour_id: fId,
                original_price: v.original_price,
                discounted_price: v.discounted_price,
                stock_count: v.stock_count || 0,
                is_available: v.is_available ?? true
             }).select('id').single();
             if (error) throw new Error(`Variant insert error: ${error.message}`);
             if (data) activeVariantIds.push(data.id);
          }
      }

      // Cleanup removed Variants, Flavours, Sizes
      if (activeVariantIds.length > 0) {
         const { error } = await finalClient.from('product_variants').delete().eq('product_id', productId).not('id', 'in', `(${activeVariantIds.join(',')})`);
         if (error) throw new Error(`Variant cleanup error: ${error.message}`);
      } else {
         const { error } = await finalClient.from('product_variants').delete().eq('product_id', productId);
         if (error) throw new Error(`Variant cleanup error: ${error.message}`);
      }

      const currentSizeIds = Object.values(sizeMap);
      if (currentSizeIds.length > 0) {
         const { error } = await finalClient.from('product_sizes').delete().eq('product_id', productId).not('id', 'in', `(${currentSizeIds.join(',')})`);
         if (error) throw new Error(`Size cleanup error: ${error.message}`);
      } else {
         const { error } = await finalClient.from('product_sizes').delete().eq('product_id', productId);
         if (error) throw new Error(`Size cleanup error: ${error.message}`);
      }

      const currentFlavourIds = Object.values(flavourMap);
      if (currentFlavourIds.length > 0) {
         const { error } = await finalClient.from('product_flavours').delete().eq('product_id', productId).not('id', 'in', `(${currentFlavourIds.join(',')})`);
         if (error) throw new Error(`Flavour cleanup error: ${error.message}`);
      } else {
         const { error } = await finalClient.from('product_flavours').delete().eq('product_id', productId);
         if (error) throw new Error(`Flavour cleanup error: ${error.message}`);
      }
    }

    // 6. Insert Product Info
    if (product_info) {
      await finalClient.from('product_info').delete().eq('product_id', productId);
      const infoData = Array.isArray(product_info) ? product_info[0] : product_info;
      const { id: _, product_id: __, ...cleanInfo } = infoData;
      const { error: infoError } = await finalClient
        .from('product_info')
        .insert([{ ...cleanInfo, product_id: productId }]);
      if (infoError) throw new Error(`Info insert error: ${infoError.message}`);
    }

    // 7. Insert QA
    const validQa = (qa || []).filter((q: any) => q.question?.trim());
    if (validQa.length > 0) {
      await finalClient.from('product_qa').delete().eq('product_id', productId);
      const qaToInsert = validQa.map((q: any) => ({
        product_id: productId,
        question: q.question.trim(),
        answer: q.answer?.trim() || null,
        author: q.author || 'Admin'
      }));
      const { error: qaError } = await finalClient.from('product_qa').insert(qaToInsert);
      if (qaError) throw new Error(`QA insert error: ${qaError.message}`);
    } else {
      await finalClient.from('product_qa').delete().eq('product_id', productId);
    }

    // 8. Handle Reviews (Many-to-Many logic)
    if (reviews && reviews.length > 0) {
      const newReviews = reviews.filter((r: any) => !r.id && !r.linked_from_id);
      const existingReviews = reviews.filter((r: any) => r.id || r.linked_from_id);

      // 8a. Insert brand new reviews
      let newReviewIds: string[] = [];
      if (newReviews.length > 0) {
        const reviewsToInsert = newReviews.map((r: any) => ({
          author: r.author,
          author_avatar: r.author_avatar,
          role: r.role || 'Verified Buyer',
          text: r.text,
          rating: r.rating || 5,
          image: r.image,
          is_verified: true
        }));
        const { data: inserted, error: rError } = await finalClient.from('reviews').insert(reviewsToInsert).select('id');
        if (rError) throw new Error(`Review insert error: ${rError.message}`);
        if (inserted) newReviewIds = inserted.map(r => r.id);
      }

      // 8b. Map both new and existing reviews to this product
      const allReviewIdsToLink = Array.from(new Set([
        ...newReviewIds,
        ...existingReviews.map((r: any) => r.id || r.linked_from_id)
      ]));

      if (allReviewIdsToLink.length > 0) {
        await finalClient.from('product_review_mapping').delete().eq('product_id', productId);
        const mappingRows = allReviewIdsToLink.map(rid => ({
          product_id: productId,
          review_id: rid
        }));
        const { error: mError } = await finalClient.from('product_review_mapping').insert(mappingRows);
        if (mError) throw new Error(`Review mapping error: ${mError.message}`);
      }
    } else {
        await finalClient.from('product_review_mapping').delete().eq('product_id', productId);
    }

    // 8a. Sync Linked Banners
    await finalClient.from('product_banners').delete().eq('product_id', productId);
    if (linked_banner_ids && linked_banner_ids.length > 0) {
      const bannerLinks = linked_banner_ids.map((bannerId: string) => ({
        product_id: productId,
        banner_id: bannerId
      }));
      await finalClient.from('product_banners').insert(bannerLinks);
    }

    // 9. Revalidate cache
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/edit/${id}`);
    revalidatePath(`/admin/products/preview/${updatedProduct.slug}`);
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/');
    revalidateProduct(id, updatedProduct.slug);

    return { success: true, data: updatedProduct };
  } catch (error: any) {
    console.error('Action Error: updateProductDeepAction:', error);
    return { success: false, message: error.message || 'Failed to update product.' };
  }
}

/**
 * Fetches all products with variants for admin selection.
 */
export async function fetchAllProductsAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Unauthorized' };

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, 
        name, 
        title,
        slug,
        images, 
        original_price, 
        discounted_price,
        brands (name),
        product_variants (
          id, 
          original_price, 
          discounted_price, 
          stock_count,
          size:product_sizes(id, size_label),
          flavour:product_flavours(id, flavour_name)
        )
      `)
      .order('name');

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Action Error: fetchAllProductsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch products.' };
  }
}

/**
 * Server action to fetch paginated products for admin dashboard
 */
export async function fetchProductsPaginatedAction(page: number, pageSize: number, options?: { search?: string }) {
  const supabase = await createClient();
  
  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, products: [], totalCount: 0 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { success: false, products: [], totalCount: 0 };

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('products')
      .select(`
        id, slug, name, title, images,
        original_price, discounted_price, discount_percentage,
        stock_count, stock_status, is_published, is_draft,
        rating, reviews_count, created_at,
        categories (id, name, slug),
        brands (id, name, slug),
        product_sizes (id, size_label),
        product_flavours (id, flavour_name),
        product_variants (id, original_price, discounted_price, stock_count, is_available)
      `, { count: 'estimated' });

    if (options?.search) {
      query = query.or(`name.ilike.%${options.search}%,title.ilike.%${options.search}%,slug.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) throw error;
    
    return { 
      success: true,
      products: (data as any[]).map(p => ({
        ...p,
        categories: Array.isArray(p.categories) ? p.categories[0] || null : p.categories,
        brands: Array.isArray(p.brands) ? p.brands[0] || null : p.brands,
      })), 
      totalCount: count || 0 
    };
  } catch (error: any) {
    console.error('Action Error: fetchProductsPaginatedAction:', error);
    return { success: false, products: [], totalCount: 0, message: error.message || 'Failed to fetch products' };
  }
}

/**
 * Server action to fetch product statistics for dashboard
 */
export async function getProductStatsAction() {
  const supabase = await createClient();
  
  // 1. Verify Admin Role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { success: false, message: 'Forbidden.' };

  try {
    const adminClient = getSupabaseAdmin() || supabase;

    // Run queries in parallel for high performance
    const [totalRes, outRes, inRes, soldRes] = await Promise.all([
      adminClient.from('products').select('*', { count: 'exact', head: true }),
      adminClient.from('products').select('*', { count: 'exact', head: true }).lte('stock_count', 0),
      adminClient.from('products').select('*', { count: 'exact', head: true }).gt('stock_count', 0),
      adminClient.from('order_items').select('quantity, orders!inner(status)').neq('orders.status', 'cancelled')
    ]);

    const totalProducts = totalRes.count || 0;
    const outOfStock = outRes.count || 0;
    const inStock = inRes.count || 0;
    
    if (soldRes.error) console.error('Error fetching sold items:', soldRes.error);
    const totalSold = soldRes.data?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;

    return {
      success: true,
      data: {
        totalProducts: totalProducts || 0,
        outOfStock: outOfStock || 0,
        inStock: inStock || 0,
        totalSold: totalSold
      }
    };
  } catch (error: any) {
    console.error('Action Error: getProductStatsAction:', error);
    return { success: false, message: error.message || 'Failed to fetch product stats' };
  }
}

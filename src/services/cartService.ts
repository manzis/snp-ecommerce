import { supabase } from '@/lib/supabase/client';

export interface CartItemType {
  id: string; // generated client-side: productId-size-flavor
  product_id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  selected_size: string | null;
  selected_flavor: string | null;
  stock_status?: string;
  bundle_id?: string;
  bundle_discount?: number;
  is_sale?: boolean;
  sale_end_date?: string;
}

export const getCartItemId = (item: { 
  product_id: string, 
  selected_size?: string | null, 
  selected_flavor?: string | null, 
  bundle_id?: string
}) => {
  const size = item.selected_size || 'none';
  const flavor = item.selected_flavor || 'none';
  const bundle = item.bundle_id && item.bundle_id !== 'standard' ? `-${item.bundle_id}` : '';
  
  return `${item.product_id}-${size}-${flavor}${bundle}`;
};


export const fetchCart = async (userId: string): Promise<CartItemType[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products (
        id,
        name,
        slug,
        discounted_price,
        original_price,
        stock_status,
        images,
        brands (name),
        product_flavours (id, flavour_name, image_url),
        product_variants (
          size_id,
          flavour_id,
          original_price,
          discounted_price,
          size:product_sizes(size_label),
          flavour:product_flavours(flavour_name)
        ),
        sales_offers_products (
          sales_offers (
            discount_type,
            discount_value,
            ends_at,
            is_active
          )
        )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart:', error);
    return [];
  }

  const itemsMap = new Map<string, CartItemType>();

  (data || []).forEach((row: any) => {
    const product = row.product;
    const selectedFlavor = row.selected_flavor;
    const selectedSize = row.selected_size;
    
    // Resolve Flavour-Specific Image
    const flavourImage = product?.product_flavours?.find(
      (f: any) => f.flavour_name === selectedFlavor
    )?.image_url;

    let livePrice = product?.discounted_price;
    let liveMrp = product?.original_price;

    if (product?.product_variants?.length > 0) {
      const matchingVariant = product.product_variants.find((v: any) => {
        // v.size and v.flavour might be arrays due to Supabase one-to-many returns, or single objects
        const vSizeLabel = Array.isArray(v.size) ? v.size[0]?.size_label : v.size?.size_label;
        const vFlavorName = Array.isArray(v.flavour) ? v.flavour[0]?.flavour_name : v.flavour?.flavour_name;
        
        const normalizedSize = (!selectedSize || selectedSize === 'none') ? null : selectedSize;
        const normalizedFlavor = (!selectedFlavor || selectedFlavor === 'Unflavoured' || selectedFlavor === 'none') ? null : selectedFlavor;
        
        const matchSize = !normalizedSize || vSizeLabel === normalizedSize;
        const matchFlavor = !normalizedFlavor || vFlavorName === normalizedFlavor;
        return matchSize && matchFlavor;
      });

      if (matchingVariant) {
        livePrice = matchingVariant.discounted_price || livePrice;
        liveMrp = matchingVariant.original_price || liveMrp;
      }
    }

    // Apply Active Sale Discount if any
    let parsedPrice = product ? parseInt(String(livePrice || '0').replace(/\D/g, ''), 10) : (row.price || 0);
    const parsedMrp = product ? parseInt(String(liveMrp || '0').replace(/\D/g, ''), 10) : (row.original_price || 0);

    let isSale = false;
    let saleEndDate: string | undefined = undefined;

    if (product?.sales_offers_products?.length > 0) {
      const activeSale = product.sales_offers_products
        .map((sop: any) => sop.sales_offers)
        .find((sale: any) => sale && sale.is_active && new Date(sale.ends_at) > new Date());
      
      if (activeSale) {
        isSale = true;
        saleEndDate = activeSale.ends_at;
        if (activeSale.discount_type === 'PERCENTAGE') {
          parsedPrice = Math.round(parsedPrice * (1 - activeSale.discount_value / 100));
        } else {
          parsedPrice = Math.max(0, parsedPrice - activeSale.discount_value);
        }
      }
    }

    // Auto-sync mismatch to database to prevent stale state on subsequent requests/checkouts
    if (product && row.id && (parsedPrice !== row.price || parsedMrp !== row.original_price)) {
      supabase.from('cart_items')
        .update({ price: parsedPrice, original_price: parsedMrp })
        .eq('id', row.id)
        .then(({ error: syncError }) => {
          if (syncError) console.error('Error auto-syncing cart item price:', syncError);
        });
    }

    const item: CartItemType = {
      id: getCartItemId(row),
      product_id: row.product_id,
      name: product?.name || 'Product',
      slug: product?.slug || '',
      brand: product?.brands?.name || 'Store Product',
      price: parsedPrice,
      mrp: parsedMrp,
      image: flavourImage || product?.images?.[0] || '',
      quantity: row.quantity,
      selected_size: selectedSize,
      selected_flavor: selectedFlavor,
      stock_status: product?.stock_status || 'in_stock',
      bundle_id: row.bundle_id === 'standard' ? undefined : row.bundle_id,
      bundle_discount: row.bundle_discount || 0,
      is_sale: isSale,
      sale_end_date: saleEndDate
    };

    const existing = itemsMap.get(item.id);
    if (existing) {
      existing.quantity += item.quantity;
      existing.bundle_discount = (existing.bundle_discount || 0) + (item.bundle_discount || 0);
    } else {
      itemsMap.set(item.id, item);
    }
  });

  return Array.from(itemsMap.values());
};



export const addToCart = async (item: CartItemType, userId: string) => {
  const payload = {
    user_id: userId,
    product_id: item.product_id,
    quantity: item.quantity,
    selected_size: item.selected_size,
    selected_flavor: item.selected_flavor,
    bundle_id: item.bundle_id || 'standard',
    bundle_discount: item.bundle_discount || 0,
    price: item.price, 
    original_price: item.mrp,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('cart_items').upsert([payload], {
    onConflict: 'user_id, product_id, selected_size, selected_flavor, bundle_id, bundle_discount'
  });

  
  if (error) console.error('Error adding to cart:', error);
};

export const updateCartItem = async (userId: string, item: CartItemType, quantity: number) => {
  let query = supabase.from('cart_items').update({ quantity, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('product_id', item.product_id);
  
  if (item.selected_size) query = query.eq('selected_size', item.selected_size);
  else query = query.is('selected_size', null);
  
  if (item.selected_flavor) query = query.eq('selected_flavor', item.selected_flavor);
  else query = query.is('selected_flavor', null);

  const bundleId = item.bundle_id || 'standard';
  const bundleDiscount = item.bundle_discount || 0;
  query = query.eq('bundle_id', bundleId).eq('bundle_discount', bundleDiscount);

  const { error } = await query;
  if (error) console.error('Error updating cart item:', error);
};

export const removeCartItem = async (userId: string, item: CartItemType) => {
  let query = supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', item.product_id);
  
  if (item.selected_size) query = query.eq('selected_size', item.selected_size);
  else query = query.is('selected_size', null);
  
  if (item.selected_flavor) query = query.eq('selected_flavor', item.selected_flavor);
  else query = query.is('selected_flavor', null);

  const bundleId = item.bundle_id || 'standard';
  query = query.eq('bundle_id', bundleId);

  const { error } = await query;
  if (error) console.error('Error removing cart item:', error);
};

export const removeBundleItems = async (userId: string, bundleId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('bundle_id', bundleId);
  
  if (error) console.error('Error removing bundle items:', error);
};


export const mergeCart = async (localItems: CartItemType[], userId: string) => {
  if (localItems.length === 0) return;
  const dbItems = await fetchCart(userId);

  // Group localItems by their database unique key to avoid conflicts in a single upsert
  const groupedItems = new Map<string, any>();

  localItems.forEach(local => {
    const key = `${local.product_id}-${local.selected_size}-${local.selected_flavor}-${local.bundle_id || 'standard'}-${local.bundle_discount || 0}`;
    const existing = groupedItems.get(key);
    
    if (existing) {
      existing.quantity += local.quantity;
    } else {
      const dbMatch = dbItems.find(db => 
        db.product_id === local.product_id && 
        db.selected_size === local.selected_size && 
        db.selected_flavor === local.selected_flavor && 
        (db.bundle_id || 'standard') === (local.bundle_id || 'standard') &&
        (db.bundle_discount || 0) === (local.bundle_discount || 0)
      );

      groupedItems.set(key, {
        user_id: userId,
        product_id: local.product_id,
        quantity: dbMatch ? dbMatch.quantity + local.quantity : local.quantity,
        selected_size: local.selected_size,
        selected_flavor: local.selected_flavor,
        bundle_id: local.bundle_id || 'standard',
        bundle_discount: local.bundle_discount || 0,
        price: local.price,
        original_price: local.mrp,
        updated_at: new Date().toISOString()
      });
    }
  });

  const upsertPayload = Array.from(groupedItems.values());

  const { error } = await supabase.from('cart_items').upsert(upsertPayload, {
    onConflict: 'user_id, product_id, selected_size, selected_flavor, bundle_id, bundle_discount'
  });
  
  if (error) console.error('Error merging cart:', error);
};



export const clearCartRemote = async (userId: string) => {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) console.error('Error clearing cart:', error);
};

export const refreshCartItemsPrices = async (localItems: CartItemType[]): Promise<CartItemType[]> => {
  if (localItems.length === 0) return localItems;
  
  const productIds = localItems.map(item => item.product_id);
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      discounted_price,
      original_price,
      stock_status,
      product_variants (
        size_id,
        flavour_id,
        original_price,
        discounted_price,
        size:product_sizes(size_label),
        flavour:product_flavours(flavour_name)
      ),
      product_sizes (
        id,
        size_label
      ),
      product_flavours (
        id,
        flavour_name
      ),
      sales_offers_products (
        sales_offers (
          discount_type,
          discount_value,
          ends_at,
          is_active
        )
      )
    `)
    .in('id', productIds);

  if (error || !data) return localItems;

  return localItems.map(item => {
    const product = data.find(p => p.id === item.product_id);
    if (!product) return item; // If deleted, keep as is

    let livePrice = product.discounted_price;
    let liveMrp = product.original_price;

    if (product.product_variants?.length > 0) {
      const matchingVariant = product.product_variants.find((v: any) => {
        // v.size and v.flavour might be arrays due to Supabase one-to-many returns, or single objects
        const vSizeLabel = Array.isArray(v.size) ? v.size[0]?.size_label : v.size?.size_label;
        const vFlavorName = Array.isArray(v.flavour) ? v.flavour[0]?.flavour_name : v.flavour?.flavour_name;
        
        const normalizedSize = (!item.selected_size || item.selected_size === 'none') ? null : item.selected_size;
        const normalizedFlavor = (!item.selected_flavor || item.selected_flavor === 'Unflavoured' || item.selected_flavor === 'none') ? null : item.selected_flavor;
        
        const matchSize = !normalizedSize || vSizeLabel === normalizedSize;
        const matchFlavor = !normalizedFlavor || vFlavorName === normalizedFlavor;
        return matchSize && matchFlavor;
      });

      if (matchingVariant) {
        livePrice = matchingVariant.discounted_price || livePrice;
        liveMrp = matchingVariant.original_price || liveMrp;
      }
    }

    let parsedPrice = livePrice !== undefined && livePrice !== null 
      ? parseInt(String(livePrice || '0').replace(/\D/g, ''), 10) 
      : item.price;
      
    const parsedMrp = liveMrp !== undefined && liveMrp !== null 
      ? parseInt(String(liveMrp || '0').replace(/\D/g, ''), 10) 
      : item.mrp;

    let isSale = false;
    let saleEndDate: string | undefined = undefined;

    if (product?.sales_offers_products?.length > 0) {
      const activeSale = product.sales_offers_products
        .map((sop: any) => sop.sales_offers)
        .find((sale: any) => sale && sale.is_active && new Date(sale.ends_at) > new Date());
      
      if (activeSale) {
        isSale = true;
        saleEndDate = activeSale.ends_at;
        if (activeSale.discount_type === 'PERCENTAGE') {
          parsedPrice = Math.round(parsedPrice * (1 - activeSale.discount_value / 100));
        } else {
          parsedPrice = Math.max(0, parsedPrice - activeSale.discount_value);
        }
      }
    }

    return {
      ...item,
      price: parsedPrice,
      mrp: parsedMrp,
      stock_status: product.stock_status || item.stock_status,
      is_sale: isSale,
      sale_end_date: saleEndDate
    };
  });
};


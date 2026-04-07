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
}

export const fetchCart = async (userId: string): Promise<CartItemType[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, selected_size, selected_flavor, product_id, products(name, slug, original_price, discounted_price, images, stock_status, brands(name))')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching cart:', error);
    return [];
  }

  return data.map((row: any) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      id: `${row.product_id}-${row.selected_size || 'none'}-${row.selected_flavor || 'none'}`,
      product_id: row.product_id,
      name: product?.name || 'Unknown Product',
      slug: product?.slug || '',
      brand: product?.brands?.name || 'Store Product',
      price: parseInt((product?.discounted_price || '0').replace(/\D/g, ''), 10),
      mrp: parseInt((product?.original_price || '0').replace(/\D/g, ''), 10),
      image: product?.images?.[0] || '/images/protein.jpg',
      quantity: row.quantity,
      selected_size: row.selected_size,
      selected_flavor: row.selected_flavor,
      stock_status: product?.stock_status || 'in_stock'
    };
  });
};

export const addToCart = async (item: CartItemType, userId: string) => {
  const payload = {
    user_id: userId,
    product_id: item.product_id,
    quantity: item.quantity,
    selected_size: item.selected_size,
    selected_flavor: item.selected_flavor,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('cart_items').upsert([payload], {
    onConflict: 'user_id, product_id, selected_size, selected_flavor'
  });
  
  if (error) console.error('Error adding to cart:', error);
};

export const updateCartItem = async (userId: string, item: CartItemType, quantity: number) => {
  let query = supabase.from('cart_items').update({ quantity, updated_at: new Date().toISOString() }).eq('user_id', userId).eq('product_id', item.product_id);
  
  if (item.selected_size) query = query.eq('selected_size', item.selected_size);
  else query = query.is('selected_size', null);
  
  if (item.selected_flavor) query = query.eq('selected_flavor', item.selected_flavor);
  else query = query.is('selected_flavor', null);

  const { error } = await query;
  if (error) console.error('Error updating cart item:', error);
};

export const removeCartItem = async (userId: string, item: CartItemType) => {
  let query = supabase.from('cart_items').delete().eq('user_id', userId).eq('product_id', item.product_id);
  
  if (item.selected_size) query = query.eq('selected_size', item.selected_size);
  else query = query.is('selected_size', null);
  
  if (item.selected_flavor) query = query.eq('selected_flavor', item.selected_flavor);
  else query = query.is('selected_flavor', null);

  const { error } = await query;
  if (error) console.error('Error removing cart item:', error);
};

export const mergeCart = async (localItems: CartItemType[], userId: string) => {
  if (localItems.length === 0) return;
  const dbItems = await fetchCart(userId);

  const upsertPayload = localItems.map(local => {
    const existing = dbItems.find(db => db.id === local.id);
    return {
      user_id: userId,
      product_id: local.product_id,
      quantity: existing ? existing.quantity + local.quantity : local.quantity,
      selected_size: local.selected_size,
      selected_flavor: local.selected_flavor,
      updated_at: new Date().toISOString()
    };
  });

  const { error } = await supabase.from('cart_items').upsert(upsertPayload, {
    onConflict: 'user_id, product_id, selected_size, selected_flavor'
  });
  
  if (error) console.error('Error merging cart:', error);
};

export const clearCartRemote = async (userId: string) => {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) console.error('Error clearing cart:', error);
};


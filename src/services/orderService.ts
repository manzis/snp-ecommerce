import { supabase } from '@/lib/supabase/client';
import type { CartItemType } from './cartService';

export interface OrderData {
  user_id: string;
  total_amount: number;
  mrp_amount: number;
  discount_amount: number;
  shipping_amount: number;
  shipping_address: any;
  contact_details: any;
  payment_method: string;
}

export interface OrderItemData {
  product_id: string;
  quantity: number;
  price: number;
  mrp: number;
  selected_size: string | null;
  selected_flavor: string | null;
}

/**
 * Creates a new order and its associated items in a way that mimics a transaction
 */
export async function createOrder(orderData: OrderData, items: CartItemType[]) {
  // 1. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      ...orderData,
      status: 'pending'
    }])
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  // 2. Create the order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    mrp: item.mrp || item.price,
    selected_size: item.selected_size,
    selected_flavor: item.selected_flavor
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Note: In a real system we'd ideally rollback the order here. 
    // Supabase RPC or Database Functions are better for atomic transactions.
    throw itemsError;
  }

  return order;
}

/**
 * Fetch orders for a user
 */
export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data;
}

/**
 * Fetch a single order with items and product details
 */
export async function fetchOrderDetails(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, images)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order details:', error);
    return null;
  }

  return data;
}

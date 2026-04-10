'use server';

import { createClient } from '@/lib/supabase/server';
import { fetchUserOrders, createOrder, OrderData, mapToOrderProps } from '@/services/orderService';
import { revalidatePath } from 'next/cache';

/**
 * Server action to place an order
 */
export async function placeOrderAction(orderData: OrderData, items: any[]) {
  const supabase = await createClient();
  
  // 1. Verify Authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: 'Unauthorized. Please login to place an order.' };
  }

  // Ensure user_id matches
  if (orderData.user_id !== user.id && process.env.NODE_ENV !== 'test') {
    return { success: false, message: 'User ID mismatch.' };
  }

  try {
    const result = await createOrder(orderData, items);
    
    // Revalidate relevant paths
    revalidatePath('/account/orders');
    
    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error('Action Error: placeOrderAction:', error);
    return { success: false, message: error.message || 'Failed to place order.' };
  }
}

/**
 * Server action to fetch user orders with pagination support
 */
export async function fetchUserOrdersAction(page: number = 1, limit: number = 10) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, images, brands (name))
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { 
      success: true, 
      orders: data.map(mapToOrderProps),
      totalCount: count || 0
    };
  } catch (error: any) {
    console.error('Action Error: fetchUserOrdersAction:', error);
    return { success: false, message: error.message || 'Failed to fetch orders.' };
  }
}

/**
 * Server action to cancel an existing order
 */
export async function cancelOrderAction(orderId: string, reason: string) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, message: 'Unauthorized.' };
  }

  try {
    // Attempt to invoke the atomic status tracking RPC first
    const { error: rpcError } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_new_status: 'cancelled',
      p_message: `Cancelled by User. Reason: ${reason}`
    });

    if (rpcError) {
       // Fallback for missing RPC: direct update (assumes `cancellation_reason` or basic fallback)
       const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

       if (error) {
         if (error.message?.includes('cancellation_reason')) {
            const { error: fallbackError } = await supabase
              .from('orders')
              .update({ status: 'cancelled' })
              .eq('id', orderId)
              .eq('user_id', user.id);
              
            if (fallbackError) throw fallbackError;
         } else {
            throw error;
         }
       }
    }

    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: cancelOrderAction:', error);
    return { success: false, message: error.message || 'Failed to process cancellation.' };
  }
}
/**
 * Server action to fetch all orders for admin dashboard
 */
export async function fetchAllOrdersAdminAction(page: number = 1, limit: number = 20) {
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
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, images, brands (name))
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { 
      success: true, 
      orders: data.map(mapToOrderProps),
      totalCount: count || 0
    };
  } catch (error: any) {
    console.error('Action Error: fetchAllOrdersAdminAction:', error);
    return { success: false, message: error.message || 'Failed to fetch all orders.' };
  }
}

/**
 * Server action to update order status by admin
 */
export async function updateOrderStatusAdminAction(orderId: string, newStatus: string, message: string = 'Order status updated by administrator') {
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
    // Use the atomic status update RPC v2
    const { error } = await supabase.rpc('update_order_status_v2', {
      p_order_id: orderId,
      p_new_status: newStatus.toLowerCase(),
      p_message: message
    });

    if (error) {
      console.error('RPC Error (update_order_status_v2):', error);
      // Fallback for missing RPC: direct update (without history log)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (updateError) throw updateError;
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: updateOrderStatusAdminAction:', error);
    return { success: false, message: error.message || 'Failed to update order status.' };
  }
}

/**
 * Server action to create a demo order for testing
 */
export async function createDemoOrderAction() {
  const supabase = await createClient();
  
  // 1. Verify Admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { success: false, message: 'Unauthorized.' };

  try {
    // 1. Get a random product
    const { data: products } = await supabase.from('products').select('id, discounted_price').limit(1);
    const product = products?.[0];
    if (!product) throw new Error('No products found in database to create order.');

    // 2. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: parseFloat(product.discounted_price || '0'),
        mrp_amount: parseFloat(product.discounted_price || '0'),
        status: 'pending',
        shipping_address: { city: 'Kathmandu', area: 'New Baneshwor', phone: '9800000000' },
        contact_details: { email: user.email, phone: '9800000000' },
        payment_method: 'COD'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 3. Insert order item
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      price: parseFloat(product.discounted_price || '0'),
      mrp: parseFloat(product.discounted_price || '0')
    });

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: createDemoOrderAction:', error);
    return { success: false, message: error.message || 'Failed to create demo order.' };
  }
}

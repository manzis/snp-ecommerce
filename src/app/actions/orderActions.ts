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
  if (orderData.user_id !== user.id) {
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

'use server';

import { createClient } from '@/lib/supabase/server';
import { fetchUserOrders, createOrder, OrderData, mapToOrderProps } from '@/services/orderService';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOutForDeliveryEmail,
  sendOrderCancelledEmail,
  sendDeliveryFailedEmail,
  sendAdminOrderReceivedEmail,
} from '@/services/emailService';

/**
 * PUBLIC server action to track an order by short ID (no auth required)
 * The short ID is the first segment of the UUID (uppercase), e.g. "5A2B3C4D"
 */
export async function trackOrderByIdAction(shortId: string) {
  if (!shortId || shortId.trim().length < 4) {
    return { success: false, message: 'Please enter a valid Order ID.' };
  }

  const adminClient = getSupabaseAdmin();
  const supabase = adminClient ?? (await createClient());

  try {
    // Clean input: strip '#', 'SNP-', whitespace, keep only hex chars, max 8
    const cleaned = shortId.replace(/[^A-Fa-f0-9]/g, '').toLowerCase().slice(0, 8);
    if (cleaned.length < 4) return { success: false, message: 'Please enter at least 4 characters of the Order ID.' };

    // Build UUID range bounds (pad with 0s for lower, fs for upper)
    const lowerPrefix = cleaned.padEnd(8, '0');
    const upperPrefix = cleaned.padEnd(8, 'f');
    const lowerBound = `${lowerPrefix}-0000-0000-0000-000000000000`;
    const upperBound = `${upperPrefix}-ffff-ffff-ffff-ffffffffffff`;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        discount_amount, shipping_amount, discount_on_mrp, coupon_discount,
        coupon_code, cod_fees, tax_amount, payment_status, amount_paid,
        payment_screenshot_url, payment_remarks,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, brands (name))
        )
      `)
      .gte('id', lowerBound)
      .lte('id', upperBound)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { success: false, message: 'No order found with this ID. Please check and try again.' };

    // Resolve address if needed
    if (data?.shipping_address?.addressId && !data.shipping_address.addressDetails) {
      const { data: addressData } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('id', data.shipping_address.addressId)
        .single();
      if (addressData) data.shipping_address.addressDetails = addressData;
    }

    return { success: true, order: mapToOrderProps(data as any) };
  } catch (error: any) {
    console.error('Action Error: trackOrderByIdAction:', error);
    return { success: false, message: error.message || 'Failed to fetch order.' };
  }
}

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

    // Fire-and-forget: send confirmation emails
    sendOrderConfirmationEmail(result.id).catch(err =>
      console.error('[Email] Confirmation email failed:', err)
    );
    
    // Notify admin
    sendAdminOrderReceivedEmail(result.id).catch(err =>
      console.error('[Email] Admin notification failed:', err)
    );
    
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
      `, { count: 'estimated' })
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
            status: 'cancelled'
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

    // Fire-and-forget: send cancellation email
    sendOrderCancelledEmail(orderId, reason).catch(err =>
      console.error('[Email] Cancellation email failed:', err)
    );

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
  
  // 1. Verify Admin Role using the session client
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

  // 2. Use the service-role admin client for the actual data fetch
  // This bypasses RLS on `products` and `brands` tables so the nested join resolves correctly
  const adminClient = getSupabaseAdmin() || supabase;

  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await adminClient
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        discount_amount, shipping_amount, discount_on_mrp, coupon_discount, 
        coupon_code, cod_fees, tax_amount, payment_status, amount_paid,
        payment_screenshot_url, payment_remarks,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, brands (name))
        )
      `, { count: 'estimated' })
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
export async function updateOrderStatusAdminAction(
  orderId: string, 
  newStatus: string, 
  message: string = 'Order status updated by administrator',
  trackingNumber?: string,
  carrierName?: string
) {
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
      const updateData: any = { 
        status: newStatus.toLowerCase(),
        updated_at: new Date().toISOString()
      };
      
      if (trackingNumber) updateData.tracking_number = trackingNumber;
      if (carrierName) updateData.carrier_name = carrierName;

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
        
      if (updateError) throw updateError;
    } else {
      // Even if RPC succeeds, update the attributes separately if provided
      // because the current RPC might only handle status and logs.
      if (trackingNumber || carrierName) {
        const updateData: any = {};
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (carrierName) updateData.carrier_name = carrierName;
        
        await supabase
          .from('orders')
          .update(updateData)
          .eq('id', orderId);
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);

    // Fire-and-forget: send status-specific email
    const normalizedStatus = newStatus.toLowerCase();
    if (normalizedStatus === 'shipped' || normalizedStatus === 'in_transit') {
      sendOrderShippedEmail(orderId, message).catch(err =>
        console.error('[Email] Shipped email failed:', err)
      );
    } else if (normalizedStatus === 'out_for_delivery') {
      sendOutForDeliveryEmail(orderId).catch(err =>
        console.error('[Email] OFD email failed:', err)
      );
    } else if (normalizedStatus === 'failed') {
      sendDeliveryFailedEmail(orderId, message).catch(err =>
        console.error('[Email] Failed delivery email failed:', err)
      );
    } else if (normalizedStatus === 'cancelled') {
      sendOrderCancelledEmail(orderId, message).catch(err =>
        console.error('[Email] Admin cancellation email failed:', err)
      );
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: updateOrderStatusAdminAction:', error);
    return { success: false, message: error.message || 'Failed to update order status.' };
  }
}

/**
 * Server action to update payment status by admin
 */
export async function updatePaymentStatusAdminAction(orderId: string, paymentStatus: string, amountPaid?: number) {
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
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus.toLowerCase(),
        amount_paid: amountPaid !== undefined ? amountPaid : 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) throw updateError;

    // Wait 200ms to allow Supabase triggers or caching to settle
    await new Promise(resolve => setTimeout(resolve, 200));

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: updatePaymentStatusAdminAction:', error);
    return { success: false, message: error.message || 'Failed to update payment status.' };
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
        shipping_address: { 
          first_name: 'John', 
          last_name: 'Doe', 
          city: 'Kathmandu', 
          area: 'New Baneshwor', 
          phone: '9800000000',
          address: 'Test Street 123'
        },
        contact_details: { 
          full_name: 'John Doe',
          email: user.email, 
          phone: '9800000000' 
        },
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

/**
 * Server action to delete an order (Admin only)
 */
export async function deleteOrderAction(orderId: string) {
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
    const adminSupabase = getSupabaseAdmin();
    if (!adminSupabase) {
      return { success: false, message: 'Server configuration error: Missing service role.' };
    }

    const { error } = await adminSupabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: deleteOrderAction:', error);
    return { success: false, message: error.message || 'Failed to delete order.' };
  }
}

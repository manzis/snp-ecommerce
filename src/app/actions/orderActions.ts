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
  sendAdminOrderCancelledEmail,
  sendCustomerPaymentConfirmedEmail,
} from '@/services/emailService';
import { getExpectedDeliveryDetails } from '@/lib/deliveryHelper';
import { fetchExpoExpressUpdate } from '@/services/expoExpressService';
import { fetchKourtierUpdate } from '@/services/kourtierService';

export async function checkAndSyncKourtierStatus(order: any, supabase: any) {
  if (!order || !order.id || !order.tracking_number) return;
  
  const carrier = (order.carrier_name || '').toLowerCase().replace(/\s+/g, '');
  if (!carrier.includes('kourtier')) return;

  const TERMINAL_STATUSES = ['delivered', 'cancelled', 'returned'];
  const dbStatus = (order.status || '').toLowerCase();
  if (TERMINAL_STATUSES.includes(dbStatus)) return;

  const newUpdates = await fetchKourtierUpdate(order.tracking_number);
  if (!newUpdates || newUpdates.length === 0) return;

  const statusUpdates = [...(order.status_updates || [])];
  let didUpdate = false;
  let latestStatus = dbStatus;
  let latestMessage = '';

  // newUpdates is sorted oldest to newest
  for (const nu of newUpdates) {
    // Skip initial 'shipped' updates from external API since shipped state is set manually by admin
    if (nu.status === 'shipped') continue;

    const existingIndex = statusUpdates.findIndex((up: any) => {
      if (up.message !== nu.message) return false;
      if (!up.date || !nu.date) return true;
      return up.date.split(' ')[0] === nu.date.split(' ')[0];
    });

    if (existingIndex >= 0) {
      if (statusUpdates[existingIndex].date !== nu.date) {
        statusUpdates[existingIndex].date = nu.date;
        didUpdate = true;
      }
    } else {
      statusUpdates.push(nu);
      didUpdate = true;
      latestStatus = nu.status;
      latestMessage = nu.message;
    }
  }

  if (!didUpdate) return;

  const { error } = await supabase
    .from('orders')
    .update({ 
      status: latestStatus, 
      status_updates: statusUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);

  if (!error) {
    if (dbStatus !== latestStatus) {
      const normalizedStatus = latestStatus;
      if (normalizedStatus === 'shipped' || normalizedStatus === 'in_transit') {
        sendOrderShippedEmail(order.id, latestMessage).catch(console.error);
      } else if (normalizedStatus === 'out_for_delivery') {
        sendOutForDeliveryEmail(order.id).catch(console.error);
      } else if (normalizedStatus === 'failed') {
        sendDeliveryFailedEmail(order.id, latestMessage).catch(console.error);
      }
    }

    order.status = latestStatus;
    order.status_updates = statusUpdates;
  } else {
    console.error('[Kourtier] Failed to persist tracking updates:', error);
  }
}

export async function checkAndSyncExpoExpressStatus(order: any, supabase: any) {
  if (!order || !order.id || !order.tracking_number) return;
  
  const carrier = (order.carrier_name || '').toLowerCase().replace(/\s+/g, '');
  if (!carrier.includes('expoexpress')) return;

  const TERMINAL_STATUSES = ['delivered', 'cancelled', 'returned'];
  const dbStatus = (order.status || '').toLowerCase();
  if (TERMINAL_STATUSES.includes(dbStatus)) return;

  const newUpdates = await fetchExpoExpressUpdate(order.tracking_number);
  if (!newUpdates || newUpdates.length === 0) return;

  const statusUpdates = [...(order.status_updates || [])];
  let didUpdate = false;
  let latestStatus = dbStatus;
  let latestMessage = '';

  // newUpdates is sorted oldest to newest
  for (const nu of newUpdates) {
    // Skip initial 'shipped' updates from external API since shipped state is set manually by admin
    if (nu.status === 'shipped') continue;

    const existingIndex = statusUpdates.findIndex((up: any) => {
      if (up.message !== nu.message) return false;
      if (!up.date || !nu.date) return true;
      return up.date.split(' ')[0] === nu.date.split(' ')[0];
    });

    if (existingIndex >= 0) {
      if (statusUpdates[existingIndex].date !== nu.date) {
        statusUpdates[existingIndex].date = nu.date;
        didUpdate = true;
      }
    } else {
      statusUpdates.push(nu);
      didUpdate = true;
      latestStatus = nu.status;
      latestMessage = nu.message;
    }
  }

  if (!didUpdate) return;

  // Perform database write for the entire array at once
  const { error } = await supabase
    .from('orders')
    .update({ 
      status: latestStatus, 
      status_updates: statusUpdates,
      updated_at: new Date().toISOString()
    })
    .eq('id', order.id);

  if (!error) {
    // Fire email ONLY IF the primary status changed and only for the latest status
    if (dbStatus !== latestStatus) {
      const normalizedStatus = latestStatus;
      if (normalizedStatus === 'shipped' || normalizedStatus === 'in_transit') {
        sendOrderShippedEmail(order.id, latestMessage).catch(console.error);
      } else if (normalizedStatus === 'out_for_delivery') {
        sendOutForDeliveryEmail(order.id).catch(console.error);
      } else if (normalizedStatus === 'failed') {
        sendDeliveryFailedEmail(order.id, latestMessage).catch(console.error);
      }
    }

    order.status = latestStatus;
    order.status_updates = statusUpdates;
  } else {
    console.error('[ExpoExpress] Failed to persist tracking updates:', error);
  }
}


export async function checkAndPersistDelayedStatus(order: any, supabase: any) {
  if (!order || !order.id) return;

  const dbStatus = (order.status || '').toLowerCase();
  // We keep 'failed' here so the delay script ignores it (reschedules are manual)
  const TERMINAL_STATUSES = ['delivered', 'cancelled', 'failed', 'returned'];
  if (TERMINAL_STATUSES.includes(dbStatus)) {
    return;
  }

  // Calculate delivery details using our helper
  const deliveryDetails = getExpectedDeliveryDetails(order.created_at, order.order_items);

  if (!deliveryDetails.isDelayed) {
    return;
  }

  const now = new Date();
  const delayDate = new Date(deliveryDetails.maxExpectedDate);
  delayDate.setDate(delayDate.getDate() + 1);
  delayDate.setHours(0, 0, 0, 0);

  if (now < delayDate) {
    return;
  }

  // Check if delay log already exists in database status_updates
  const statusUpdates = order.status_updates || [];
  const hasDelayLog = statusUpdates.some((up: any) => {
    const s = (up.status || '').toUpperCase();
    return s === 'DELAYED' || s === 'SHIPMENT_DELAYED' || s === 'RESCHEDULED';
  });

  if (hasDelayLog) {
    return;
  }

  // Determine status and message based on the current active section
  const STATUS_RANK: Record<string, number> = {
    'pending': 1,
    'confirmed': 2,
    'processing': 3,
    'shipped': 4,
    'in_transit': 5,
    'shipment_arrived': 6,
    'out_for_delivery': 7,
    'delivered': 8,
    'cancelled': 9,
    'failed': 10,
    'returned': 11,
    'rescheduled': 12
  };
  const currentRank = STATUS_RANK[dbStatus] || 0;
  const isShippedSection = currentRank >= 4;

  const delayStatus = isShippedSection ? 'shipment_delayed' : 'delayed';
  const delayMessage = isShippedSection
    ? "Your order has been slightly delayed due to unforeseen courier logistics/transit constraints. We are actively coordinating to speed it up."
    : "Your order has been slightly delayed due to logistics/warehouse processing constraints. We are actively priority-dispatching it.";

  const newLog = {
    status: delayStatus,
    message: delayMessage,
    date: delayDate.toISOString()
  };

  const updatedLogs = [...statusUpdates, newLog];

  // Perform database write
  const { error } = await supabase
    .from('orders')
    .update({ status_updates: updatedLogs })
    .eq('id', order.id);

  if (!error) {
    // Mutate the local order object in memory so the returned response reflects it immediately!
    order.status_updates = updatedLogs;
  } else {
    console.error('Failed to persist delayed status update:', error);
  }
}

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
        bundle_discount, coupon_code, cod_fees, tax_amount, payment_status, amount_paid,
        payment_screenshot_url, payment_remarks, payment_attempted_at,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, stock_status, brands (name))
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

    // Check and persist delay update to Postgres if necessary
    await checkAndPersistDelayedStatus(data, supabase);
    // Fetch external courier API updates if applicable
    await checkAndSyncExpoExpressStatus(data, supabase);
    await checkAndSyncKourtierStatus(data, supabase);

    return { success: true, order: mapToOrderProps(data as any) };
  } catch (error: any) {
    console.error('Action Error: trackOrderByIdAction:', error);
    return { success: false, message: error.message || 'Failed to fetch order.' };
  }
}

// Global in-flight requests map for server action deduplication
const inFlightOrderPromises = new Map<string, Promise<{ success: boolean; orderId?: string; message?: string; isDuplicate?: boolean }>>();

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

  // Build a unique deduplication key for this checkout request
  const dedupeKey = orderData.idempotency_key 
    ? `idemp_${user.id}_${orderData.idempotency_key}`
    : `user_${user.id}_${orderData.total_amount}_${items.length}`;

  // 2. In-flight promise lock: if another request with the same idempotency key is already running, await it
  if (inFlightOrderPromises.has(dedupeKey)) {
    console.warn(`[placeOrderAction] In-flight order request detected for key ${dedupeKey}. Awaiting existing promise.`);
    return await inFlightOrderPromises.get(dedupeKey)!;
  }

  const executionPromise = (async () => {
    try {
      // 3. Database check: check if an order with this idempotency key was already created
      if (orderData.idempotency_key) {
        const { data: existingByKey } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id)
          .eq('idempotency_key', orderData.idempotency_key)
          .maybeSingle();

        if (existingByKey?.id) {
          console.warn('[placeOrderAction] Duplicate order blocked by idempotency_key:', orderData.idempotency_key);
          return { success: true, orderId: existingByKey.id, isDuplicate: true };
        }
      }

      // 4. Fallback check: block duplicate orders for the same user with exact total amount within the last 30 seconds
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      const { data: recentOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('total_amount', orderData.total_amount)
        .gte('created_at', thirtySecondsAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentOrder?.id) {
        console.warn('[placeOrderAction] Duplicate submission caught by 30s window check for user:', user.id);
        return { success: true, orderId: recentOrder.id, isDuplicate: true };
      }

      // 5. Create Order via RPC
      const result = await createOrder(orderData, items, supabase);

      // Revalidate relevant paths
      revalidatePath('/account/orders');

      // Fire-and-forget email confirmations (Asynchronous for instant feedback)
      Promise.allSettled([
        sendOrderConfirmationEmail(result.id),
        sendAdminOrderReceivedEmail(result.id)
      ]).then(results => {
        results.forEach((res, i) => {
          if (res.status === 'rejected') {
            console.error(`[Email] ${i === 0 ? 'Confirmation' : 'Admin'} email failed:`, res.reason);
          }
        });
      });
      

      return { success: true, orderId: result.id };
    } catch (error: any) {
      console.error('Action Error: placeOrderAction:', error);
      return { success: false, message: error.message || 'Failed to place order.' };
    } finally {
      // Remove in-flight promise after completion
      inFlightOrderPromises.delete(dedupeKey);
    }
  })();

  inFlightOrderPromises.set(dedupeKey, executionPromise);
  return await executionPromise;
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
          products (name, images, stock_status, brands (name))
        )
      `, { count: 'estimated' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      // Run internal checks in parallel
      // Note: We skip checkAndSyncExpoExpressStatus here to prevent 429 Too Many Requests errors.
      // Tracking sync is handled by cron jobs and individual order tracking endpoints.
      await Promise.allSettled(
        data.map(async (order) => {
          await checkAndPersistDelayedStatus(order, supabase);
        })
      );
    }

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

    // Await cancellation emails (Production fix)
    await Promise.allSettled([
      sendOrderCancelledEmail(orderId, reason),
      sendAdminOrderCancelledEmail(orderId, reason)
    ]).catch(err => console.error('[Email] Cancellation emails failed:', err));

    return { success: true };
  } catch (error: any) {
    console.error('Action Error: cancelOrderAction:', error);
    return { success: false, message: error.message || 'Failed to process cancellation.' };
  }
}
/**
 * Server action to fetch all orders for admin dashboard
 */
export async function fetchAllOrdersAdminAction(page: number = 1, limit: number = 20, options?: { search?: string, status?: string, hideCancelled?: boolean }) {
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
  const adminClient = getSupabaseAdmin() || supabase;

  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = adminClient
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        discount_amount, shipping_amount, discount_on_mrp, coupon_discount, 
        bundle_discount, coupon_code, cod_fees, tax_amount, payment_status, amount_paid,
        payment_screenshot_url, payment_remarks, payment_attempted_at, updated_at,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, stock_status, brands (name))
        )
      `, { count: 'estimated' });

    // Apply Status Filter
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status.toLowerCase());
    } else if (options?.hideCancelled) {
      query = query.neq('status', 'cancelled');
    }

    // Apply Comprehensive Search Filter
    if (options?.search && options.search.trim().length > 0) {
      const rawSearch = options.search.trim();
      const cleanSearch = rawSearch.replace(/^#/, '').replace(/[,()%\\]/g, '').trim();

      if (cleanSearch.length > 0) {
        let orderIdsFromItems: string[] = [];
        let matchingOrderUuid: string[] = [];

        try {
          // 1. Find matching product IDs from products & brands tables
          const { data: matchingProducts } = await adminClient
            .from('products')
            .select('id')
            .or(`name.ilike.%${cleanSearch}%,title.ilike.%${cleanSearch}%,slug.ilike.%${cleanSearch}%`);

          const { data: matchingBrands } = await adminClient
            .from('brands')
            .select('id')
            .ilike('name', `%${cleanSearch}%`);

          const brandIds = matchingBrands?.map(b => b.id) || [];
          let productIdsFromBrands: string[] = [];
          if (brandIds.length > 0) {
            const { data: brandProducts } = await adminClient
              .from('products')
              .select('id')
              .in('brand_id', brandIds);
            productIdsFromBrands = brandProducts?.map(p => p.id) || [];
          }

          const allMatchingProductIds = Array.from(new Set([
            ...(matchingProducts?.map(p => p.id) || []),
            ...productIdsFromBrands
          ]));

          // 2. Query order_items to find order IDs for matching products, flavors, or sizes
          const itemFilters: string[] = [];
          if (allMatchingProductIds.length > 0) {
            itemFilters.push(`product_id.in.(${allMatchingProductIds.slice(0, 200).join(',')})`);
          }
          itemFilters.push(`selected_flavor.ilike.%${cleanSearch}%`);
          itemFilters.push(`selected_size.ilike.%${cleanSearch}%`);

          const { data: itemData } = await adminClient
            .from('order_items')
            .select('order_id')
            .or(itemFilters.join(','));

          if (itemData && itemData.length > 0) {
            orderIdsFromItems = itemData.map(i => i.order_id);
          }
        } catch (itemErr) {
          console.error('[Order Search] Item matching error:', itemErr);
        }

        try {
          // 3. Check for Short ID or UUID prefix matches using indexed prefix bounds (only if search is valid hex)
          const isPureHex = /^[0-9a-fA-F-]+$/.test(cleanSearch);
          const hexOnly = cleanSearch.replace(/[^A-Fa-f0-9]/g, '').toLowerCase();
          if (isPureHex && hexOnly.length >= 2) {
            const lowerPrefix = hexOnly.slice(0, 8).padEnd(8, '0');
            const upperPrefix = hexOnly.slice(0, 8).padEnd(8, 'f');
            const lowerBound = `${lowerPrefix}-0000-0000-0000-000000000000`;
            const upperBound = `${upperPrefix}-ffff-ffff-ffff-ffffffffffff`;

            const { data: matchedOrders } = await adminClient
              .from('orders')
              .select('id')
              .gte('id', lowerBound)
              .lte('id', upperBound)
              .limit(50);

            if (matchedOrders && matchedOrders.length > 0) {
              matchingOrderUuid = matchedOrders.map(o => o.id);
            }
          }
        } catch (idErr) {
          console.error('[Order Search] ID matching error:', idErr);
        }

        // 3b. Support multi-word customer name search (e.g. "shiba kc" matching first_name="shiba" & last_name="kc")
        let multiWordOrderIds: string[] = [];
        const words = cleanSearch.split(/\s+/).filter(Boolean);
        if (words.length > 1) {
          try {
            const w1 = words[0];
            const w2 = words.slice(1).join(' ');
            const { data: matchedNameOrders } = await adminClient
              .from('orders')
              .select('id')
              .or(`shipping_address->>first_name.ilike.%${w1}%,contact_details->>full_name.ilike.%${w1}%,contact_details->>name.ilike.%${w1}%,shipping_address->addressDetails->>first_name.ilike.%${w1}%`)
              .or(`shipping_address->>last_name.ilike.%${w2}%,contact_details->>full_name.ilike.%${w2}%,contact_details->>name.ilike.%${w2}%,shipping_address->addressDetails->>last_name.ilike.%${w2}%`)
              .limit(100);

            if (matchedNameOrders && matchedNameOrders.length > 0) {
              multiWordOrderIds = matchedNameOrders.map(o => o.id);
            }
          } catch (mwErr) {
            console.error('[Order Search] Multi-word name matching error:', mwErr);
          }
        }

        // 4. Combine all order IDs matching items, ID prefix, or multi-word customer names
        const combinedOrderIds = Array.from(new Set([
          ...orderIdsFromItems,
          ...matchingOrderUuid,
          ...multiWordOrderIds
        ])).slice(0, 300);

        // 5. Build OR clauses for main orders query
        let orClauses = [
          `contact_details->>full_name.ilike.%${cleanSearch}%`,
          `contact_details->>name.ilike.%${cleanSearch}%`,
          `contact_details->>email.ilike.%${cleanSearch}%`,
          `contact_details->>phone.ilike.%${cleanSearch}%`,
          `contact_details->>value.ilike.%${cleanSearch}%`,
          `shipping_address->>first_name.ilike.%${cleanSearch}%`,
          `shipping_address->>last_name.ilike.%${cleanSearch}%`,
          `shipping_address->>phone.ilike.%${cleanSearch}%`,
          `shipping_address->addressDetails->>first_name.ilike.%${cleanSearch}%`,
          `shipping_address->addressDetails->>last_name.ilike.%${cleanSearch}%`,
          `shipping_address->addressDetails->>phone.ilike.%${cleanSearch}%`,
          `coupon_code.ilike.%${cleanSearch}%`,
          `tracking_number.ilike.%${cleanSearch}%`,
          `carrier_name.ilike.%${cleanSearch}%`
        ];

        if (combinedOrderIds.length > 0) {
          orClauses.push(`id.in.(${combinedOrderIds.join(',')})`);
        }

        query = query.or(orClauses.join(','));
      }
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      // Run internal checks in parallel
      // Note: We skip checkAndSyncExpoExpressStatus here to prevent 429 Too Many Requests errors.
      // Tracking sync is handled by cron jobs and individual order tracking endpoints.
      await Promise.allSettled(
        data.map(async (order) => {
          await checkAndPersistDelayedStatus(order, adminClient);
        })
      );
    }

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

        // Instantly trigger live courier tracking sync so database updates immediately
        const { data: updatedOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (updatedOrder) {
          await checkAndSyncExpoExpressStatus(updatedOrder, supabase);
          await checkAndSyncKourtierStatus(updatedOrder, supabase);
        }
      }
    }

    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');

    // Await status-specific email (Production fix)
    const normalizedStatus = newStatus.toLowerCase();
    if (normalizedStatus === 'shipped' || normalizedStatus === 'in_transit') {
      await sendOrderShippedEmail(orderId, message).catch(err =>
        console.error('[Email] Shipped email failed:', err)
      );
    } else if (normalizedStatus === 'out_for_delivery') {
      await sendOutForDeliveryEmail(orderId).catch(err =>
        console.error('[Email] OFD email failed:', err)
      );
    } else if (normalizedStatus === 'failed') {
      await sendDeliveryFailedEmail(orderId, message).catch(err =>
        console.error('[Email] Failed delivery email failed:', err)
      );
    } else if (normalizedStatus === 'cancelled') {
      await sendOrderCancelledEmail(orderId, message).catch(err =>
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
    // Trigger customer email if payment is marked as paid
    if (paymentStatus.toLowerCase() === 'paid') {
      sendCustomerPaymentConfirmedEmail(orderId).catch(err => 
        console.error('[Email] Customer payment confirmation email failed:', err)
      );
    }

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: updatePaymentStatusAdminAction:', error);
    return { success: false, message: error.message || 'Failed to update payment status.' };
  }
}

/**
 * Server action to reset payment status and clear proofs by admin
 */
export async function resetPaymentAdminAction(orderId: string) {
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
        payment_status: 'pending',
        payment_screenshot_url: null,
        payment_remarks: null,
        amount_paid: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (updateError) throw updateError;

    revalidatePath('/admin/orders');
    
    return { success: true };
  } catch (error: any) {
    console.error('Action Error: resetPaymentAdminAction:', error);
    return { success: false, message: error.message || 'Failed to reset payment.' };
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

/**
 * Server action for Admin to manually create an order.
 * Handles customer auto-creation if the email is new.
 */
export async function createManualOrderAction(orderData: any, items: any[]) {
  const supabase = await createClient();
  const adminSupabase = getSupabaseAdmin();
  if (!adminSupabase) return { success: false, message: 'Admin client missing.' };

  // 1. Verify Admin Role
  const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !adminUser) return { success: false, message: 'Unauthorized.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
  if (profile?.role !== 'admin') return { success: false, message: 'Forbidden.' };

  try {
    let targetUserId = orderData.user_id;

    // 2. Handle Customer (Lookup or Create)
    if (!targetUserId && orderData.customerEmail) {
      // Check if user already exists in auth
      const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers();
      if (listError) throw listError;

      const existingUser = users.find(u => u.email?.toLowerCase() === orderData.customerEmail.toLowerCase());

      if (existingUser) {
        targetUserId = existingUser.id;
      } else {
        // Create new Auth User
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          email: orderData.customerEmail,
          email_confirm: true,
          user_metadata: { full_name: orderData.customerName || 'Manual Customer' }
        });

        if (createError) throw createError;
        targetUserId = newUser.user.id;
      }
    }

    if (!targetUserId) throw new Error('Could not identify or create customer.');

    // 2.5 Sync or Create Profile entry (Ensures latest address/email is stored)
    await adminSupabase.from('profiles').upsert({
      id: targetUserId,
      full_name: orderData.customerName || 'Manual Customer',
      email: orderData.customerEmail,
      phone: orderData.customerPhone || '',
      address_data: orderData.shipping_address
    });

    // 3. Prepare Order Data
    const finalOrderData: OrderData = {
      user_id: targetUserId,
      total_amount: orderData.total_amount,
      mrp_amount: orderData.mrp_amount || orderData.total_amount,
      discount_amount: orderData.discount_amount || 0,
      shipping_amount: orderData.shipping_amount || 0,
      discount_on_mrp: orderData.discount_on_mrp || 0,
      coupon_discount: orderData.coupon_discount || 0,
      coupon_code: orderData.coupon_code || null,
      bundle_discount: orderData.bundle_discount || 0,
      cod_fees: orderData.cod_fees || 0,
      tax_amount: orderData.tax_amount || 0,
      shipping_address: orderData.shipping_address,
      contact_details: {
        full_name: orderData.customerName,
        email: orderData.customerEmail,
        phone: orderData.customerPhone
      },
      payment_method: orderData.payment_method || 'COD',
      payment_screenshot_url: orderData.payment_screenshot_url || null,
      payment_remarks: orderData.payment_remarks || 'Manually created by Admin'
    };

    // 4. Create Order using existing service, passing the admin client
    const result = await createOrder(finalOrderData, items, adminSupabase);

    revalidatePath('/admin/orders');
    
    // Await confirmation email for manual order (Production fix)
    await sendOrderConfirmationEmail(result.id).catch(err => 
      console.error('[Email] Confirmation failed for manual order:', err)
    );

    return { success: true, orderId: result.id };
  } catch (error: any) {
    console.error('Action Error: createManualOrderAction:', error);
    return { success: false, message: error.message || 'Failed to create manual order.' };
  }
}
/**
 * Server action to manually resend order status email (Admin only)
 */
export async function resendStatusEmailAction(orderId: string, status: string, message: string) {
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
    let success = false;
    const normalizedStatus = status.toLowerCase();

    // 2. Route to correct email template based on mapping in updateOrderStatusAdminAction
    if (normalizedStatus === 'pending' || normalizedStatus === 'confirmed') {
      success = await sendOrderConfirmationEmail(orderId);
    } else if (normalizedStatus === 'shipped' || normalizedStatus === 'in_transit' || normalizedStatus === 'processing' || normalizedStatus === 'shipment_arrived') {
      success = await sendOrderShippedEmail(orderId, message);
    } else if (normalizedStatus === 'out_for_delivery') {
      success = await sendOutForDeliveryEmail(orderId);
    } else if (normalizedStatus === 'failed') {
      success = await sendDeliveryFailedEmail(orderId, message);
    } else if (normalizedStatus === 'cancelled') {
      success = await sendOrderCancelledEmail(orderId, message);
    } else {
      // Default fallback to confirmation if unknown, or return error?
      return { success: false, message: `No email template mapped for status: ${status}` };
    }
    
    if (success) {
      return { success: true, message: `Notification email for "${status}" resent successfully.` };
    } else {
      return { success: false, message: 'Failed to resend email. Check server logs.' };
    }
  } catch (error: any) {
    console.error('Action Error: resendStatusEmailAction:', error);
    return { success: false, message: error.message || 'Failed to resend email.' };
  }
}

/**
 * Server action to manually trigger an external sync (Expo Express and Delay logic)
 * Used when a user opens an order details page or admin modal.
 */
export async function syncExternalOrderTrackingAction(orderId: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false };
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, stock_status, brands (name))
        )
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) return { success: false };

    await checkAndPersistDelayedStatus(order, supabase);
    await checkAndSyncExpoExpressStatus(order, supabase);
    await checkAndSyncKourtierStatus(order, supabase);
    
    return { success: true };
  } catch (err) {
    console.error('syncExternalOrderTrackingAction Error:', err);
    return { success: false };
  }
}

/**
 * Server action to manually trigger external sync for multiple orders
 * Used to automatically sync tracking data when admin views orders list
 */
export async function syncMultipleExternalOrdersTrackingAction(orderIds: string[]) {
  if (!orderIds || orderIds.length === 0) return { success: true, updatedCount: 0 };

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false, message: 'Server configuration error' };

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, stock_status, brands (name))
        )
      `)
      .in('id', orderIds);

    if (error || !orders) return { success: false, message: 'Failed to fetch orders' };

    let updatedCount = 0;

    // Process orders concurrently in parallel so background sync completes fast without blocking dev server
    await Promise.allSettled(
      orders.map(async (order) => {
        const originalStatus = order.status;
        const originalLogsCount = order.status_updates?.length || 0;

        await checkAndPersistDelayedStatus(order, supabase);
        await checkAndSyncExpoExpressStatus(order, supabase);
        await checkAndSyncKourtierStatus(order, supabase);

        const newLogsCount = order.status_updates?.length || 0;
        if (order.status !== originalStatus || newLogsCount !== originalLogsCount) {
          updatedCount++;
        }
      })
    );

    return { success: true, updatedCount };
  } catch (err) {
    console.error('syncMultipleExternalOrdersTrackingAction Error:', err);
    return { success: false, message: 'An error occurred during sync' };
  }
}

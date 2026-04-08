import { supabase } from '@/lib/supabase/client';
import type { OrderProps, OrderStatus } from '@/components/orders/OrderCard';

export interface OrderData {
  user_id: string;
  total_amount: number;
  mrp_amount: number;
  discount_amount: number;
  shipping_amount: number;
  discount_on_mrp: number;
  coupon_discount: number;
  coupon_code: string | null;
  cod_fees: number;
  tax_amount: number;
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
 * Maps database order status to UI OrderStatus
 */
export function mapStatus(dbStatus: string): OrderStatus {
  const status = dbStatus.toLowerCase();
  switch (status) {
    case 'pending': return 'PENDING';
    case 'confirmed': return 'CONFIRMED';
    case 'processing': return 'PROCESSING';
    case 'shipped': return 'SHIPPED';
    case 'in_transit': return 'IN_TRANSIT';
    case 'out_for_delivery': return 'OUT_FOR_DELIVERY';
    case 'delivered': return 'DELIVERED';
    case 'returned': return 'RETURNED';
    case 'scheduled': return 'SCHEDULED';
    case 'failed': return 'FAILED';
    case 'cancelled': return 'CANCELLED';
    default: return 'CONFIRMED';
  }
}

/**
 * Maps database order record to OrderCard props
 */
export function mapToOrderProps(order: any): OrderProps {
  // Get the first item for the summary view
  const firstItem = order.order_items?.[0] || {};
  const product = firstItem.products || {};
  
  // Format date: "Apr 18, 2026"
  const date = new Date(order.created_at);
  const dateText = `${order.status === 'delivered' ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : 'Ordered'} On ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return {
    id: order.id, // Full UUID for routing
    shortId: order.id.split('-')[0].toUpperCase(), // Short ID for display
    status: mapStatus(order.status),
    dateText,
    brand: product.brand_name || 'SNP Nutrition',
    title: product.name || 'Product Details',
    image: product.images?.[0] || '/images/product.png',
    size: firstItem.selected_size || 'Standard',
    flavour: firstItem.selected_flavor || 'Default',
    extraItemsCount: Math.max(0, (order.order_items?.length || 0) - 1),
    isCancellable: order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing',
  };
}

/**
 * Creates a new order using the atomic RPC function
 */
export async function createOrder(orderData: OrderData, items: any[]) {
  const formattedItems = items.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    mrp: item.mrp || item.price,
    selected_size: item.selected_size,
    selected_flavor: item.selected_flavor
  }));

  const { data, error } = await supabase.rpc('create_order_v2', {
    p_user_id: orderData.user_id,
    p_total_amount: orderData.total_amount,
    p_mrp_amount: orderData.mrp_amount,
    p_discount_amount: orderData.discount_amount,
    p_shipping_amount: orderData.shipping_amount,
    p_discount_on_mrp: orderData.discount_on_mrp || 0,
    p_coupon_discount: orderData.coupon_discount || 0,
    p_coupon_code: orderData.coupon_code || null,
    p_cod_fees: orderData.cod_fees || 0,
    p_tax_amount: orderData.tax_amount || 0,
    p_shipping_address: orderData.shipping_address,
    p_contact_details: orderData.contact_details,
    p_payment_method: orderData.payment_method,
    p_items: formattedItems
  });

  if (error) {
    console.error('Error creating order via RPC:', error);
    throw error;
  }

  return { id: data };
}

/**
 * Fetch orders for a user with product details
 */
export async function fetchUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, images, brands (name))
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data.map(mapToOrderProps);
}

/**
 * Fetch a single order with full details
 */
export async function fetchOrderDetails(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Error fetching order details:', error);
    return null;
  }

  // Backwards compatibility: Inject full address details if only ID exists
  if (data?.shipping_address?.addressId && !data.shipping_address.addressDetails) {
    const { data: addressData } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', data.shipping_address.addressId)
      .single();
    
    if (addressData) {
      data.shipping_address.addressDetails = addressData;
    }
  }

  return data;
}

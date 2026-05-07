import { OrderProps } from '@/components/orders/OrderCard';

const STORE_NAME = 'Supplyment Nepal';
const STORE_DOMAIN = 'https://www.brightsupplements.store';

/**
 * Formats a Nepal phone number for WhatsApp.
 * Handles: 98xxxxxxxx → 97798xxxxxxxx, +97798xxxxxxxx → 97798xxxxxxxx, etc.
 */
export function formatPhoneForWhatsApp(phone: string): string {
  // Strip all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // If it starts with Nepal code already, return as-is
  if (digits.startsWith('977')) return digits;

  // Nepal mobile numbers start with 97 or 98 (10 digits)
  if (digits.length === 10 && (digits.startsWith('97') || digits.startsWith('98'))) {
    return `977${digits}`;
  }

  // Fallback: assume Nepal if it's a 10-digit number
  if (digits.length === 10) {
    return `977${digits}`;
  }

  return digits;
}

/**
 * Resolves the best available phone number from order data.
 */
export function resolveOrderPhone(order: OrderProps): string | null {
  const phone =
    order.shippingAddress?.phone ||
    order.shippingAddress?.addressDetails?.phone ||
    order.customerPhone;

  return phone && phone.trim() ? phone.trim() : null;
}

/**
 * Generates a full wa.me URL with pre-filled message.
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

// ─── Item formatting helper ───────────────────────────────────
function formatOrderItems(order: OrderProps): string {
  if (!order.order_items || order.order_items.length === 0) {
    return `  • ${order.title || 'Product'}`;
  }

  return order.order_items
    .map((item) => {
      // Use Title (Display Name) as primary, fallback to name or generic title
      const name = item.products?.title || item.products?.name || order.title || 'Product';
      const variants: string[] = [];
      if (item.selected_size) variants.push(item.selected_size);
      if (item.selected_flavor) variants.push(item.selected_flavor);
      const variantStr = variants.length > 0 ? ` (${variants.join(', ')})` : '';
      const lineTotal = item.price * item.quantity;
      return `  • ${name}${variantStr} ×${item.quantity} — Rs. ${lineTotal.toLocaleString()}`;
    })
    .join('\n');
}

// ─── Address formatting helper ────────────────────────────────
function formatAddress(order: OrderProps): string {
  const addr = order.shippingAddress;
  if (!addr) return '  Address not provided';

  const parts: string[] = [];

  const name = [
    addr.first_name || addr.addressDetails?.first_name,
    addr.last_name || addr.addressDetails?.last_name,
  ]
    .filter(Boolean)
    .join(' ');

  if (name) parts.push(`  ${name}`);
  else if (order.customerName) parts.push(`  ${order.customerName}`);

  const street = addr.street || addr.address_line_1 || addr.addressDetails?.address_line_1;
  const area = addr.area;
  const streetLine = [street, area].filter(Boolean).join(', ');
  if (streetLine) parts.push(`  ${streetLine}`);

  const city = addr.city || addr.addressDetails?.city;
  const state = addr.state || addr.addressDetails?.state;
  const pincode = addr.pincode || addr.postal_code || addr.addressDetails?.pincode;
  const cityLine = [city, state, pincode].filter(Boolean).join(', ');
  if (cityLine) parts.push(`  ${cityLine}`);

  return parts.join('\n');
}

// ─── Tracking URL helper ──────────────────────────────────────
function getTrackingUrl(order: OrderProps): string {
  return `${STORE_DOMAIN}/track-order?id=${order.shortId}`;
}

// ─── Payment method label ─────────────────────────────────────
function getPaymentLabel(order: OrderProps): string {
  const method = order.paymentMethod?.toLowerCase();
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'qr') return 'QR / Online Payment';
  return order.paymentMethod?.replace(/_/g, ' ') || 'N/A';
}

// ─── Customer first name ──────────────────────────────────────
function getFirstName(order: OrderProps): string {
  const addr = order.shippingAddress;
  if (addr?.first_name) return addr.first_name;
  if (addr?.addressDetails?.first_name) return addr.addressDetails.first_name;
  if (order.customerName) return order.customerName.split(' ')[0];
  return 'Customer';
}

// ═══════════════════════════════════════════════════════════════
//  MESSAGE TEMPLATES
// ═══════════════════════════════════════════════════════════════

function confirmedMessage(order: OrderProps): string {
  const name = getFirstName(order);
  const items = formatOrderItems(order);
  const address = formatAddress(order);
  const total = order.totalAmount?.toLocaleString() || '—';
  const payment = getPaymentLabel(order);
  const trackUrl = getTrackingUrl(order);

  return [
    `✅ *ORDER CONFIRMED* — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Your order has been confirmed and is being prepared.`,
    ``,
    `📋 *Items Ordered:*`,
    items,
    ``,
    `💰 *Total:* Rs. ${total}`,
    `💳 *Payment:* ${payment}`,
    ``,
    `📍 *Delivery to:*`,
    address,
    ``,
    `🔗 *Track your order:*`,
    trackUrl,
    ``,
    `Thank you for shopping with *${STORE_NAME}*! 🙏`,
  ].join('\n');
}

function shippedMessage(order: OrderProps): string {
  const name = getFirstName(order);
  const carrier = order.carrierName || 'Our courier partner';
  const tracking = order.trackingNumber ? `#${order.trackingNumber}` : 'will be updated soon';
  const trackUrl = getTrackingUrl(order);

  return [
    `🚚 *ORDER SHIPPED* — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Great news — your order has been shipped!`,
    ``,
    `🏢 *Carrier:* ${carrier}`,
    `🔢 *Tracking:* ${tracking}`,
    ``,
    `📋 *Items:*`,
    formatOrderItems(order),
    ``,
    `🔗 *Track your order:*`,
    trackUrl,
    ``,
    `We'll keep you updated on the delivery progress!`,
    `— *${STORE_NAME}* 📍`,
  ].join('\n');
}

function inTransitMessage(order: OrderProps): string {
  const name = getFirstName(order);
  const trackUrl = getTrackingUrl(order);

  return [
    `📍 *ORDER IN TRANSIT* — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Your package is on its way to the delivery hub near you.`,
    ``,
    `🔗 *Track live:*`,
    trackUrl,
    ``,
    `You'll receive another update when it's out for delivery!`,
    `— *${STORE_NAME}* 🚀`,
  ].join('\n');
}

function outForDeliveryMessage(order: OrderProps): string {
  const name = getFirstName(order);
  const phone = resolveOrderPhone(order);
  const trackUrl = getTrackingUrl(order);

  return [
    `🏍️ *OUT FOR DELIVERY* — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Your order is out for delivery and will arrive today.`,
    ``,
    `📱 Please keep your phone (${phone || 'on file'}) reachable for the delivery partner.`,
    ``,
    `🔗 *Track live:*`,
    trackUrl,
    ``,
    `Almost there! 🎉`,
    `— *${STORE_NAME}*`,
  ].join('\n');
}

function deliveredMessage(order: OrderProps): string {
  const name = getFirstName(order);

  return [
    `✅ *ORDER DELIVERED* — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Your order has been successfully delivered! 🎉`,
    ``,
    `📋 *Items:*`,
    formatOrderItems(order),
    ``,
    `💰 *Total Paid:* Rs. ${order.totalAmount?.toLocaleString() || '—'}`,
    ``,
    `We hope you love your products! If you have any questions or need support, feel free to reach out anytime.`,
    ``,
    `Thank you for choosing *${STORE_NAME}*! 💪🙏`,
  ].join('\n');
}

function genericStatusMessage(order: OrderProps, status: string): string {
  const name = getFirstName(order);
  const trackUrl = getTrackingUrl(order);
  const statusLabel = status.replace(/_/g, ' ').toUpperCase();

  return [
    `📦 *ORDER UPDATE:* ${statusLabel} — Order *#${order.shortId}*`,
    ``,
    `Hi ${name}! Your order status has been updated to *${statusLabel}*.`,
    ``,
    `🔗 *Track your order:*`,
    trackUrl,
    ``,
    `If you have any questions, feel free to reach out!`,
    `— *${STORE_NAME}* 🙏`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════

/**
 * Returns the appropriate WhatsApp message for the given order & status.
 */
export function getWhatsAppMessage(order: OrderProps, status?: string): string {
  const normalizedStatus = (status || order.status).toUpperCase();

  switch (normalizedStatus) {
    case 'CONFIRMED':
      return confirmedMessage(order);
    case 'PROCESSING':
      return confirmedMessage(order); // Same as confirmed, order is being prepared
    case 'SHIPPED':
      return shippedMessage(order);
    case 'IN_TRANSIT':
    case 'SHIPMENT_ARRIVED':
      return inTransitMessage(order);
    case 'OUT_FOR_DELIVERY':
      return outForDeliveryMessage(order);
    case 'DELIVERED':
      return deliveredMessage(order);
    default:
      return genericStatusMessage(order, normalizedStatus);
  }
}

/**
 * Returns the button label text based on order status.
 */
export function getWhatsAppButtonLabel(status: string): string {
  const s = status.toUpperCase();
  switch (s) {
    case 'PENDING': return 'Send Confirmation';
    case 'CONFIRMED': return 'Send Confirmation';
    case 'PROCESSING': return 'Send Processing Update';
    case 'SHIPPED': return 'Send Shipped Update';
    case 'IN_TRANSIT': return 'Send Transit Update';
    case 'SHIPMENT_ARRIVED': return 'Send Arrival Update';
    case 'OUT_FOR_DELIVERY': return 'Send Delivery Alert';
    case 'DELIVERED': return 'Send Delivered Message';
    case 'CANCELLED': return 'Send Cancellation Notice';
    default: return 'Send WhatsApp Update';
  }
}

/**
 * Opens WhatsApp with a pre-filled message for the given order.
 * Returns false if no phone number is available.
 */
export function openWhatsAppForOrder(order: OrderProps, status?: string): boolean {
  const phone = resolveOrderPhone(order);
  if (!phone) return false;

  const message = getWhatsAppMessage(order, status);
  const url = generateWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

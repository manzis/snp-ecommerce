/**
 * Email Service — SNP Nutrition
 * Gmail transport via Nodemailer with order-specific sender functions.
 */

import nodemailer from 'nodemailer';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  orderConfirmationTemplate,
  orderShippedTemplate,
  outForDeliveryTemplate,
  orderCancelledTemplate,
  deliveryFailedTemplate,
  adminOrderReceivedTemplate,
  contactFormEmailTemplate,
  paymentAttemptTemplate,
  paymentAcknowledgeTemplate,
  customerPaymentConfirmedTemplate,
  STORE_NAME,
  type OrderEmailData,
  type ContactEmailData,
} from './emailTemplates';

const ADMIN_EMAIL = 'brightnepcare@gmail.com';

// ─── Gmail Transport ─────────────────────────────────────────────────

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return transporter;
}

// ─── Base Sender ─────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const info = await getTransporter().sendMail({
      from: `"${process.env.STORE_NAME || 'SNP Nutrition'}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[EmailService] ✅ Sent to ${to} — MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] ❌ Failed to send to ${to}:`, error);
    return false;
  }
}

// ─── Order Data Fetcher ──────────────────────────────────────────────

async function fetchOrderEmailData(orderId: string): Promise<OrderEmailData | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[EmailService] No admin supabase client available');
    return null;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id, total_amount, mrp_amount, status, payment_method,
      shipping_address, contact_details,
      discount_amount, shipping_amount, coupon_discount, bundle_discount,
      carrier_name, tracking_number,
      order_items (
        quantity, price, mrp, selected_size, selected_flavor,
        products (name, images)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    console.error('[EmailService] Failed to fetch order:', error);
    return null;
  }

  // Resolve customer email
  const addr = order.shipping_address as any;
  const contact = order.contact_details as any;
  const details = addr?.addressDetails || addr || {};

  const customerEmail = details.email || contact?.email || contact?.value || '';
  if (!customerEmail) {
    console.warn(`[EmailService] No email found for order ${orderId}, skipping.`);
    return null;
  }

  const customerName = details.first_name
    ? `${details.first_name} ${details.last_name || ''}`.trim()
    : contact?.full_name || 'Customer';

  const items = (order.order_items as any[]).map((item: any) => ({
    name: item.products?.name || 'Product',
    quantity: item.quantity,
    price: item.price,
    size: item.selected_size || undefined,
    flavor: item.selected_flavor || undefined,
    image: item.products?.images?.[0] || undefined,
  }));

  return {
    orderId: order.id,
    shortId: order.id.split('-')[0].toUpperCase(),
    customerName,
    customerEmail,
    items,
    totalAmount: order.total_amount,
    mrpAmount: order.mrp_amount || undefined,
    discountAmount: order.discount_amount || undefined,
    shippingAmount: order.shipping_amount || undefined,
    couponDiscount: order.coupon_discount || undefined,
    bundleDiscount: order.bundle_discount || undefined,
    paymentMethod: order.payment_method,
    shippingAddress: {
      city: details.city || '',
      area: details.area || details.address_line || '',
      address: details.address || '',
      phone: details.phone || contact?.phone || '',
    },
    trackingNumber: order.tracking_number || undefined,
    carrierName: order.carrier_name || undefined,
  };
}

// ─── Public Sender Functions (fire-and-forget or awaitable) ─────────

export async function sendOrderConfirmationEmail(orderId: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const html = orderConfirmationTemplate(data);
  return await sendEmail(data.customerEmail, `Order Confirmed — #${data.shortId}`, html);
}

export async function sendAdminOrderReceivedEmail(orderId: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const html = adminOrderReceivedTemplate(data);
  return await sendEmail(ADMIN_EMAIL, `New Order Received — #${data.shortId}`, html);
}

export async function sendOrderShippedEmail(orderId: string, statusMessage?: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  data.statusMessage = statusMessage;
  const html = orderShippedTemplate(data);
  return await sendEmail(data.customerEmail, `Your Order Has Been Shipped — #${data.shortId}`, html);
}

export async function sendOutForDeliveryEmail(orderId: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const html = outForDeliveryTemplate(data);
  return await sendEmail(data.customerEmail, `Out for Delivery — #${data.shortId}`, html);
}

export async function sendOrderCancelledEmail(orderId: string, reason?: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  data.cancellationReason = reason;
  const html = orderCancelledTemplate(data);
  return await sendEmail(data.customerEmail, `Order Cancelled — #${data.shortId}`, html);
}

export async function sendDeliveryFailedEmail(orderId: string, failureMessage?: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  data.statusMessage = failureMessage;
  const html = deliveryFailedTemplate(data);
  return await sendEmail(data.customerEmail, `Delivery Failed — #${data.shortId}`, html);
}

export async function sendContactFormEmail(data: ContactEmailData): Promise<boolean> {
  const html = contactFormEmailTemplate(data);
  return await sendEmail(ADMIN_EMAIL, `New Message from ${data.fullName} — SNP Contact Form`, html);
}

export async function sendPaymentAttemptEmail(orderId: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const html = paymentAttemptTemplate(data);
  return await sendEmail(ADMIN_EMAIL, `Payment Attempted — #${data.shortId}`, html);
}

export async function sendPaymentAcknowledgeEmail(orderId: string, screenshotUrl: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const adminLink = `https://brightsupplements.store/admin/orders?orderId=${orderId}`;
  const html = paymentAcknowledgeTemplate({ ...data, screenshotUrl, adminLink });
  return await sendEmail(ADMIN_EMAIL, `Payment Receipt Uploaded — #${data.shortId}`, html);
}

export async function sendCustomerPaymentConfirmedEmail(orderId: string): Promise<boolean> {
  const data = await fetchOrderEmailData(orderId);
  if (!data) return false;

  const html = customerPaymentConfirmedTemplate({ 
    ...data, 
    statusMessage: data.statusMessage || 'Processing' 
  });
  return await sendEmail(data.customerEmail, `Payment Received for Order #${data.shortId} — ${STORE_NAME}`, html);
}

// ─── Generic Email Sender (for future marketing/subscriptions) ───────

export { sendEmail };

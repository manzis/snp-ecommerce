/**
 * Premium Email Templates — SNP Nutrition
 * Amazon/Flipkart-quality inline-CSS HTML templates for transactional emails.
 */

interface OrderEmailData {
  orderId: string;
  shortId: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    size?: string;
    flavor?: string;
    image?: string;
  }[];
  totalAmount: number;
  mrpAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  couponDiscount?: number;
  paymentMethod: string;
  shippingAddress: {
    city?: string;
    area?: string;
    address?: string;
    phone?: string;
  };
  trackingNumber?: string;
  carrierName?: string;
  statusMessage?: string;
  cancellationReason?: string;
}

const STORE_NAME = process.env.STORE_NAME || 'SNP Nutrition';
const STORE_URL = process.env.STORE_URL || 'https://snpnutrition.com';
const SUPPORT_EMAIL = process.env.GMAIL_USER || 'support@snpnutrition.com';

// ─── Shared Layout Helpers ───────────────────────────────────────────

function baseLayout(content: string, preheader: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${STORE_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          ${content}
        </table>
        <!-- Footer -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin-top:16px;">
          <tr>
            <td style="padding:16px 24px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;">© ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.</p>
              <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#3f9733;text-decoration:none;">Contact Support</a> • <a href="${STORE_URL}" style="color:#3f9733;text-decoration:none;">Visit Store</a>
              </p>
              <p style="margin:0;font-size:11px;color:#d4d4d8;">You are receiving this email because you placed an order on ${STORE_NAME}.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function statusBanner(bgColor: string, iconEmoji: string, title: string, subtitle: string): string {
  return `<tr>
    <td style="background:${bgColor};padding:32px 24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:12px;">${iconEmoji}</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${title}</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:400;">${subtitle}</p>
    </td>
  </tr>`;
}

function orderIdRow(shortId: string, dateStr: string): string {
  return `<tr>
    <td style="padding:20px 24px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#71717a;font-weight:500;">Order <span style="color:#242424;font-weight:700;">#${shortId}</span></td>
          <td align="right" style="font-size:13px;color:#a1a1aa;">${dateStr}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function itemsTable(items: OrderEmailData['items']): string {
  const rows = items.map(item => {
    const meta = [item.size, item.flavor].filter(Boolean).join(' • ');
    return `<tr>
      <td style="padding:12px 0;border-bottom:1px solid #f4f4f5;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${item.image ? `<td width="56" style="vertical-align:top;padding-right:12px;">
              <img src="${item.image}" width="56" height="56" alt="${item.name}" style="border-radius:8px;object-fit:cover;display:block;border:1px solid #f4f4f5;" />
            </td>` : ''}
            <td style="vertical-align:top;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#242424;">${item.name}</p>
              ${meta ? `<p style="margin:0 0 2px;font-size:12px;color:#a1a1aa;">${meta}</p>` : ''}
              <p style="margin:0;font-size:12px;color:#71717a;">Qty: ${item.quantity}</p>
            </td>
            <td align="right" style="vertical-align:top;white-space:nowrap;">
              <span style="font-size:14px;font-weight:700;color:#242424;">NPR ${(item.price * item.quantity).toLocaleString()}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
  }).join('');

  return `<tr>
    <td style="padding:0 24px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${rows}
      </table>
    </td>
  </tr>`;
}

function pricingSummary(data: OrderEmailData): string {
  const rows: string[] = [];
  
  if (data.mrpAmount && data.mrpAmount > data.totalAmount) {
    rows.push(`<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">MRP Total</td><td align="right" style="padding:4px 0;font-size:13px;color:#71717a;">NPR ${data.mrpAmount.toLocaleString()}</td></tr>`);
  }
  if (data.discountAmount && data.discountAmount > 0) {
    rows.push(`<tr><td style="padding:4px 0;font-size:13px;color:#3f9733;">Discount</td><td align="right" style="padding:4px 0;font-size:13px;color:#3f9733;">- NPR ${data.discountAmount.toLocaleString()}</td></tr>`);
  }
  if (data.couponDiscount && data.couponDiscount > 0) {
    rows.push(`<tr><td style="padding:4px 0;font-size:13px;color:#3f9733;">Coupon Discount</td><td align="right" style="padding:4px 0;font-size:13px;color:#3f9733;">- NPR ${data.couponDiscount.toLocaleString()}</td></tr>`);
  }
  if (data.shippingAmount !== undefined) {
    rows.push(`<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Shipping</td><td align="right" style="padding:4px 0;font-size:13px;color:#71717a;">${data.shippingAmount > 0 ? `NPR ${data.shippingAmount.toLocaleString()}` : '<span style="color:#3f9733;">FREE</span>'}</td></tr>`);
  }

  return `<tr>
    <td style="padding:16px 24px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f4f4f5;padding-top:12px;">
        ${rows.join('')}
        <tr>
          <td style="padding:12px 0 0;font-size:16px;font-weight:700;color:#242424;border-top:2px solid #e4e4e7;">Total Paid</td>
          <td align="right" style="padding:12px 0 0;font-size:18px;font-weight:800;color:#242424;border-top:2px solid #e4e4e7;">NPR ${data.totalAmount.toLocaleString()}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function addressBlock(data: OrderEmailData): string {
  const addr = data.shippingAddress;
  const addressLine = [addr.area, addr.city].filter(Boolean).join(', ');

  return `<tr>
    <td style="padding:20px 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;border:1px solid #f4f4f5;">
        <tr>
          <td style="padding:16px 20px;" width="50%">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;">Delivery Address</p>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#242424;">${data.customerName}</p>
            <p style="margin:0 0 2px;font-size:13px;color:#71717a;">${addressLine || 'N/A'}</p>
            ${addr.phone ? `<p style="margin:0;font-size:13px;color:#71717a;">${addr.phone}</p>` : ''}
          </td>
          <td style="padding:16px 20px;" width="50%" valign="top">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.5px;">Payment</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#242424;">${data.paymentMethod?.toUpperCase() || 'N/A'}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function trackingBlock(carrierName?: string, trackingNumber?: string): string {
  if (!carrierName && !trackingNumber) return '';
  return `<tr>
    <td style="padding:0 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:8px;border:1px solid #dbeafe;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px;">📦 Tracking Information</p>
            ${carrierName ? `<p style="margin:0 0 2px;font-size:14px;color:#242424;"><strong>Carrier:</strong> ${carrierName}</p>` : ''}
            ${trackingNumber ? `<p style="margin:0;font-size:14px;color:#242424;"><strong>Tracking #:</strong> <span style="font-family:monospace;font-weight:700;letter-spacing:0.5px;">${trackingNumber}</span></p>` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function ctaButton(label: string, url: string, bgColor: string = '#242424'): string {
  return `<tr>
    <td style="padding:8px 24px 24px;" align="center">
      <a href="${url}" style="display:inline-block;background:${bgColor};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">${label}</a>
    </td>
  </tr>`;
}

function divider(): string {
  return `<tr><td style="padding:0 24px;"><div style="height:1px;background:#f4f4f5;"></div></td></tr>`;
}

// ─── Template Generators ─────────────────────────────────────────────

export function orderConfirmationTemplate(data: OrderEmailData): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const content = [
    statusBanner('#242424', '✅', 'Order Confirmed!', `Hi ${data.customerName}, we've received your order.`),
    orderIdRow(data.shortId, dateStr),
    `<tr><td style="padding:8px 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border-radius:8px;border:1px solid #d1fae5;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0;font-size:14px;color:#065f46;font-weight:500;">🎉 Your order has been placed successfully! We'll start preparing it right away.</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    itemsTable(data.items),
    pricingSummary(data),
    divider(),
    addressBlock(data),
    ctaButton('Track Your Order', `${STORE_URL}/account/orders`, '#3f9733'),
  ].join('');

  return baseLayout(content, `Order #${data.shortId} confirmed — ${STORE_NAME}`);
}

export function orderShippedTemplate(data: OrderEmailData): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const content = [
    statusBanner('#1d4ed8', '📦', 'Your Order Has Been Shipped!', data.statusMessage || 'Your package is on its way!'),
    orderIdRow(data.shortId, dateStr),
    trackingBlock(data.carrierName, data.trackingNumber),
    `<tr><td style="padding:0 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0;font-size:14px;color:#166534;font-weight:500;">🚚 Your order is on its way! You'll receive updates as it moves through the delivery network.</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    itemsTable(data.items),
    divider(),
    addressBlock(data),
    ctaButton('Track Shipment', `${STORE_URL}/account/orders`, '#1d4ed8'),
  ].join('');

  return baseLayout(content, `Order #${data.shortId} shipped — ${STORE_NAME}`);
}

export function outForDeliveryTemplate(data: OrderEmailData): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const content = [
    statusBanner('#0d9488', '🚚', 'Out for Delivery!', 'Your order arrives today.'),
    orderIdRow(data.shortId, dateStr),
    trackingBlock(data.carrierName, data.trackingNumber),
    `<tr><td style="padding:0 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border-radius:8px;border:1px solid #99f6e4;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0;font-size:14px;color:#134e4a;font-weight:500;">📍 Our delivery partner is on the way with your package. Please ensure someone is available to receive it.</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    itemsTable(data.items),
    divider(),
    addressBlock(data),
    ctaButton('View Order Details', `${STORE_URL}/account/orders`, '#0d9488'),
  ].join('');

  return baseLayout(content, `Order #${data.shortId} is out for delivery — ${STORE_NAME}`);
}

export function orderCancelledTemplate(data: OrderEmailData): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const content = [
    statusBanner('#dc2626', '❌', 'Order Cancelled', `Hi ${data.customerName}, your order has been cancelled.`),
    orderIdRow(data.shortId, dateStr),
    `<tr><td style="padding:8px 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;border:1px solid #fecaca;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:0.5px;">Cancellation Reason</p>
            <p style="margin:0;font-size:14px;color:#7f1d1d;font-weight:500;">${data.cancellationReason || data.statusMessage || 'Order cancelled as requested.'}</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    `<tr><td style="padding:0 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0;font-size:14px;color:#92400e;font-weight:500;">💰 If you've already paid, your refund will be processed within 5-7 business days to your original payment method.</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    itemsTable(data.items),
    pricingSummary(data),
    divider(),
    ctaButton('Continue Shopping', STORE_URL, '#242424'),
  ].join('');

  return baseLayout(content, `Order #${data.shortId} cancelled — ${STORE_NAME}`);
}

export function deliveryFailedTemplate(data: OrderEmailData): string {
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  const content = [
    statusBanner('#d97706', '⚠️', 'Delivery Attempt Failed', `Hi ${data.customerName}, we couldn't deliver your order.`),
    orderIdRow(data.shortId, dateStr),
    `<tr><td style="padding:8px 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:8px;border:1px solid #fde68a;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">What Happened</p>
            <p style="margin:0;font-size:14px;color:#78350f;font-weight:500;">${data.statusMessage || 'Our delivery partner was unable to deliver your package.'}</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    `<tr><td style="padding:0 24px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border-radius:8px;border:1px solid #bae6fd;">
        <tr>
          <td style="padding:14px 20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0c4a6e;">Next Steps:</p>
            <p style="margin:0 0 4px;font-size:13px;color:#0369a1;">1. We'll attempt delivery again on the next business day.</p>
            <p style="margin:0 0 4px;font-size:13px;color:#0369a1;">2. Please ensure someone is available at the delivery address.</p>
            <p style="margin:0;font-size:13px;color:#0369a1;">3. Contact us if you need to update your address or reschedule.</p>
          </td>
        </tr>
      </table>
    </td></tr>`,
    trackingBlock(data.carrierName, data.trackingNumber),
    itemsTable(data.items),
    divider(),
    addressBlock(data),
    ctaButton('Contact Support', `mailto:${SUPPORT_EMAIL}`, '#d97706'),
  ].join('');

  return baseLayout(content, `Delivery failed for order #${data.shortId} — ${STORE_NAME}`);
}

export type { OrderEmailData };

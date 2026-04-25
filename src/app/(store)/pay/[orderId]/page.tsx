import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapToOrderProps } from '@/services/orderService';
import PaymentPageView from './PaymentPageView';

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  const { orderId } = await params;
  const shortId = orderId.split('-')[0].toUpperCase();

  return {
    title: `Pay for your order: #${shortId}`,
    description: `Securely complete payment for your order #${shortId}. Official payment link for Supplement Nepal.`,
    openGraph: {
      title: `Pay for your order: #${shortId}`,
      description: `Securely complete payment for your order #${shortId}. Official payment link for Supplement Nepal.`,
    }
  };
}

export default async function PayOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const supabase = getSupabaseAdmin() || await createClient();
  const { data, error } = await supabase
      .from('orders')
      .select(`
        id, total_amount, mrp_amount, status, payment_method, created_at,
        status_updates, carrier_name, tracking_number,
        shipping_address, contact_details,
        discount_amount, shipping_amount, discount_on_mrp, coupon_discount,
        bundle_discount, coupon_code, cod_fees, tax_amount, payment_status, amount_paid,
        payment_screenshot_url, payment_remarks,
        order_items (
          id, quantity, price, mrp, selected_size, selected_flavor,
          products (name, images, brands (name))
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

  if (error || !data) {
     return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
           <div className="bg-white rounded-[24px] p-8 text-center max-w-sm shadow-sm w-full">
               <h2 className="font-custom text-2xl text-[#d92d20] mb-2">Order Not Found</h2>
               <p className="font-titillium text-[#626262]">The link you clicked might be broken or expired.</p>
           </div>
        </div>
     );
  }
  
  const order = mapToOrderProps(data as any);
  return <PaymentPageView order={order} />;
}

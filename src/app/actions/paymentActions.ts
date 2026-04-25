'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendPaymentAcknowledgeEmail, sendPaymentAttemptEmail } from '@/services/emailService';

export async function submitOrderPaymentAction(formData: FormData) {
  // Use admin client to bypass RLS for proof upload and order update (supports guest users)
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, message: 'Server configuration error: Missing service role.' };
  }
  
  const orderId = formData.get('orderId') as string;
  const qrFile = formData.get('qrFile') as File | null;
  const qrRemarks = formData.get('qrRemarks') as string | null;

  if (!orderId) {
    return { success: false, message: 'Order ID is missing.' };
  }

  try {
    let paymentScreenshotUrl = '';

    if (qrFile && qrFile.size > 0) {
      const fileExt = qrFile.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // No need for redundant folder since bucket IS payment-proofs

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, qrFile, { upsert: true });

      if (uploadError) {
        console.error('QR Upload Error:', uploadError);
        throw new Error('Failed to upload payment screenshot.');
      }

      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(uploadData.path);

      paymentScreenshotUrl = publicUrlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'pending',
        payment_method: 'QR',
        payment_remarks: qrRemarks || 'Submitted via payment link',
        payment_attempted_at: new Date().toISOString(),
        ...(paymentScreenshotUrl ? { payment_screenshot_url: paymentScreenshotUrl } : {})
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Trigger Payment Acknowledge Email
    if (paymentScreenshotUrl) {
      // Fire and forget, or wait? User seems to want reliability.
      await sendPaymentAcknowledgeEmail(orderId, paymentScreenshotUrl);
    }

    revalidatePath(`/pay/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Payment Submission Error:', error);
    return { success: false, message: error.message || 'Failed to submit payment.' };
  }
}

export async function notifyPaymentAttemptAction(orderId: string) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { success: false };

    // Fetch current attempt time to debounce emails
    const { data: order } = await supabase
      .from('orders')
      .select('payment_attempted_at')
      .eq('id', orderId)
      .single();

    const now = new Date();
    const lastAttempt = order?.payment_attempted_at ? new Date(order.payment_attempted_at) : null;
    const cooldownMs = 15 * 60 * 1000; // 15 minutes cooldown

    // Always update the timestamp so the "ATTEMPTED" tag refreshes for the admin
    await supabase
      .from('orders')
      .update({ payment_attempted_at: now.toISOString() })
      .eq('id', orderId);

    // Only send the email if it's the first attempt or if the cooldown has passed
    if (!lastAttempt || (now.getTime() - lastAttempt.getTime()) > cooldownMs) {
      await sendPaymentAttemptEmail(orderId);
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to notify payment attempt:', err);
    return { success: false };
  }
}

'use server';

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Verifies admin role and sends bulk WhatsApp messages
 */
export async function sendBulkWhatsAppAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' };

  const title = formData.get('title') as string;
  const message = formData.get('message') as string;
  const templateName = formData.get('templateName') as string;

  const adminClient = getSupabaseAdmin();
  if (!adminClient) return { success: false, error: 'Internal server error (Admin Client).' };

  // 1. Log the campaign
  const { data: campaign, error: logError } = await adminClient
    .from('marketing_campaigns')
    .insert({
      title,
      template_name: templateName,
      status: 'sending'
    })
    .select()
    .single();

  if (logError) return { success: false, error: 'Failed to initialize campaign' };

  try {
    // 2. Fetch target users (e.g., all customers with phone numbers)
    const { data: customers } = await adminClient
      .from('profiles')
      .select('phone, full_name')
      .not('phone', 'is', null);

    if (!customers || customers.length === 0) {
      await adminClient
        .from('marketing_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaign.id);
      return { success: false, error: 'No recipients found' };
    }

    // 3. Simulate/Integrate WhatsApp API (e.g., Twilio or Meta API)
    // Here you would call your WhatsApp service
    console.log(`Sending bulk message to ${customers.length} users: ${message}`);

    // 4. Mark as sent
    await adminClient
      .from('marketing_campaigns')
      .update({
        status: 'sent',
        recipient_count: customers.length,
        sent_at: new Date().toISOString()
      })
      .eq('id', campaign.id);

    revalidatePath('/admin/analytics');
    return { success: true, count: customers.length };

  } catch (err) {
    await adminClient
      .from('marketing_campaigns')
      .update({ status: 'failed' })
      .eq('id', campaign.id);
    return { success: false, error: 'Campaign failed during execution' };
  }
}
/**
 * Fetches data for the Abandoned Carts page
 */
export async function getAbandonedCartDataAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { success: false, error: 'Forbidden' };

  try {
    const { analyticsService } = await import('@/services/analyticsService');
    const activeCarts = await analyticsService.getActiveCartAnalytics();
    const abandonedOrders = await analyticsService.getAbandonedOrdersAnalytics();

    return {
      success: true,
      data: {
        ...activeCarts,
        ...abandonedOrders
      }
    };
  } catch (error) {
    console.error('Failed to fetch abandoned cart data:', error);
    return { success: false, error: 'Failed to load data' };
  }
}

/**
 * Records an abandoned checkout session
 */
export async function recordAbandonedCheckoutAction(data: {
  user_id?: string | null;
  customer_details: any;
  items: any[];
  total_amount: number;
  session_id?: string | null;
}) {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) return { success: false, error: 'Internal server error' };

  try {
    // 1. Check for an existing unrecovered checkout for this user/session
    const identifierField = data.user_id ? 'user_id' : 'session_id';
    const identifierValue = data.user_id || data.session_id;

    if (!identifierValue) return { success: false, error: 'No identifier provided' };

    const { data: existing } = await adminClient
      .from('abandoned_checkouts')
      .select('id')
      .eq(identifierField, identifierValue)
      .eq('recovered', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // 2. Update the existing record with latest details
      const { error: updateError } = await adminClient
        .from('abandoned_checkouts')
        .update({
          customer_details: data.customer_details,
          items: data.items,
          total_amount: data.total_amount,
          abandoned_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
      return { success: true, updated: true };
    }

    // 3. Insert new record if none exists
    const { error: insertError } = await adminClient
      .from('abandoned_checkouts')
      .insert({
        user_id: data.user_id,
        customer_details: data.customer_details,
        items: data.items,
        total_amount: data.total_amount,
        session_id: data.session_id
      });

    if (insertError) throw insertError;
    return { success: true };

  } catch (error: any) {
    console.error('Failed to record abandoned checkout:', error);
    return { success: false, error: error.message || 'Unexpected error' };
  }
}

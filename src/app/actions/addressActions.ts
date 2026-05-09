'use server'

import { createClient } from '@/lib/supabase/server';
import type { UserAddress } from '@/services/addressService';

/**
 * Helper to verify if the current user is an admin.
 */
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

/**
 * Synchronizes key contact details from an address to the user's profile.
 */
async function syncProfileFromAddress(supabase: any, userId: string, address: UserAddress) {
  try {
    const fullName = `${address.first_name} ${address.last_name}`.trim();
    
    await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: address.phone,
        email: address.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Error syncing profile from address:', error);
  }
}

export async function saveUserAddressAction(address: UserAddress, targetUserId?: string): Promise<{ data: UserAddress | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'Backend session missing. Please log in again.' };
    }

    // Permission check: If targetUserId is provided, requester must be admin
    let finalUserId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return { data: null, error: 'Forbidden: Admin privileges required.' };
      finalUserId = targetUserId;
    }

    // Force strict user binding
    const payload = {
      user_id: finalUserId,
      first_name: address.first_name,
      last_name: address.last_name,
      city: address.city,
      pincode: address.pincode,
      street: address.street,
      area: address.area,
      address_line_1: address.address_line_1,
      email: address.email,
      phone: address.phone,
      latitude: address.latitude,
      longitude: address.longitude,
      type: address.type,
    };

    let query;
    if (address.id) {
      query = supabase.from('user_addresses').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', address.id).select().single();
    } else {
      query = supabase.from('user_addresses').insert([payload]).select().single();
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: `${error.message} - ${error.details || ''}` };
    }

    // AUTOMATIC SYNC: Update profile with these contact details
    await syncProfileFromAddress(supabase, finalUserId, address);
    
    return { data: data as UserAddress, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unknown Server Error' };
  }
}

export async function fetchUserAddressesAction(targetUserId?: string): Promise<{ data: UserAddress[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: [], error: 'Backend session missing. Please log in again.' };
    }

    // Permission check
    let finalUserId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return { data: [], error: 'Forbidden: Admin privileges required.' };
      finalUserId = targetUserId;
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data as UserAddress[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Unknown Server Error' };
  }
}

export async function deleteUserAddressAction(addressId: string, targetUserId?: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Backend session missing.' };
    }

    // Permission check
    let finalUserId = user.id;
    if (targetUserId && targetUserId !== user.id) {
      const isAdmin = await verifyAdmin();
      if (!isAdmin) return { success: false, error: 'Forbidden: Admin privileges required.' };
      finalUserId = targetUserId;
    }

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', finalUserId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown Server Error' };
  }
}

/**
 * Ensures that a profile entry exists for the currently logged-in user.
 * This can be called after login or on app initialization.
 */
export async function ensureUserProfileExistsAction(): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) return { success: false, message: 'No active session' };

    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Create profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          role: 'user'
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error: any) {
    console.error('ensureUserProfileExistsAction Error:', error);
    return { success: false, message: error.message };
  }
}

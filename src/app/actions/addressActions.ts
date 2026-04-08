'use server'

import { createClient } from '@/lib/supabase/server';
import type { UserAddress } from '@/services/addressService';

export async function saveUserAddressAction(address: UserAddress): Promise<{ data: UserAddress | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: null, error: 'Backend session missing. Please log in again.' };
    }

    // Force strict user binding to exactly the authorized backend session user
    const payload = {
      user_id: user.id,
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
    
    return { data: data as UserAddress, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unknown Server Error' };
  }
}

export async function fetchUserAddressesAction(): Promise<{ data: UserAddress[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { data: [], error: 'Backend session missing. Please log in again.' };
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data as UserAddress[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || 'Unknown Server Error' };
  }
}

export async function deleteUserAddressAction(addressId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Backend session missing.' };
    }

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown Server Error' };
  }
}

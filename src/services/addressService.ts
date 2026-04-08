import { supabase } from '@/lib/supabase/client';

export interface UserAddress {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  city: string;
  pincode: string;
  street: string;
  area?: string;
  address_line_1: string;
  email: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  type: 'Home' | 'Work' | 'Other';
  created_at?: string;
}

export async function fetchUserAddresses(userId: string): Promise<UserAddress[]> {
  const { data, error } = await supabase
    .from('user_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
  return data as UserAddress[];
}

export async function saveUserAddress(address: UserAddress): Promise<{ data: UserAddress | null; error: string | null }> {
  // Extract only needed fields
  const payload = {
    user_id: address.user_id,
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
    // Update
    query = supabase.from('user_addresses').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', address.id).select().single();
  } else {
    // Insert
    query = supabase.from('user_addresses').insert([payload]).select().single();
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error saving address details:', error);
    return { data: null, error: error.message };
  }
  return { data: data as UserAddress, error: null };
}

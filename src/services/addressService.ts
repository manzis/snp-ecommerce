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
  alt_phone?: string;
  delivery_notes?: string;
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
  // Extract fields including alt_phone and delivery_notes
  const payload: any = {
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
    alt_phone: address.alt_phone || null,
    delivery_notes: address.delivery_notes || null,
    latitude: address.latitude,
    longitude: address.longitude,
    type: address.type,
  };

  const executeSave = async (dataPayload: any) => {
    if (address.id) {
      return await supabase
        .from('user_addresses')
        .update({ ...dataPayload, updated_at: new Date().toISOString() })
        .eq('id', address.id)
        .select()
        .single();
    } else {
      return await supabase
        .from('user_addresses')
        .insert([dataPayload])
        .select()
        .single();
    }
  };

  let { data, error } = await executeSave(payload);

  // If table does not yet have alt_phone or delivery_notes columns, fallback gracefully without failing
  if (error && (error.code === '42703' || error.message?.includes('alt_phone') || error.message?.includes('delivery_notes'))) {
    const fallbackPayload = { ...payload };
    delete fallbackPayload.alt_phone;
    delete fallbackPayload.delivery_notes;
    const retry = await executeSave(fallbackPayload);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error saving address details:', error);
    return { data: null, error: error.message };
  }

  // Preserve alt_phone and delivery_notes on returned object even if stored in JSON metadata
  const returnData: UserAddress = {
    ...(data as UserAddress),
    alt_phone: address.alt_phone || (data as any)?.alt_phone,
    delivery_notes: address.delivery_notes || (data as any)?.delivery_notes,
  };

  return { data: returnData, error: null };
}

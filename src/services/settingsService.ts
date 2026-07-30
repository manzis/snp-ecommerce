import { supabase } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface SiteSettings {
  hero_images?: {
    desktopUrl: string;
    mobileUrl: string;
  };
}

/**
 * Fetch a specific setting by key
 */
export async function getSiteSetting(key: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // not found error
      console.error(`[settingsService] Error fetching setting ${key}:`, error);
    }
    return null;
  }

  return data?.value || null;
}

/**
 * Upsert a setting by key
 */
export async function updateSiteSetting(key: string, value: any): Promise<boolean> {
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    console.error('[settingsService] Admin client could not be initialized.');
    return false;
  }

  const { error } = await adminClient
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) {
    console.error(`[settingsService] Error updating setting ${key}:`, error);
    return false;
  }

  return true;
}

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidateTag } from 'next/cache';

export interface SiteSettings {
  hero_images?: {
    desktopUrl: string;
    mobileUrl: string;
  };
}

/**
 * Fetch a specific setting by key (Cached)
 */
export const getSiteSetting = cache(async (key: string) => {
  return unstable_cache(
    async (settingKey: string) => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', settingKey)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // not found error
          console.error(`[settingsService] Error fetching setting ${settingKey}:`, error);
        }
        return null;
      }

      return data?.value || null;
    },
    ['site-setting', key],
    { revalidate: 31536000, tags: ['settings', `setting-${key}`] }
  )(key);
});

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

  // Clear Next.js cache so changes reflect immediately
  // @ts-expect-error - Next.js 16 canary changed revalidateTag signature
  revalidateTag('settings');
  // @ts-expect-error
  revalidateTag(`setting-${key}`);

  return true;
}

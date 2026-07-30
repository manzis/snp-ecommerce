'use server';

import { getSiteSetting, updateSiteSetting } from '@/services/settingsService';
import { revalidatePath } from 'next/cache';
import { uploadToCloudinary } from '@/services/cloudinary';
import { Buffer } from 'buffer';

export async function getHeroImagesAction() {
  try {
    const data = await getSiteSetting('hero_images');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateHeroImagesAction(formData: FormData) {
  try {
    const desktopImage = formData.get('desktopImage') as File | null;
    const mobileImage = formData.get('mobileImage') as File | null;
    
    // We will keep existing URLs if new ones are not provided, so let's fetch current
    const current = await getSiteSetting('hero_images') || { desktopUrl: '', mobileUrl: '' };
    
    let desktopUrl = current.desktopUrl;
    let mobileUrl = current.mobileUrl;

    if (desktopImage && desktopImage.size > 0) {
      const buffer = Buffer.from(await desktopImage.arrayBuffer());
      const res = await uploadToCloudinary(buffer, desktopImage.name, 'snp-store/hero');
      desktopUrl = res.secure_url;
    }

    if (mobileImage && mobileImage.size > 0) {
      const buffer = Buffer.from(await mobileImage.arrayBuffer());
      const res = await uploadToCloudinary(buffer, mobileImage.name, 'snp-store/hero');
      mobileUrl = res.secure_url;
    }

    const value = { desktopUrl, mobileUrl };
    console.log('[settingsActions] Updating site_settings with:', value);
    const success = await updateSiteSetting('hero_images', value);

    if (success) {
      revalidatePath('/'); // Revalidate storefront homepage
      revalidatePath('/admin/layouts');
      return { success: true, data: value, message: 'Hero images updated successfully.' };
    }
    
    console.error('[settingsActions] updateSiteSetting returned false');
    return { success: false, message: 'Failed to update database.' };
  } catch (error: any) {
    console.error('[settingsActions] Update hero images error:', error);
    return { success: false, message: error.message };
  }
}

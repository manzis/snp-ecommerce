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

export async function getWhyChooseUsBannerAction() {
  try {
    const data = await getSiteSetting('why_choose_us_banner');
    return { success: true, data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateWhyChooseUsBannerAction(formData: FormData) {
  try {
    const bannerImage = formData.get('bannerImage') as File | null;
    
    // We will keep existing URLs if new ones are not provided, so let's fetch current
    const current = await getSiteSetting('why_choose_us_banner') || { imageUrl: '' };
    
    let imageUrl = current.imageUrl;

    if (bannerImage && bannerImage.size > 0) {
      const buffer = Buffer.from(await bannerImage.arrayBuffer());
      const res = await uploadToCloudinary(buffer, bannerImage.name, 'snp-store/banners');
      imageUrl = res.secure_url;
    }

    const value = { imageUrl };
    console.log('[settingsActions] Updating site_settings with:', value);
    const success = await updateSiteSetting('why_choose_us_banner', value);

    if (success) {
      // Revalidate all product pages so they fetch the new banner
      revalidatePath('/product/[slug]', 'page'); 
      revalidatePath('/admin/layouts');
      return { success: true, data: value, message: 'Why Choose Us banner updated successfully.' };
    }
    
    console.error('[settingsActions] updateSiteSetting returned false for why_choose_us_banner');
    return { success: false, message: 'Failed to update database.' };
  } catch (error: any) {
    console.error('[settingsActions] Update why choose us banner error:', error);
    return { success: false, message: error.message };
  }
}

// ==========================================
// STORE SETTINGS ACTIONS
// ==========================================

const DEFAULT_STORE_SETTINGS = {
  is_live: true,
  maintenance_message: "The store is currently not available!",
  mail_notifications: true,
  orders_disabled: false,
  payment_methods: {
    cod: true,
    esewa: false,
    khalti: false,
    fonepay: false,
    bank_transfer: false,
  },
  business_details: {
    email: "support@brightsupplements.store",
    phone: "",
    opening_hours: "Mon - Sun: 9AM to 6PM",
    address: "Kathmandu, Nepal",
    facebook: "",
    instagram: "",
    whatsapp: "",
  },
  shipping: {
    standard_cost: 100,
    free_threshold: 5000,
  },
};

export async function getStoreSettingsAction() {
  try {
    const data = await getSiteSetting('store_settings');
    // Merge with defaults so we always have a complete object
    const merged = { ...DEFAULT_STORE_SETTINGS, ...(data || {}) };
    return { success: true, data: merged };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateStoreSettingsAction(newSettings: any) {
  try {
    const current = await getSiteSetting('store_settings') || {};
    const merged = { ...DEFAULT_STORE_SETTINGS, ...current, ...newSettings };
    
    console.log('[settingsActions] Updating store_settings with:', merged);
    const success = await updateSiteSetting('store_settings', merged);

    if (success) {
      revalidatePath('/', 'layout'); // Revalidate root layout for maintenance mode
      revalidatePath('/admin/settings');
      return { success: true, data: merged, message: 'Store settings updated successfully.' };
    }
    
    return { success: false, message: 'Failed to update store settings.' };
  } catch (error: any) {
    console.error('[settingsActions] Update store settings error:', error);
    return { success: false, message: error.message };
  }
}

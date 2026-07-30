'use client';

import React, { useState, useEffect } from 'react';
import { getWhyChooseUsBannerAction, updateWhyChooseUsBannerAction } from '@/app/actions/settingsActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

export default function WhyChooseUsSetup() {
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showAdminToast } = useAdminToast();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getWhyChooseUsBannerAction();
        if (res.success && res.data) {
          setBannerPreview(res.data.imageUrl);
        }
      } catch (e) {
        console.error('Failed to load Why Choose Us banner:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (bannerImage) formData.append('bannerImage', bannerImage);

      if (!bannerImage) {
        showAdminToast('Please select an image to upload.', 'error');
        alert('Please select an image to upload.');
        setIsSaving(false);
        return;
      }

      const res = await updateWhyChooseUsBannerAction(formData);
      if (res.success) {
        showAdminToast('Banner image saved successfully!', 'success');
        if (res.data) {
          setBannerPreview(res.data.imageUrl);
          setBannerImage(null);
        }
      } else {
        const errorMsg = `Error saving image: ${res.message}`;
        showAdminToast(errorMsg, 'error');
        alert(errorMsg);
      }
    } catch (e: any) {
      const errorMsg = `Network or Server Error: ${e.message}`;
      showAdminToast(errorMsg, 'error');
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-[200px] bg-gray-50 animate-pulse rounded-[24px]"></div>;
  }

  return (
    <section className="flex flex-col gap-[24px] bg-white p-[24px] rounded-[16px] border border-gray-100 shadow-sm">
      <div className="flex flex-col gap-[8px]">
        <h2 className="text-[20px] font-medium text-[#242424] tracking-tight">Why Choose Us Banner Setup</h2>
        <p className="text-[14px] text-[#71717a]">Upload the banner image for the "Why Choose Us" section on the product page. Max size: 5MB.</p>
      </div>

      <div className="flex flex-col gap-4 max-w-[800px]">
        <label className="text-[14px] font-medium text-gray-700">Banner Image (e.g. 1080x1080)</label>
        <div className="relative w-full aspect-square max-w-[400px] bg-gray-100 rounded-[12px] border-2 border-dashed border-gray-200 overflow-hidden group flex items-center justify-center">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Why Choose Us Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 text-sm">No Image (Fallback will be used)</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100">
              Change Banner Image
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-start mt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving || !bannerImage}
          className="bg-[#242424] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-black/10 active:scale-95"
        >
          {isSaving ? 'Uploading to Cloudinary...' : 'Save Banner Image Now'}
        </button>
      </div>
    </section>
  );
}

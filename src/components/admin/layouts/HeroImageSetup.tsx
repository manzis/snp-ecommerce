'use client';

import React, { useState, useEffect } from 'react';
import { getHeroImagesAction, updateHeroImagesAction } from '@/app/actions/settingsActions';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';
import Image from 'next/image';

export default function HeroImageSetup() {
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showAdminToast } = useAdminToast();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getHeroImagesAction();
        if (res.success && res.data) {
          setDesktopPreview(res.data.desktopUrl);
          setMobilePreview(res.data.mobileUrl);
        }
      } catch (e) {
        console.error('Failed to load hero images:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDesktopImage(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMobileImage(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (desktopImage) formData.append('desktopImage', desktopImage);
      if (mobileImage) formData.append('mobileImage', mobileImage);

      if (!desktopImage && !mobileImage) {
        showAdminToast('Please select at least one image to upload.', 'error');
        alert('Please select at least one image to upload.');
        setIsSaving(false);
        return;
      }

      const res = await updateHeroImagesAction(formData);
      if (res.success) {
        showAdminToast('Hero images saved successfully!', 'success');
        // Update previews to remote URLs
        if (res.data) {
          setDesktopPreview(res.data.desktopUrl);
          setMobilePreview(res.data.mobileUrl);
          setDesktopImage(null);
          setMobileImage(null);
        }
      } else {
        const errorMsg = `Error saving images: ${res.message}`;
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
        <h2 className="text-[20px] font-medium text-[#242424] tracking-tight">Hero Image Setup</h2>
        <p className="text-[14px] text-[#71717a]">Upload the main hero images for the storefront homepage. Max size: 5MB per image.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        {/* Desktop Image */}
        <div className="flex flex-col gap-4">
          <label className="text-[14px] font-medium text-gray-700">Desktop Hero (e.g. 1920x1080)</label>
          <div className="relative w-full aspect-video bg-gray-100 rounded-[12px] border-2 border-dashed border-gray-200 overflow-hidden group flex items-center justify-center">
            {desktopPreview ? (
              <img src={desktopPreview} alt="Desktop Hero" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100">
                Change Desktop Image
                <input type="file" accept="image/*" className="hidden" onChange={handleDesktopChange} />
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Image */}
        <div className="flex flex-col gap-4">
          <label className="text-[14px] font-medium text-gray-700">Mobile Hero (e.g. 800x1200)</label>
          <div className="relative w-[60%] mx-auto aspect-[3/4] bg-gray-100 rounded-[12px] border-2 border-dashed border-gray-200 overflow-hidden group flex items-center justify-center">
             {mobilePreview ? (
              <img src={mobilePreview} alt="Mobile Hero" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 text-center">
                Change <br/> Mobile Image
                <input type="file" accept="image/*" className="hidden" onChange={handleMobileChange} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving || (!desktopImage && !mobileImage)}
          className="bg-[#242424] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-black/10 active:scale-95"
        >
          {isSaving ? 'Uploading to Cloudinary...' : 'Save Hero Images Now'}
        </button>
      </div>
    </section>
  );
}

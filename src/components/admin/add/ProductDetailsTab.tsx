import React from 'react';
import RichTextEditor from '@/components/admin/products/RichTextEditor';
import ImageUpload from '@/components/admin/products/ImageUpload';
import { ErrorText } from './shared';

import VideoUpload from '@/components/admin/products/VideoUpload';
import MultiImageUpload from '@/components/admin/products/MultiImageUpload';

export default function ProductDetailsTab({ formData, setFormData, showErrors, errors, banners }: any) {
    const updateInfo = (field: string, value: any) => {
        setFormData({
            ...formData,
            product_info: { ...formData.product_info, [field]: value }
        });
    };

    const videoItem = formData.highlights?.find((h: any) => h.type === 'video');
    const imageItems = formData.highlights?.filter((h: any) => h.type === 'image') || [];
    const imageUrls = imageItems.map((h: any) => h.src);

    const handleImagesChange = (newUrls: string[]) => {
        const currentVideo = formData.highlights?.find((h: any) => h.type === 'video');
        const newItems = newUrls.map(url => ({ type: 'image', src: url, alt: 'Highlight' }));
        const finalHighlights = currentVideo ? [currentVideo, ...newItems] : newItems;
        setFormData({ ...formData, highlights: finalHighlights });
    };

    const handleVideoChange = (url: string) => {
        const imagesOnly = formData.highlights?.filter((h: any) => h.type === 'image') || [];
        if (!url || url.trim() === '') {
             setFormData({ ...formData, highlights: imagesOnly });
             return;
        }
        const newVideo = { type: 'video', src: url, alt: 'Highlight Video' };
        setFormData({ ...formData, highlights: [newVideo, ...imagesOnly] });
    };

    return (
        <div className="space-y-10">
            <div className={`flex flex-col gap-3 p-1 rounded-2xl transition-all ${showErrors && (!formData.product_info.description?.trim() || formData.product_info.description === '<p></p>') ? 'bg-red-50/20 ring-1 ring-red-100' : ''}`}>
                <label 
                    data-error={showErrors && (!formData.product_info.description?.trim() || formData.product_info.description === '<p></p>') ? "true" : "false"}
                    className="text-[12.5px] font-regular text-[#242424] flex items-center justify-between"
                >
                    <span>Product Description <span className="text-red-500">*</span></span>
                    {showErrors && (!formData.product_info.description?.trim() || formData.product_info.description === '<p></p>') && (
                        <span className="text-red-500 text-[11px]">Explanation is required</span>
                    )}
                </label>
                <RichTextEditor
                    value={formData.product_info.description}
                    onChange={(html) => updateInfo('description', html)}
                    placeholder="Enter full product description here..."
                />
                {showErrors && (!formData.product_info.description?.trim() || formData.product_info.description === '<p></p>') && (
                    <ErrorText>Please provide a detailed description for the product.</ErrorText>
                )}
            </div>

            <div className="flex flex-col gap-8 pb-4 border-b border-gray-100">
                <label className="text-[14px] font-semibold text-[#242424] -mb-4">Internal Media & Information</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-4">
                        <ImageUpload
                            label="Ingredients & Nutrition Image"
                            value={formData.product_info.ingredients_image}
                            onChange={(url) => updateInfo('ingredients_image', url)}
                            path={`products/${formData.slug || 'new-product'}/info`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8 pb-4 border-b border-gray-100">
                <label className="text-[14px] font-semibold text-[#242424]">Product Highlights (Media Showcase)</label>
                
                {/* Highlights Video Upload/Sync */}
                <div className="flex flex-col gap-4 max-w-[600px]">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[12.5px] font-medium text-[#242424]">Highlight Video (Optional)</label>
                        <p className="text-[11px] text-[#A1A1AA] font-regular leading-snug">
                            Upload a direct MP4. This video will play as the very first slide in the product highlights section.
                        </p>
                    </div>
                    <VideoUpload
                        value={videoItem?.src || ''}
                        onChange={handleVideoChange}
                        path={`products/${formData.slug || 'new-product'}/highlights/video`}
                    />
                </div>

                {/* Highlights Images - Max 3 */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-2 mb-2">
                        <label className="text-[12.5px] font-medium text-[#242424]">Highlight Images (Up to 3)</label>
                        <p className="text-[11px] text-[#A1A1AA] font-regular">
                            These will be displayed in the slider alongside the video. Drag to reorder.
                        </p>
                    </div>
                    <MultiImageUpload
                        images={imageUrls}
                        onChange={handleImagesChange}
                        path={`products/${formData.slug || 'new-product'}/highlights`}
                        maxImages={3}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-8 pb-4 border-b border-gray-100">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-[#242424]">Contextual Page Banners (New System)</label>
                    <p className="text-[11px] text-[#A1A1AA] font-regular leading-snug">
                        Select banners created in the Layouts section to display on this product page. 1080x1080 squares.
                    </p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {banners?.filter((b: any) => b.display_type === 'product').map((banner: any) => {
                        const isSelected = formData.linked_banner_ids?.includes(banner.id);
                        return (
                            <div 
                                key={banner.id}
                                onClick={() => {
                                    const currentIds = formData.linked_banner_ids || [];
                                    if (isSelected) {
                                        setFormData({ ...formData, linked_banner_ids: currentIds.filter((id: string) => id !== banner.id) });
                                    } else {
                                        setFormData({ ...formData, linked_banner_ids: [...currentIds, banner.id] });
                                    }
                                }}
                                className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-zinc-800 scale-[0.98]' : 'border-gray-100 hover:border-gray-200'}`}
                            >
                                <img 
                                    src={banner.image_url} 
                                    alt="banner" 
                                    className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${isSelected ? 'opacity-100' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100'}`} 
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                        <div className="bg-zinc-800 text-white p-1 rounded-full">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-8 pb-4 border-b border-gray-100">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[14px] font-semibold text-[#242424]">Legacy Product Page Banners</label>
                    <p className="text-[11px] text-[#A1A1AA] font-regular leading-snug">
                        Manual uploads for direct product-specific banners.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload
                        label="Banner 1"
                        value={formData.banner_image1}
                        onChange={(url) => setFormData({ ...formData, banner_image1: url })}
                        path={`products/${formData.slug || 'new-product'}/banners`}
                    />
                    <ImageUpload
                        label="Banner 2"
                        value={formData.banner_image2}
                        onChange={(url) => setFormData({ ...formData, banner_image2: url })}
                        path={`products/${formData.slug || 'new-product'}/banners`}
                    />
                    <ImageUpload
                        label="Banner 3"
                        value={formData.banner_image3}
                        onChange={(url) => setFormData({ ...formData, banner_image3: url })}
                        path={`products/${formData.slug || 'new-product'}/banners`}
                    />
                    <ImageUpload
                        label="Banner 4"
                        value={formData.banner_image4}
                        onChange={(url) => setFormData({ ...formData, banner_image4: url })}
                        path={`products/${formData.slug || 'new-product'}/banners`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-regular text-[#242424]">Product Rating (0.0 - 5.0)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating || 0}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] focus:border-black outline-none transition-all font-medium"
                        placeholder="e.g. 4.5"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-regular text-[#242424]">Manufacture Info (JSON)</label>
                    <textarea
                        rows={1}
                        onChange={(e) => {
                            try {
                                if (e.target.value.trim() === '') {
                                    updateInfo('manufacture_info', {});
                                } else {
                                    updateInfo('manufacture_info', JSON.parse(e.target.value));
                                }
                            } catch { }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-mono placeholder:text-zinc-400 placeholder:font-regular focus:border-black outline-none transition-all"
                        placeholder='{"country": "India", "licence": "..."}'
                    />
                </div>
            </div>
        </div>
    );
}

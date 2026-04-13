import React from 'react';
import RichTextEditor from '@/components/admin/products/RichTextEditor';
import ImageUpload from '@/components/admin/products/ImageUpload';
import { ErrorText } from './shared';

import VideoUpload from '@/components/admin/products/VideoUpload';
import MultiImageUpload from '@/components/admin/products/MultiImageUpload';

export default function ProductDetailsTab({ formData, setFormData, showErrors, errors }: any) {
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

            <div className="flex flex-col gap-2">
                <label className="text-[12.5px] font-regular text-[#242424]">Manufacture Info (JSON)</label>
                <textarea
                    rows={3}
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
    );
}

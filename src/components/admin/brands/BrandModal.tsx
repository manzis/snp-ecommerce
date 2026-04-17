'use client';

import React, { useState, useEffect } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Brand } from '@/services/productService';
import ImageUpload from '@/components/admin/products/ImageUpload';

interface BrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Brand>) => Promise<void>;
    brand?: Brand | null;
    isSaving?: boolean;
}

export default function BrandModal({
    isOpen,
    onClose,
    onSave,
    brand,
    isSaving
}: BrandModalProps) {
    const [formData, setFormData] = useState<Partial<Brand>>({
        name: '',
        slug: '',
        image_url: '',
        cover_image: '',
        rating: 0,
        total_purchases: 0,
        description: ''
    });
    const [isManualSlug, setIsManualSlug] = useState(false);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')     // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    };

    useEffect(() => {
        if (brand) {
            setFormData({
                name: brand.name,
                slug: brand.slug,
                image_url: brand.image_url,
                cover_image: brand.cover_image,
                rating: brand.rating || 0,
                total_purchases: brand.total_purchases || 0,
                description: brand.description || ''
            });
            setIsManualSlug(true);
        } else {
            setFormData({
                name: '',
                slug: '',
                image_url: '',
                cover_image: '',
                rating: 0,
                total_purchases: 0,
                description: ''
            });
            setIsManualSlug(false);
        }
    }, [brand, isOpen]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isManualSlug && !brand && formData.name) {
            setFormData(prev => ({ ...prev, slug: slugify(formData.name!) }));
        }
    }, [formData.name, isManualSlug, brand]);

    const handleSave = async () => {
        await onSave(brand?.id || null, formData);
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, slug: val });
        setIsManualSlug(val !== '');
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={brand ? 'Edit Brand' : 'Create Brand'}
            description={brand ? `Editing details for ${brand.name}` : 'Provide details for the new brand.'}
            footerActions={
                <>
                    <button
                        onClick={onClose}
                        className="flex-1 md:flex-none md:px-8 py-4 md:py-3 text-[14px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 md:bg-transparent rounded-2xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !formData.name}
                        className="flex-[2] md:flex-none md:px-12 py-4 md:py-3 bg-[#242424] text-white rounded-2xl text-[14px] font-medium hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {brand ? 'Save Changes' : 'Create Brand'}
                    </button>
                </>
            }
        >
            <div className="space-y-8">
                {/* Brand Imagery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-[13px] font-regular text-[#242424]">Brand Logo</label>
                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            path="brands"
                            label=""
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-[13px] font-regular text-[#242424]">Cover Image</label>
                        <ImageUpload
                            value={formData.cover_image}
                            onChange={(url) => setFormData({ ...formData, cover_image: url })}
                            path="brands/covers"
                            label=""
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Brand Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter brand name"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={handleSlugChange}
                            placeholder="auto-generated-slug"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none font-mono text-[13px]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Rating</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={isNaN(formData.rating as number) ? '' : formData.rating}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setFormData({ ...formData, rating: isNaN(val) ? 0 : val });
                            }}
                            placeholder="4.5"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Total Purchases</label>
                        <input
                            type="number"
                            min="0"
                            value={isNaN(formData.total_purchases as number) ? '' : formData.total_purchases}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setFormData({ ...formData, total_purchases: isNaN(val) ? 0 : val });
                            }}
                            placeholder="1500"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-regular text-[#71717a]">Description</label>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the brand..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                    />
                </div>
            </div>
        </AdminModal>
    );
}

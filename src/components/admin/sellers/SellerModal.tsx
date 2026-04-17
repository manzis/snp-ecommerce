'use client';

import React, { useState, useEffect } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Seller } from '@/services/productService';
import ImageUpload from '@/components/admin/products/ImageUpload';

interface SellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Seller>) => Promise<void>;
    seller?: Seller | null;
    isSaving?: boolean;
}

export default function SellerModal({
    isOpen,
    onClose,
    onSave,
    seller,
    isSaving
}: SellerModalProps) {
    const [formData, setFormData] = useState<Partial<Seller>>({
        name: '',
        slug: '',
        image_url: '',
        rating: 0,
        is_verified: false,
        details: ''
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
        if (seller) {
            setFormData({
                name: seller.name,
                slug: seller.slug,
                image_url: seller.image_url,
                rating: seller.rating || 0,
                is_verified: seller.is_verified || false,
                details: seller.details || ''
            });
            setIsManualSlug(true);
        } else {
            setFormData({
                name: '',
                slug: '',
                image_url: '',
                rating: 0,
                is_verified: false,
                details: ''
            });
            setIsManualSlug(false);
        }
    }, [seller, isOpen]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isManualSlug && !seller && formData.name) {
            setFormData(prev => ({ ...prev, slug: slugify(formData.name!) }));
        }
    }, [formData.name, isManualSlug, seller]);

    const handleSave = async () => {
        await onSave(seller?.id || null, formData);
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
            title={seller ? 'Edit Seller' : 'Create Seller'}
            description={seller ? `Editing details for ${seller.name}` : 'Provide details for the new seller.'}
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
                        {seller ? 'Save Changes' : 'Create Seller'}
                    </button>
                </>
            }
        >
            <div className="space-y-8">
                {/* Seller Logo Upload */}
                <div className="flex flex-col gap-3">
                    <label className="text-[13px] font-regular text-[#242424]">Seller Logo</label>
                    <ImageUpload
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        path="sellers"
                        label=""
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Seller Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter seller name"
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
                    <div className="flex flex-col gap-4">
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
                        <div className="flex items-center justify-between p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[13px] font-medium text-[#242424]">Verified Seller</span>
                                <span className="text-[11px] text-[#71717a]">Display blue checkmark</span>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, is_verified: !formData.is_verified })}
                                className={`w-11 h-6 rounded-full transition-all duration-200 relative ${formData.is_verified ? 'bg-[#242424]' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${formData.is_verified ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Details / Description</label>
                        <textarea
                            rows={4}
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            placeholder="Add seller introduction..."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                        />
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}

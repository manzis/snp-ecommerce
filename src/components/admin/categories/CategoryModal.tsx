'use client';

import React, { useState, useEffect } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Category } from '@/services/productService';
import ImageUpload from '@/components/admin/products/ImageUpload';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Category>) => Promise<void>;
    category?: Category | null;
    isSaving?: boolean;
}

export default function CategoryModal({
    isOpen,
    onClose,
    onSave,
    category,
    isSaving
}: CategoryModalProps) {
    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        slug: '',
        image_url: '',
        is_other_category: false
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
        if (category) {
            setFormData({
                name: category.name,
                slug: category.slug,
                image_url: category.image_url,
                description: category.description || '',
                benefits: category.benefits || '',
                is_other_category: category.is_other_category || false
            });
            setIsManualSlug(true);
        } else {
            setFormData({
                name: '',
                slug: '',
                image_url: '',
                description: '',
                benefits: '',
                is_other_category: false
            });
            setIsManualSlug(false);
        }
    }, [category, isOpen]);

    // Auto-generate slug from name
    useEffect(() => {
        if (!isManualSlug && !category && formData.name) {
            setFormData(prev => ({ ...prev, slug: slugify(formData.name!) }));
        }
    }, [formData.name, isManualSlug, category]);

    const handleSave = async () => {
        await onSave(category?.id || null, formData);
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
            title={category ? 'Edit Category' : 'Create Category'}
            description={category ? `Editing details for ${category.name}` : 'Provide details for the new category.'}
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
                        {category ? 'Save Changes' : 'Create Category'}
                    </button>
                </>
            }
        >
            <div className="space-y-8">
                {/* Category Image Upload */}
                <div className="flex flex-col gap-3">
                    <label className="text-[13px] font-regular text-[#242424]">Category Image</label>
                    <ImageUpload
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        path="categories"
                        label=""
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter category name"
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

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <input
                        type="checkbox"
                        id="is_other_category"
                        checked={formData.is_other_category || false}
                        onChange={(e) => setFormData({ ...formData, is_other_category: e.target.checked })}
                        className="w-5 h-5 rounded outline-none border-gray-300 text-[#242424] focus:ring-[#242424]"
                    />
                    <div className="flex flex-col">
                        <label htmlFor="is_other_category" className="text-[14px] font-medium text-[#242424] cursor-pointer">
                            Is Other Category?
                        </label>
                        <span className="text-[12px] text-[#71717a]">
                            Select this if it's a secondary category (e.g. Needs, Goals) instead of a primary supplement.
                        </span>
                    </div>
                </div>

                {/* Description & Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what this category includes..."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Benefits</label>
                        <textarea
                            rows={3}
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            placeholder="Enter benefits (e.g., Free consultation, 24/7 support)..."
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                        />
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}

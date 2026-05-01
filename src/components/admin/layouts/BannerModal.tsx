import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Banner } from '@/services/bannerService';
import { Product, fetchBasicProducts } from '@/services/productService';
import ImageUpload from '@/components/admin/products/ImageUpload';
import SearchIcon from '@/components/icons/SearchIcon';

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Banner>) => Promise<void>;
    banner?: Banner | null;
    isSaving?: boolean;
}

export default function BannerModal({
    isOpen,
    onClose,
    onSave,
    banner,
    isSaving
}: BannerModalProps) {
    const [formData, setFormData] = useState<Partial<Banner>>({
        image_url: '',
        target_product_id: null,
        is_active: true,
        is_published: true,
        display_type: 'home'
    });

    const [products, setProducts] = useState<Partial<Product>[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (banner) {
            setFormData({
                image_url: banner.image_url,
                target_product_id: banner.target_product_id,
                is_active: banner.is_active,
                is_published: banner.is_published,
                display_type: banner.display_type || 'home'
            });
            // Try to find the product name if it's already there
            if (banner.product?.name) {
                setSearchQuery(banner.product.title || banner.product.name);
            }
        } else {
            setFormData({
                image_url: '',
                target_product_id: null,
                is_active: true,
                is_published: true,
                display_type: 'home'
            });
            setSearchQuery('');
        }
    }, [banner, isOpen]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true);
                const results = await fetchBasicProducts({ search: searchQuery });
                setProducts(results);
                setIsSearching(false);
            } else if (searchQuery.length === 0) {
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSave = async () => {
        await onSave(banner?.id || null, formData);
    };

    const handleSelectProduct = (product: Partial<Product>) => {
        if (!product.id) return;
        setFormData({ ...formData, target_product_id: product.id });
        setSearchQuery(product.title || product.name || '');
        setProducts([]); // Clear results
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={banner ? 'Edit Banner' : 'Create New Banner'}
            description={banner ? 'Update the banner image, placement or link.' : 'Create promotional banners for your store. Home banners show on the main page, while Product banners can be linked to specific items.'}
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
                        disabled={isSaving || !formData.image_url}
                        className="flex-[2] md:flex-none md:px-12 py-4 md:py-3 bg-[#242424] text-white rounded-2xl text-[14px] font-medium hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {banner ? 'Save Changes' : 'Create Banner'}
                    </button>
                </>
            }
        >
            <div className="space-y-8">
                {/* Banner Image Upload */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <label className="text-[13.5px] font-medium text-[#242424]">Banner Image (1080x1080)</label>
                        <span className="text-[11px] text-zinc-400 uppercase tracking-wider">Required</span>
                    </div>
                    <ImageUpload
                        value={formData.image_url}
                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                        path="banners"
                        label="Upload Banner"
                        className="aspect-square max-w-[280px] mx-auto rounded-[24px]"
                    />
                </div>

                {/* Product Search & Link */}
                <div className="flex flex-col gap-3">
                    <label className="text-[14px] font-medium text-[#242424]">Redirect to Product</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                            <SearchIcon className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products by name..."
                            className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {(products.length > 0 || isSearching) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] max-h-[300px] overflow-y-auto overflow-x-hidden p-2 custom-scrollbar"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center">
                                            <div className="w-5 h-5 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : (
                                        products.map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product)}
                                                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                                            >
                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 relative shrink-0">
                                                    <Image src={product.images?.[0] || '/images/product-placeholder.png'} alt={product.name || ''} fill className="object-cover" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[13px] font-medium text-[#242424] truncate">{product.title || product.name}</span>
                                                    <span className="text-[11px] text-[#71717a] font-mono">{product.slug}</span>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {!formData.target_product_id && searchQuery.length > 0 && products.length === 0 && !isSearching && (
                        <p className="text-[12px] text-red-500 ml-1">Please select a product from the list.</p>
                    )}
                </div>

                {/* Visibility Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                        onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${formData.is_published ? 'border-zinc-800 bg-zinc-50' : 'border-gray-100 bg-white'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[13.5px] font-medium text-[#242424]">Published</span>
                            <div className={`w-3 h-3 rounded-full ${formData.is_published ? 'bg-zinc-800 animate-pulse' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-[11.5px] text-[#71717a]">If published, it will be visible to users once linked to products.</p>
                    </div>

                    <div 
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${formData.is_active ? 'border-[#bef264]/60 bg-[#bef264]/5' : 'border-gray-100 bg-white'}`}
                    >
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-[13.5px] font-medium text-[#242424]">Mark as Active</span>
                            <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-[#74a134]' : 'bg-gray-300'}`} />
                        </div>
                        <p className="text-[11.5px] text-[#71717a]">Active banners get priority rendering and special badges in admin.</p>
                    </div>
                </div>

                {/* Banner Placement Type */}
                <div className="flex flex-col gap-3">
                    <label className="text-[14px] font-medium text-[#242424]">Banner Placement</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormData({ ...formData, display_type: 'home' })}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.display_type === 'home' ? 'border-[#242424] bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                            <span className="text-[14px] font-medium">Homepage Sale</span>
                            <span className="text-[11px] text-[#71717a]">Appears on general store feed</span>
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, display_type: 'product' })}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${formData.display_type === 'product' ? 'border-[#242424] bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                        >
                            <span className="text-[14px] font-medium">Product Page</span>
                            <span className="text-[11px] text-[#71717a]">Specific to detail pages</span>
                        </button>
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}

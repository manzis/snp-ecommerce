'use client';

import React, { useState, useEffect } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Coupon } from './CouponActionMenu';
import { fetchBasicProducts, Product } from '@/services/productService';
import { Calendar, Tag, Percent, DollarSign, Package, EyeOff } from 'lucide-react';


interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Coupon>) => Promise<void>;
    coupon?: Coupon | null;
    isSaving?: boolean;
}

export default function CouponModal({
    isOpen,
    onClose,
    onSave,
    coupon,
    isSaving
}: CouponModalProps) {
    const [formData, setFormData] = useState<Partial<Coupon>>({
        code: '',
        type: 'fixed',
        value: 0,
        min_cart_value: 0,
        product_id: null,
        description: '',
        is_active: true,
        expires_at: null,
        max_discount: null,
        is_public: true
    });

    const [products, setProducts] = useState<Partial<Product>[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoadingProducts(true);
            const data = await fetchBasicProducts();
            setProducts(data || []);
            setIsLoadingProducts(false);
        };
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                min_cart_value: coupon.min_cart_value,
                product_id: coupon.product_id,
                description: coupon.description || '',
                is_active: coupon.is_active,
                expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : null,
                max_discount: coupon.max_discount,
                is_public: coupon.is_public !== false // defaults to true if undefined
            });
        } else {
            setFormData({
                code: '',
                type: 'fixed',
                value: 0,
                min_cart_value: 0,
                product_id: null,
                description: '',
                is_active: true,
                expires_at: null,
                max_discount: null,
                is_public: true
            });
        }
    }, [coupon, isOpen]);

    const handleSave = async () => {
        await onSave(coupon?.id || null, formData);
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={coupon ? 'Edit Coupon' : 'Create Coupon'}
            description={coupon ? `Editing details for ${coupon.code}` : 'Set up a new discount coupon.'}
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
                        disabled={isSaving || !formData.code || !formData.value}
                        className="flex-[2] md:flex-none md:px-12 py-4 md:py-3 bg-[#242424] text-white rounded-2xl text-[14px] font-medium hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {coupon ? 'Save Changes' : 'Create Coupon'}
                    </button>
                </>
            }
        >
            <div className="space-y-8">
                {/* Coupon Code */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-regular text-[#71717a] flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" /> Coupon Code
                    </label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER2024"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none font-bold tracking-widest uppercase"
                    />
                </div>

                {/* Discount Type and Value */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Discount Type</label>
                        <div className="flex gap-2 bg-gray-50 p-1 rounded-xl border border-gray-200">
                            <button
                                onClick={() => setFormData({ ...formData, type: 'fixed' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${formData.type === 'fixed' ? 'bg-white shadow-sm text-[#242424] border border-gray-100' : 'text-[#71717a] hover:text-[#242424]'}`}
                            >
                                <DollarSign className="w-3.5 h-3.5" /> Fixed
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, type: 'percentage' })}
                                className={`flex-1 py-2 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${formData.type === 'percentage' ? 'bg-white shadow-sm text-[#242424] border border-gray-100' : 'text-[#71717a] hover:text-[#242424]'}`}
                            >
                                <Percent className="w-3.5 h-3.5" /> Percentage
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Discount Value</label>
                        <input
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                            placeholder={formData.type === 'percentage' ? '10' : '500'}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Min Cart Value (Rs.)</label>
                        <input
                            type="number"
                            value={formData.min_cart_value}
                            onChange={(e) => setFormData({ ...formData, min_cart_value: parseFloat(e.target.value) })}
                            placeholder="0"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Max Discount (Optional)</label>
                        <input
                            type="number"
                            value={formData.max_discount || ''}
                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null })}
                            placeholder="Unlimited"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                            disabled={formData.type === 'fixed'}
                        />
                    </div>
                </div>

                {/* Product Restrict & Expiry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a] flex items-center gap-2">
                           <Package className="w-3.5 h-3.5" /> Restricted to Product
                        </label>
                        <select
                            value={formData.product_id || ''}
                            onChange={(e) => setFormData({ ...formData, product_id: e.target.value || null })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        >
                            <option value="">All Products</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a] flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Expiry Date
                        </label>
                        <input
                            type="date"
                            value={formData.expires_at || ''}
                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value || null })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-regular text-[#71717a]">Description</label>
                    <textarea
                        rows={2}
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Special discount for loyal customers..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded outline-none border-gray-300 text-[#242424] focus:ring-[#242424]"
                        />
                        <div className="flex flex-col">
                            <label htmlFor="is_active" className="text-[14px] font-medium text-[#242424] cursor-pointer">
                                Active Status
                            </label>
                            <span className="text-[12px] text-[#71717a]">
                                If disabled, this coupon cannot be used.
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input
                            type="checkbox"
                            id="is_private"
                            checked={formData.is_public === false}
                            onChange={(e) => setFormData({ ...formData, is_public: !e.target.checked })}
                            className="w-5 h-5 rounded outline-none border-gray-300 text-[#242424] focus:ring-[#242424]"
                        />
                        <div className="flex flex-col">
                            <label htmlFor="is_private" className="text-[14px] font-medium text-[#242424] cursor-pointer flex items-center gap-1">
                                Make Private <EyeOff className="w-3.5 h-3.5" />
                            </label>
                            <span className="text-[12px] text-[#71717a]">
                                Hide from the storefront product pages.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminModal>
    );
}

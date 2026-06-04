'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductVariant } from '@/services/productService';
import { updateProductVariantPricesAction, updateProductAction } from '@/app/actions/productActions';
import CloseIcon from '@/components/icons/CloseIcon';
import SaveIcon from '@/components/icons/TickIcon';

interface UpdatePriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (variants: Partial<ProductVariant>[]) => void;
    product: Product;
}

export default function UpdatePriceModal({
    isOpen,
    onClose,
    onSuccess,
    product
}: UpdatePriceModalProps) {
    const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
    const [basePrice, setBasePrice] = useState({
        original: parseFloat(product.original_price) || 0,
        discounted: parseFloat(product.discounted_price) || 0
    });
    const [isSaving, setIsSaving] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Initialize state on open
    useEffect(() => {
        if (!isOpen) return;

        setBasePrice({
            original: parseFloat(product.original_price) || 0,
            discounted: parseFloat(product.discounted_price) || 0
        });

        const sizes = product.product_sizes || [];
        const flavors = product.product_flavours || [];
        const existingVariants = product.product_variants || [];

        const newVariants: Partial<ProductVariant>[] = [];

        // Only generate variant grid if there are actual sizes or flavors defined
        if (sizes.length > 0 || flavors.length > 0) {
            const targetSizes = sizes.length > 0 ? sizes : [{ id: null as any, size_label: 'Default' }];
            const targetFlavors = flavors.length > 0 ? flavors : [{ id: null as any, flavour_name: 'Default' }];

            targetSizes.forEach(size => {
                targetFlavors.forEach(flavor => {
                    const existing = existingVariants.find(v => v.size_id === size.id && v.flavour_id === flavor.id);
                    newVariants.push({
                        size_id: size.id,
                        flavour_id: flavor.id,
                        original_price: existing?.original_price || parseFloat(product.original_price) || 0,
                        discounted_price: existing?.discounted_price || parseFloat(product.discounted_price) || 0,
                        stock_count: existing?.stock_count || 0,
                        is_available: existing?.is_available ?? true,
                        size: size as any,
                        flavour: flavor as any
                    } as any);
                });
            });
        }

        setVariants(newVariants);
    }, [isOpen, product]);

    const handlePriceChange = (index: number, field: 'original_price' | 'discounted_price', value: string) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
        setVariants(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Update Base Product Pricing
            const baseRes = await updateProductAction(product.id, {
                original_price: basePrice.original,
                discounted_price: basePrice.discounted
            });

            if (!baseRes.success) throw new Error(baseRes.message);

            // 2. Update Variant Pricing (if any)
            if (variants.length > 0) {
                const variantRes = await updateProductVariantPricesAction(product.id, variants);
                if (!variantRes.success) throw new Error(variantRes.message);
            }

            onSuccess?.(variants);
            onClose();
        } catch (error: any) {
            alert(`Failed up save prices: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-end md:items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col max-h-[75dvh] lg:max-h-[50dvh] rounded-t-[24px] md:rounded-[12px] "
                    >
                        {/* Floating Close Button (Outside) */}
                        <button
                            onClick={onClose}
                            className="absolute bottom-[calc(100%+10px)] right-4 md:right-0 p-2.5 bg-white text-[#242424] rounded-[12px] border border-gray-200 shadow-xl shadow-black/5 transition-all hover:bg-gray-50 active:scale-95 group"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>

                        {/* Drag Handle */}
                        <div className="flex justify-center p-3 sticky top-0 bg-white z-10 rounded-t-[24px]">
                            <div className="w-12 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-8 pb-4 pt-1 border-b border-gray-100 flex items-center justify-between font-rubik sticky top-10 bg-white z-10">
                            <div>
                                <h3 className="text-[18px] font-medium text-[#242424] tracking-tight">Update Pricing</h3>
                                <p className="text-[12px] text-[#71717a] font-medium mt-0.5">{product.title}</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 font-rubik custom-scrollbar space-y-8">
                            {/* Section 1: Base Pricing */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-[15px] font-medium text-[#242424] tracking-tight">Base Pricing Update</h4>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>
                                <div className="grid grid-cols-2 border border-dotted border-gray-300 divide-x divide-dotted divide-gray-300 rounded-[6px] overflow-hidden">
                                    <div className="flex flex-col gap-1.5 p-5 bg-zinc-50/30">
                                        <label className="text-[11px] font-medium text-[#71717a]">Base Original</label>
                                        <input
                                            type="number"
                                            value={basePrice.original}
                                            onChange={(e) => setBasePrice({ ...basePrice, original: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-transparent border-b border-gray-100 py-2 text-[14px] font-medium focus:border-black transition-all outline-none rounded-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 p-5 bg-zinc-50/30">
                                        <label className="text-[11px] font-medium text-[#71717a]">Base Discounted</label>
                                        <input
                                            type="number"
                                            value={basePrice.discounted}
                                            onChange={(e) => setBasePrice({ ...basePrice, discounted: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-transparent border-b border-gray-100 py-2 text-[14px] font-medium text-[#242424] focus:border-black transition-all outline-none rounded-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Variant Pricing */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-[15px] font-medium text-[#242424] tracking-tight">Variant Pricing</h4>
                                    <div className="h-px flex-1 bg-gray-100" />
                                </div>

                                {variants.length > 0 ? (
                                    <div className="space-y-3">
                                        {variants.map((variant, index) => (
                                            <div key={index} className="border border-gray-200 rounded-[6px] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white group">
                                                <div className="flex-1 p-5 min-w-0">
                                                    <p className="text-[11px] text-[#a1a1aa] font-medium tracking-tight truncate mb-1.5 uppercase-none">Variant Combination</p>
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                        {variant.size && variant.size.size_label !== 'Default' && (
                                                            <input
                                                                type="text"
                                                                value={variant.size.size_label || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], size: { ...updated[index].size, size_label: e.target.value } as any };
                                                                    setVariants(updated);
                                                                }}
                                                                className="px-2 py-1 w-[100px] border border-gray-200 text-[#242424] text-[12px] font-medium rounded-[4px] outline-none focus:border-black transition-all"
                                                            />
                                                        )}
                                                        {variant.flavour && variant.flavour.flavour_name !== 'Default' && (
                                                            <input
                                                                type="text"
                                                                value={variant.flavour.flavour_name || ''}
                                                                onChange={(e) => {
                                                                    const updated = [...variants];
                                                                    updated[index] = { ...updated[index], flavour: { ...updated[index].flavour, flavour_name: e.target.value } as any };
                                                                    setVariants(updated);
                                                                }}
                                                                className="px-2 py-1 w-[120px] border border-gray-100 text-[#71717a] text-[12px] font-medium bg-gray-50/50 rounded-[4px] outline-none focus:border-black focus:bg-white transition-all"
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 md:flex md:items-stretch divide-x divide-gray-200">
                                                    <div className="flex flex-col gap-1.5 p-4 md:w-32">
                                                        <label className="text-[10px] font-medium text-[#71717a]">Original</label>
                                                        <input
                                                            type="number"
                                                            value={variant.original_price}
                                                            onChange={(e) => handlePriceChange(index, 'original_price', e.target.value)}
                                                            className="w-full bg-transparent text-[13px] font-medium focus:text-black transition-all outline-none rounded-none py-1 border-b border-gray-100 focus:border-gray-300"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-4 md:w-32">
                                                        <label className="text-[10px] font-medium text-[#71717a]">Discounted</label>
                                                        <input
                                                            type="number"
                                                            value={variant.discounted_price}
                                                            onChange={(e) => handlePriceChange(index, 'discounted_price', e.target.value)}
                                                            className="w-full bg-transparent text-[13px] font-medium text-[#242424] focus:text-black transition-all outline-none rounded-none py-1 border-b border-gray-100 focus:border-gray-300"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-4 md:w-24">
                                                        <label className="text-[10px] font-medium text-[#71717a]">Stock</label>
                                                        <input
                                                            type="number"
                                                            value={variant.stock_count}
                                                            onChange={(e) => {
                                                                const updated = [...variants];
                                                                updated[index] = { ...updated[index], stock_count: parseInt(e.target.value) || 0 };
                                                                setVariants(updated);
                                                            }}
                                                            className="w-full bg-transparent text-[13px] font-medium focus:text-black transition-all outline-none rounded-none py-1 text-center border-b border-gray-100 focus:border-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-gray-200 p-12 text-center bg-white rounded-[6px]">
                                        <p className="text-[14px] font-medium text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                                            This product doesn't have any specific <span className="text-[#71717a]">sizes</span> and <span className="text-[#71717a]">variants</span>.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-8 pb-10 md:pb-8 border-t border-gray-100 bg-white flex items-center gap-4 font-rubik sticky bottom-0 z-10 md:rounded-b-[12px]">
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none md:px-8 py-4 md:py-3 text-[14px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 md:bg-transparent rounded-2xl transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-[2] md:flex-none md:px-12 py-4 md:py-3 bg-[#242424] text-white rounded-2xl text-[14px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                            >
                                {isSaving ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <SaveIcon className="w-4 h-4" />
                                        <span>Update Pricing</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}

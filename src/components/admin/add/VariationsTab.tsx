import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PlusIcon from '@/components/icons/PlusIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import SaveIcon from '@/components/icons/TickIcon';
import CloseIcon from '@/components/icons/CloseIcon';
import ImageUpload from '@/components/admin/products/ImageUpload';

export default function VariationsTab({ formData, setFormData, errors }: any) {
    const [genError, setGenError] = useState('');

    const toggleVariants = (val: boolean) => {
        setFormData({ 
            ...formData, 
            has_variants: val,
            product_variants: val ? formData.product_variants : [],
            temp_sizes: val ? formData.temp_sizes : '',
            temp_flavours: val ? formData.temp_flavours : ''
        });
    };

    const handleGenerate = () => {
        if (!formData.has_variants) return;
        setGenError('');
        const sizesInput = formData.temp_sizes || '';
        const flavsInput = formData.temp_flavours || '';

        if (!sizesInput.trim() && !flavsInput.trim()) {
            setGenError('Please enter at least one size or flavor to generate combinations.');
            return;
        }

        const sizes = sizesInput.split(',').map((s: string) => s.trim()).filter(Boolean);
        const flavs = flavsInput.split(',').map((f: string) => f.trim()).filter(Boolean);

        const currentVariants = [...formData.product_variants];
        const newBatch: any[] = [];

        const targetSizes = sizes.length > 0 ? sizes : ['Default'];
        const targetFlavs = flavs.length > 0 ? flavs : ['Default'];

        let duplicateFound = false;

        targetSizes.forEach((s: string) => {
            targetFlavs.forEach((f: string) => {
                const sizeLabel = s === 'Default' ? null : s;
                const flavourName = f === 'Default' ? null : f;

                const exists = currentVariants.some(v => 
                    v.size_label === sizeLabel && v.flavour_name === flavourName
                );

                if (!exists) {
                    newBatch.push({
                        size_label: sizeLabel,
                        flavour_name: flavourName,
                        original_price: formData.original_price || '',
                        discounted_price: formData.discounted_price || '',
                        image_url: '',
                        is_available: true
                    });
                } else {
                    duplicateFound = true;
                }
            });
        });

        if (newBatch.length > 0) {
            setFormData({ 
                ...formData, 
                product_variants: [...currentVariants, ...newBatch],
                temp_sizes: '',
                temp_flavours: ''
            });
        } else if (duplicateFound) {
            setGenError('One or more of these combinations already exist in the list.');
        }
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const updated = [...formData.product_variants];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, product_variants: updated });
    };

    const removeVariant = (index: number) => {
        const updated = formData.product_variants.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, product_variants: updated });
    };

    return (
        <div className="space-y-8">
            {/* Variation Toggle Checkbox */}
            <div className="flex items-center gap-4 p-6 bg-zinc-50/50 border border-zinc-100 rounded-2xl transition-all hover:bg-zinc-50">
                <div className="relative flex items-center h-5">
                    <input
                        id="has_variants"
                        type="checkbox"
                        checked={formData.has_variants}
                        onChange={(e) => toggleVariants(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer transition-all"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="has_variants" className="text-[14px] font-medium text-[#242424] cursor-pointer">
                        This product includes variations
                    </label>
                    <p className="text-[12px] text-[#71717a] font-regular italic">
                        Enable this to add different sizes, flavours, or patterns.
                    </p>
                </div>
            </div>

            {formData.has_variants && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-regular text-[#242424]">Sizes (comma separated)</label>
                    <input
                        type="text"
                        value={formData.temp_sizes}
                        onChange={(e) => setFormData({ ...formData, temp_sizes: e.target.value })}
                        placeholder="250g, 500g, 1kg"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-regular placeholder:text-zinc-400 placeholder:font-regular focus:border-black outline-none transition-all"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[12.5px] font-regular text-[#242424]">Flavours (comma separated)</label>
                    <input
                        type="text"
                        value={formData.temp_flavours}
                        onChange={(e) => setFormData({ ...formData, temp_flavours: e.target.value })}
                        placeholder="Unflavored, Chocolate, Berry"
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-regular placeholder:text-zinc-400 placeholder:font-regular focus:border-black outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleGenerate}
                    className="w-fit px-10 py-3.5 bg-[#242424] text-white text-[13px] font-medium rounded-full hover:bg-black transition-all active:scale-[0.99]"
                >
                    Generate Combinations
                </button>
                {genError && (
                    <motion.p 
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[12px] text-red-500 font-medium px-2"
                    >
                        {genError}
                    </motion.p>
                )}
            </div>

            {(!formData.product_variants || formData.product_variants.length === 0) ? (
                <div className={`py-12 px-6 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed transition-all ${errors.variants ? 'bg-red-50/50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${errors.variants ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 border border-gray-100 shadow-sm'}`}>
                        {errors.variants ? <ErrorIcon className="w-6 h-6 animate-pulse" /> : <PlusIcon className="w-6 h-6" />}
                    </div>
                    <h3 className={`text-[14px] font-medium mb-1 ${errors.variants ? 'text-red-700' : 'text-[#242424]'}`}>No Variations Created</h3>
                    <p className={`text-[12px] font-regular max-w-[240px] ${errors.variants ? 'text-red-500' : 'text-[#a1a1aa]'}`}>
                        {errors.variants 
                            ? 'Please generate at least one product variation to continue.'
                            : 'Enter size and flavour details above to build your product combinations.'}
                    </p>
                </div>
            ) : (
                <div className={`space-y-4 pt-8 border-t ${errors.variants ? 'border-red-100' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h4 className="text-[14px] font-medium text-[#242424]">Variant Pricing</h4>
                            {errors.variants && (
                                <span className="flex items-center gap-1 text-[11px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                                    <ErrorIcon className="w-3 h-3" />
                                    Pricing Required
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-[#71717a] uppercase tracking-wider font-regular">{formData.product_variants.length} Variants</span>
                    </div>
                    <div className="space-y-3">
                        {(formData.product_variants || []).map((v: any, index: number) => {
                            const isPriceValid = !v.original_price || !v.discounted_price || Number(v.original_price) >= Number(v.discounted_price);
                            
                            return (
                                <div key={index} className={`relative flex flex-col gap-6 p-6 bg-white border rounded-2xl transition-all ${!isPriceValid ? 'border-red-500 bg-red-50/5' : 'border-gray-100'}`}>
                                    {/* Action Header: Saved Status & Remove Button */}
                                    <div className="absolute top-4 right-4 flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => updateVariant(index, 'is_available', v.is_available === false ? true : false)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors group ${v.is_available === false ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            <span className="text-[10px] font-medium uppercase tracking-wider">
                                                {v.is_available === false ? 'Mark as Available' : 'Mark as Unavailable'}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => removeVariant(index)}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors group"
                                        >
                                            <CloseIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                            <span className="text-[10px] font-medium uppercase tracking-wider">Remove</span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1 flex items-center gap-4">
                                            <div className="w-16 h-16 shrink-0">
                                                <ImageUpload
                                                    value={v.image_url}
                                                    onChange={(url) => updateVariant(index, 'image_url', url)}
                                                    path={`products/${formData.slug || 'new-product'}/variants`}
                                                    className="h-full w-full"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-[#71717a] font-regular px-1 uppercase tracking-wider">Size</span>
                                                    <input
                                                        type="text"
                                                        value={v.size_label || ''}
                                                        onChange={(e) => updateVariant(index, 'size_label', e.target.value)}
                                                        placeholder="Base Size"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-medium text-[#242424] focus:border-black outline-none transition-all placeholder:text-zinc-400 placeholder:font-regular"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-[#71717a] font-regular px-1 uppercase tracking-wider">Flavour</span>
                                                    <input
                                                        type="text"
                                                        value={v.flavour_name || ''}
                                                        onChange={(e) => updateVariant(index, 'flavour_name', e.target.value)}
                                                        placeholder="Original Flavor"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[12px] font-regular text-[#71717a] focus:border-black outline-none transition-all placeholder:text-zinc-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] text-[#71717a] font-regular px-1 uppercase tracking-wider">Original Price</span>
                                                    <input
                                                        type="number"
                                                        value={v.original_price}
                                                        onChange={(e) => updateVariant(index, 'original_price', e.target.value)}
                                                        data-error={(!v.original_price && errors.variants) ? "true" : "false"}
                                                        className={`w-32 bg-white border rounded-xl px-4 py-3 text-[14px] font-regular focus:bg-white placeholder:text-zinc-400 placeholder:font-regular focus:border-black outline-none transition-all ${(!v.original_price && errors.variants) ? 'border-red-500 bg-red-50/5' : 'border-gray-200 focus:border-black'}`}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[10px] text-[#71717a] font-regular px-1 uppercase tracking-wider">Sale Price</span>
                                                    <input
                                                        type="number"
                                                        value={v.discounted_price}
                                                        onChange={(e) => updateVariant(index, 'discounted_price', e.target.value)}
                                                        data-error={(!v.discounted_price && errors.variants) || !isPriceValid ? "true" : "false"}
                                                        className={`w-32 bg-white border rounded-xl px-4 py-3 text-[14px] font-medium focus:bg-white placeholder:text-zinc-400 placeholder:font-regular outline-none transition-all ${(!v.discounted_price && errors.variants) || !isPriceValid ? 'border-red-500 text-red-600 bg-red-50/5' : 'border-gray-200 focus:border-black'}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    {!isPriceValid && (
                                        <p className="text-[11px] text-red-500 font-medium px-1">Warning: Sale price should not exceed original price.</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    )}

            {!formData.has_variants && (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-gray-100 bg-gray-50/30">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-white text-gray-300 border border-gray-100 shadow-sm">
                        <PlusIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-[14px] font-medium mb-1 text-gray-400 italic">Variations Disabled</h3>
                    <p className="text-[12px] font-regular max-w-[280px] text-gray-400">
                        This product currently uses fixed base pricing. Enable variations above if you want to add size or flavor choices.
                    </p>
                </div>
            )}
        </div>
    );
}

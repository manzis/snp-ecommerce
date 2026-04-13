'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlusIcon from '@/components/icons/PlusIcon';
import CloseIcon from '@/components/icons/CloseIcon';

interface ProductStatusManagerProps {
    formData: any;
    setFormData: (data: any) => void;
}

export default function ProductStatusManager({ formData, setFormData }: ProductStatusManagerProps) {
    const [tagInput, setTagInput] = useState('');

    const addTag = () => {
        if (!tagInput.trim()) return;
        const cleanTags = formData.tags || [];
        if (cleanTags.includes(tagInput.trim())) {
            setTagInput('');
            return;
        }
        setFormData({
            ...formData,
            tags: [...cleanTags, tagInput.trim()]
        });
        setTagInput('');
    };

    const removeTag = (index: number) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_: any, i: number) => i !== index)
        });
    };

    return (
        <div className="flex flex-col space-y-7">
            {/* Visibility Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setFormData({ ...formData, is_published: !formData.is_published, is_draft: false })}>
                    <div className="flex-1">
                        <h4 className="text-[13px] font-medium text-[#242424]">Publish Live</h4>
                        <p className="text-[11px] text-[#a1a1aa] font-regular mt-0.5">Visible to public customers</p>
                    </div>
                    <button className={`w-8.5 h-4.5 rounded-full p-0.5 transition-all duration-300 ${formData.is_published ? 'bg-[#242424]' : 'bg-gray-100'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.is_published ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between group cursor-pointer" onClick={() => setFormData({ ...formData, is_draft: !formData.is_draft, is_published: false })}>
                    <div className="flex-1">
                        <h4 className="text-[13px] font-medium text-[#242424]">Draft Mode</h4>
                        <p className="text-[11px] text-[#a1a1aa] font-regular mt-0.5">Internal only access</p>
                    </div>
                    <button className={`w-8.5 h-4.5 rounded-full p-0.5 transition-all duration-300 ${formData.is_draft ? 'bg-amber-400' : 'bg-gray-100'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.is_draft ? 'translate-x-[16px]' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Inventory Section */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[12px] font-regular text-[#71717a] px-1 block tracking-tight ">Inventory Level</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { id: 'in_stock', label: 'In Stock', desc: 'Immediately available' },
                        { id: 'out_of_stock', label: 'Out of Stock', desc: 'Disabled in store' },
                        { id: 'pre_order', label: 'Pre-Order', desc: 'Future delivery' }
                    ].map((status) => (
                        <button
                            key={status.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, stock_status: status.id })}
                            className={`flex flex-col items-start p-2.5 px-3.5 rounded-xl border text-left transition-all ${formData.stock_status === status.id
                                ? `bg-[#242424] border-black text-white shadow-sm`
                                : 'bg-white border-gray-100 hover:border-gray-200 text-[#242424]'
                                }`}
                        >
                            <span className="text-[12.5px] font-medium">
                                {status.label}
                            </span>
                            <span className={`text-[10.5px] font-regular ${formData.stock_status === status.id ? 'text-white/60' : 'text-[#a1a1aa]'}`}>
                                {status.desc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conditionally reveal Stock units if In Stock is selected and it's a simple product */}
            <AnimatePresence>
                {formData.stock_status === 'in_stock' && !formData.has_variants && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 pt-4 pb-2">
                            <label className="text-[12px] font-regular text-[#71717a] px-1 block tracking-tight">Stock Units <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.stock_count || ''}
                                    onChange={(e) => setFormData({ ...formData, stock_count: parseInt(e.target.value) || 0 })}
                                    placeholder="e.g. 150"
                                    className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-[14px] font-medium placeholder:text-zinc-400 focus:border-black outline-none transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-[#A1A1AA] font-medium pointer-events-none">
                                    UNITS
                                </div>
                            </div>
                            <p className="text-[10px] text-[#A1A1AA] px-1 font-regular italic leading-tight">
                                Specific inventory count for this simple product.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tags Section */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <label className="text-[12px] font-regular text-[#71717a] px-1 block tracking-tight ">Search Tags</label>
                <div className="relative group">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                        placeholder="e.g. Wellness, Vegan"
                        className="w-full bg-gray-50/30 border border-gray-100 rounded-xl px-4 py-3 text-[13px] font-regular placeholder:text-zinc-400 focus:border-black focus:bg-white outline-none transition-all pr-12"
                    />
                    <button
                        type="button"
                        onClick={addTag}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all text-[#71717a] shadow-sm"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>

                {/* Tag Preview Area */}
                <div className="flex flex-wrap gap-2 pt-1">
                    <AnimatePresence>
                        {(formData.tags || []).map((tag: string, index: number) => (
                            <motion.div
                                key={`${tag}-${index}`}
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-[#242424] rounded-lg text-[11.5px] font-medium border border-gray-100 hover:border-gray-200 transition-colors cursor-default"
                            >
                                <span>{tag}</span>
                                <button
                                    onClick={() => removeTag(index)}
                                    className="p-0.5 hover:bg-white rounded-full transition-colors flex items-center justify-center"
                                >
                                    <CloseIcon className="w-2.5 h-2.5" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Pro Tip Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-4.5 border border-zinc-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <PlusIcon className="w-12 h-12 rotate-45" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-amber-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded tracking-tighter">PRO TIP</span>
                            <h5 className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest">Product Lifecycle</h5>
                        </div>
                        <p className="text-[12px] text-white/90 leading-relaxed font-regular">
                            Use <span className="text-zinc-400 font-medium">"Draft"</span> for new entries and <span className="text-amber-400 font-medium">"Live"</span> only when price variations are fully set and ready for customers.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

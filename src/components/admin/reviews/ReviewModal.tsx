'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminModal from '@/components/admin/shared/AdminModal';
import { Review, Product } from '@/services/productService';
import ImageUpload from '@/components/admin/products/ImageUpload';
import { fetchProductsPaginated } from '@/services/productService';
import Image from 'next/image';
import ChevronDownIcon from '@/components/icons/CaretDownIcon';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string | null, data: Partial<Review>, productIds: string[]) => Promise<void>;
    review?: Review | null;
    isSaving?: boolean;
    lockProduct?: boolean;
    initialProductIds?: string[];
}

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" onClick={() => onChange(i)} className="focus:outline-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill={i <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={i <= value ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300 transition-colors'}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            </button>
        ))}
        <span className="ml-2 text-[13px] text-[#71717a]">{value} / 5</span>
    </div>
);

export default function ReviewModal({ isOpen, onClose, onSave, review, isSaving, lockProduct, initialProductIds }: ReviewModalProps) {
    const isEdit = !!review;

    const [form, setForm] = useState({
        author: '',
        role: '',
        text: '',
        rating: 5,
        image: '',
        author_avatar: '',
        is_verified: false,
        is_featured_home: false,
        home_title: '',
    });

    // Multi-select product IDs (editing = single product from existing row)
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // Products list + picker UI state
    const [products, setProducts] = useState<Product[]>([]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerSearch, setPickerSearch] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    // Load all products once
    useEffect(() => {
        fetchProductsPaginated(1, 200).then(({ products: p }) => setProducts(p));
    }, []);

    // Close picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initializedRef = useRef(false);

    // Reset initialization when modal close
    useEffect(() => {
        if (!isOpen) {
            initializedRef.current = false;
        }
    }, [isOpen]);

    // Sync form when editing or opening
    useEffect(() => {
        if (isOpen && !initializedRef.current) {
            if (review) {
                setForm({
                    author: review.author || '',
                    role: review.role || '',
                    text: review.text || '',
                    rating: review.rating || 5,
                    image: review.image || '',
                    author_avatar: review.author_avatar || '',
                    is_verified: review.is_verified || false,
                    is_featured_home: review.is_featured_home || false,
                    home_title: review.home_title || '',
                });
                // Initialize from many-to-many data if available, fallback to deprecated product_id
                const initialIds = review.products_data 
                    ? review.products_data.map((p: any) => p.id).filter(Boolean)
                    : (review.product_id ? [review.product_id] : []);
                setSelectedProductIds(initialIds);
            } else {
                setForm({ author: '', role: '', text: '', rating: 5, image: '', author_avatar: '', is_verified: false, is_featured_home: false, home_title: '' });
                setSelectedProductIds(initialProductIds || []);
            }
            initializedRef.current = true;
        }
    }, [review, isOpen, initialProductIds]);

    const filteredProducts = products.filter(p =>
        p.title?.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        p.name?.toLowerCase().includes(pickerSearch.toLowerCase())
    );

    const toggleProduct = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!form.author.trim() || !form.text.trim()) return;

        const payload: Partial<Review> = {
            author: form.author.trim(),
            role: form.role.trim() || null,
            text: form.text.trim(),
            rating: form.rating,
            image: form.image || null,
            author_avatar: form.author_avatar || null,
            is_verified: form.is_verified,
            is_featured_home: form.is_featured_home,
            home_title: form.home_title || null,
            // product_id will be set per-row in the action
        };

        await onSave(review?.id ?? null, payload, selectedProductIds);
    };

    // Build selected product labels for display
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Edit Review' : 'Add Review'}
            description={
                isEdit
                    ? 'Update reviewer details and content.'
                    : 'Select multiple products to create the same review for each.'
            }
            footerActions={
                <>
                    <button
                        onClick={onClose}
                        className="flex-1 md:flex-none md:px-8 py-4 md:py-3 text-[14px] font-medium text-[#71717a] hover:text-[#242424] bg-gray-50 md:bg-transparent rounded-2xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !form.author.trim() || !form.text.trim()}
                        className="flex-[2] md:flex-none md:px-12 py-4 md:py-3 bg-[#242424] text-white rounded-2xl text-[14px] font-medium hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                        {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {isEdit
                            ? 'Save Changes'
                            : selectedProductIds.length > 0
                            ? `Add to ${selectedProductIds.length} Product${selectedProductIds.length > 1 ? 's' : ''}`
                            : 'Add Review'}
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Author Avatar */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Author Avatar</label>
                        <ImageUpload
                            value={form.author_avatar}
                            onChange={(url) => setForm({ ...form, author_avatar: url })}
                            path="reviews/avatars"
                            label=""
                            className="w-full"
                        />
                    </div>
                    {/* Review Content Media */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Review Media (Photo/Video)</label>
                        <ImageUpload
                            value={form.image}
                            onChange={(url) => setForm({ ...form, image: url })}
                            path="reviews/content"
                            label=""
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Author Name</label>
                        <input
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            placeholder="e.g. Ashish Sharma"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-regular text-[#71717a]">Role / Title</label>
                        <input
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            placeholder="e.g. Verified Buyer"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-regular text-[#71717a]">Rating</label>
                    <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>

                {/* Review text */}
                <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-regular text-[#71717a]">Review Text</label>
                    <textarea
                        value={form.text}
                        onChange={(e) => setForm({ ...form, text: e.target.value })}
                        rows={4}
                        placeholder="Write the review content..."
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] focus:border-[#242424] transition-all outline-none resize-none"
                    />
                </div>

                {/* Product multi-select (Linked Products) */}
                <div className="flex flex-col gap-2" ref={pickerRef}>
                    <label className="text-[13px] font-regular text-[#71717a]">
                        Linked Products
                        {selectedProductIds.length > 0 && (
                            <span className="ml-2 text-[12px] text-[#a1a1aa]">
                                — associated with {selectedProductIds.length} product{selectedProductIds.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </label>

                    {/* Selected chips */}
                    {selectedProducts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedProducts.map(p => (
                                <span key={p.id} className="flex items-center gap-1.5 pl-1 pr-2 py-0.5 bg-zinc-100 rounded-full text-[12px] font-medium text-[#242424]">
                                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                        {p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" />}
                                    </div>
                                    {p.title || p.name}
                                    <button type="button" onClick={() => toggleProduct(p.id)} className="text-[#a1a1aa] hover:text-[#242424] ml-0.5">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Trigger */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                if (lockProduct) return;
                                setPickerOpen(o => !o); 
                                setPickerSearch(''); 
                            }}
                            className={`flex items-center justify-between w-full bg-white border rounded-xl px-4 py-3 text-[14px] transition-all text-left ${pickerOpen ? 'border-black ring-1 ring-black/5' : 'border-gray-200'} ${lockProduct ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-zinc-400">
                                {selectedProductIds.length > 0
                                    ? `${selectedProductIds.length} product${selectedProductIds.length > 1 ? 's' : ''} selected`
                                    : 'Select product(s)...'}
                            </span>
                            {!lockProduct && <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`} />}
                        </button>

                        {pickerOpen && (
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-gray-100 rounded-[16px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.12),0_4px_12px_-4px_rgba(0,0,0,0.08)] z-[200] max-h-[220px] overflow-hidden flex flex-col">
                                <div className="p-2 pb-1">
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            value={pickerSearch}
                                            onChange={e => setPickerSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-lg px-8 py-1.5 text-[13px] outline-none focus:border-black focus:bg-white transition-all"
                                        />
                                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="overflow-y-auto py-1 px-2 custom-scrollbar">
                                    {filteredProducts.length === 0 ? (
                                        <div className="px-3 py-6 text-center text-gray-400 text-[13px] italic">No products found</div>
                                    ) : filteredProducts.map(p => {
                                        const sel = selectedProductIds.includes(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => toggleProduct(p.id)}
                                                className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 text-[13px] rounded-[8px] transition-all text-left ${sel ? 'bg-gray-50 text-[#242424] font-medium' : 'text-[#4d4d4d] hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative w-7 h-7 rounded-[6px] overflow-hidden bg-white border border-gray-100 shrink-0">
                                                        {p.images?.[0]
                                                            ? <Image src={p.images[0]} alt="" fill className="object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400 font-bold uppercase">{(p.title || p.name || '?').charAt(0)}</div>
                                                        }
                                                    </div>
                                                    <span className="truncate">{p.title || p.name}</span>
                                                </div>
                                                {sel && <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Verified toggle */}
                <div className="flex items-center justify-between py-1">
                    <div>
                        <p className="text-[14px] font-medium text-[#242424]">Verified Purchase</p>
                        <p className="text-[12px] text-[#a1a1aa]">Show verified badge on this review</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, is_verified: !form.is_verified })}
                        className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 focus:outline-none ${form.is_verified ? 'bg-[#242424]' : 'bg-gray-200'}`}
                    >
                        <span className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200 ${form.is_verified ? 'translate-x-[20px]' : ''}`} />
                    </button>
                </div>

                {/* Featured Home toggle */}
                <div className="flex items-center justify-between py-1 border-t border-gray-100 pt-4 mt-2">
                    <div>
                        <p className="text-[14px] font-medium text-[#242424]">Use in Home page</p>
                        <p className="text-[12px] text-[#a1a1aa]">Feature this review prominently on the homepage</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, is_featured_home: !form.is_featured_home })}
                        className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 focus:outline-none ${form.is_featured_home ? 'bg-[#308026]' : 'bg-gray-200'}`}
                    >
                        <span className={`absolute top-[2px] left-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200 ${form.is_featured_home ? 'translate-x-[20px]' : ''}`} />
                    </button>
                </div>

                {/* Conditional Home Title */}
                {form.is_featured_home && (
                    <div className="flex flex-col gap-2 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl mt-[-8px]">
                        <label className="text-[13px] font-medium text-[#334155]">Home Page Title (Required for text reviews)</label>
                        <input
                            value={form.home_title}
                            onChange={(e) => setForm({ ...form, home_title: e.target.value })}
                            placeholder="e.g. Exceeded My Limitations"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[14px] focus:border-[#308026] focus:ring-1 focus:ring-[#308026]/20 transition-all outline-none"
                        />
                        <p className="text-[12px] text-[#64748b]">
                            Media reviews (video/image) will purely show the visual content on the home page without this title.
                        </p>
                    </div>
                )}
            </div>
        </AdminModal>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories, fetchBrands, fetchSellers, Category, Brand, Seller, Product } from '@/services/productService';
import { generateSEOSlug } from '@/utils/seoUtils';
import { createProductAction } from '@/app/actions/productActions';
import SaveIcon from '@/components/icons/TickIcon';
import ImageUpload from '@/components/admin/products/ImageUpload';
import MultiImageUpload from '@/components/admin/products/MultiImageUpload';
import RichTextEditor from '@/components/admin/products/RichTextEditor';
import MobileFloatingControls from '@/components/admin/products/MobileFloatingControls';
import CloseIcon from '@/components/icons/CloseIcon';
import ChevronDownIcon from '@/components/icons/CaretDownIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import FinalizeProductModal from '@/components/admin/products/FinalizeProductModal';
import ProductStatusManager from '@/components/admin/products/ProductStatusManager';

// Split Tab Components
import ProductInfoTab from '@/components/admin/add/ProductInfoTab';
import ProductDetailsTab from '@/components/admin/add/ProductDetailsTab';
import VariationsTab from '@/components/admin/add/VariationsTab';
import ReviewsTab from '@/components/admin/add/ReviewsTab';
import QATab from '@/components/admin/add/QATab';

// Define the tabs
const TABS = [
    { id: 'info', label: 'Product Information' },
    { id: 'details', label: 'Product Details' },
    { id: 'variants', label: 'Variations' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'qa', label: 'QA Section' },
];

export default function AddProductPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('info');
    const [isSaving, setIsSaving] = useState(false);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    // Data for selectors
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [sellers, setSellers] = useState<Seller[]>([]);

    // Unified Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        title: '',
        slug: '',
        original_price: '',
        discounted_price: '',
        discount_percentage: '',
        images: [], // Up to 5 product gallery images
        brand_id: '',
        category_id: '',
        seller_id: '',
        stock_status: 'in_stock',
        stock_count: 0,
        is_published: false,
        is_draft: true,
        product_info: {
            description: '',
            ingredients_image: '',
            highlight_image: '', // New highlight image section
            manufacture_info: {},
            other_details: {}
        },
        product_variants: [],
        highlights: [], // array of { type: 'image'|'video', src: string, alt: '' }
        reviews: [],
        qa: [],
        tags: [], // Product search tags
        // UI helpers
        temp_sizes: '',
        temp_flavours: '',
        hasManuallyEditedSlug: false,
        has_variants: false
    });

    const [showErrors, setShowErrors] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const STORAGE_KEY = 'snp_store_add_product_v1';

    useEffect(() => {
        const loadData = async () => {
            const [catData, brandData, sellerData] = await Promise.all([
                fetchCategories(),
                fetchBrands(),
                fetchSellers()
            ]);
            setCategories(catData || []);
            setBrands(brandData || []);
            setSellers(sellerData || []);

            // Restore state from localStorage
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const { formData: savedForm, activeTab: savedTab } = JSON.parse(saved);
                    if (savedForm) setFormData(savedForm);
                    if (savedTab) setActiveTab(savedTab);
                } catch (e) {
                    console.error('Failed to restore product state', e);
                }
            }
        };
        loadData();
    }, []);

    // Persist state on change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, activeTab }));
    }, [formData, activeTab]);

    // Auto-generate slug from name and brand (SEO Optimized)
    useEffect(() => {
        if (formData.name && !formData.hasManuallyEditedSlug) {
            const brandObj = (brands || []).find(b => b.id === formData.brand_id);
            const brandName = brandObj ? brandObj.name : undefined;
            const generatedSlug = generateSEOSlug(formData.name, brandName);
            setFormData((prev: any) => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.brand_id, brands]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const validateAll = () => {
        const newErrors: any = {};
        let firstTab: string | null = null;

        // Info Tab Check
        if (!formData.name?.trim()) newErrors.name = true;
        if (!formData.title?.trim()) newErrors.title = true;
        if (!formData.category_id) newErrors.category_id = true;
        if (!formData.brand_id) newErrors.brand_id = true;
        if (!formData.seller_id) newErrors.seller_id = true;
        if (!formData.original_price) newErrors.original_price = true;
        if (!formData.discounted_price) newErrors.discounted_price = true;
        if (formData.original_price && formData.discounted_price && Number(formData.original_price) < Number(formData.discounted_price)) {
            newErrors.discounted_price = true;
        }
        if (!formData.images.some((img: string) => img && img.trim() !== '')) newErrors.images = true;

        if (Object.keys(newErrors).length > 0) firstTab = 'info';

        // Details Tab Check
        if (!firstTab && (!formData.product_info.description?.trim() || formData.product_info.description === '<p></p>')) {
            newErrors.description = true;
            firstTab = 'details';
        }

        // Variations Tab Check (Relaxed for products without variants)
        // Variations Tab Check
        if (!firstTab && formData.has_variants) {
            const hasNoVariants = !formData.product_variants || formData.product_variants.length === 0;
            const hasInvalidPrice = formData.product_variants.some((v: any) => 
                !v.original_price || !v.discounted_price || Number(v.original_price) < Number(v.discounted_price)
            );
            
            if (hasNoVariants || hasInvalidPrice) {
                firstTab = 'variants';
                newErrors.variants = true;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            setErrors({});
        }

        return { isValid: Object.keys(newErrors).length === 0, firstTab };
    };

    const scrollToError = () => {
        setTimeout(() => {
            const errorEl = document.querySelector('[data-error="true"]');
            if (errorEl) {
                errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // Fallback to legacy selector if any
                const legacyEl = document.querySelector('.text-red-500');
                if (legacyEl) legacyEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    };

    const handleNextTab = () => {
        const { isValid, firstTab } = validateAll();
        
        // If the current tab has an error, stay here and show feedback
        if (!isValid && firstTab === activeTab) {
            setShowErrors(true);
            scrollToError();
            return;
        }

        const currentIndex = TABS.findIndex(t => t.id === activeTab);
        if (currentIndex < TABS.length - 1) {
            setShowErrors(false);
            setActiveTab(TABS[currentIndex + 1].id);
            const main = document.querySelector('main');
            if (main) main.scrollTop = 0;
        } else if (currentIndex === TABS.length - 1) {
            // If on the last tab and press next, show finalize modal
            handleSave();
        }
    };

    const handleSave = async () => {
        const { isValid, firstTab } = validateAll();

        if (!isValid) {
            setShowErrors(true);
            if (firstTab) {
                setActiveTab(firstTab);
                scrollToError();
            }
            return;
        }

        // If mobile/tablet, show review modal. If desktop, save immediately (as sidebar is always visible)
        if (window.innerWidth < 1024) {
            setShowFinalizeModal(true);
        } else {
            handleFinalSubmit();
        }
    };

    const handleFinalSubmit = async () => {
        setIsSaving(true);
        const cleanImages = formData.images.filter((img: string) => img && img.trim() !== '');
        const { temp_sizes, temp_flavours, ...dataToSave } = { ...formData, images: cleanImages };

        const res = await createProductAction(dataToSave);
        setIsSaving(false);
        if (res.success) {
            setShowFinalizeModal(false);
            localStorage.removeItem(STORAGE_KEY);
            router.push('/admin/products');
        } else {
            alert(`Error: ${res.message}`);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white font-rubik overflow-hidden">
            {/* Rigid Header & Tab Section - Fixed via flex layout */}
            <div className="flex-none bg-white z-[100] border-b border-gray-100">
                <DynamicAdminNav>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="px-4 py-2 text-[13px] font-regular text-[#71717a] hover:text-[#242424] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-[#242424] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <SaveIcon className="w-[16px] h-[16px]" />
                            )}
                            <span>Save Product</span>
                        </button>
                    </div>
                </DynamicAdminNav>

                {/* Industrial Tab Navigation */}
                <div className="w-full px-6 bg-white overflow-hidden">
                    <div className="flex items-center gap-8 relative overflow-x-auto no-scrollbar">
                        {TABS.map((tab) => {
                            const hasError = errors[tab.id];
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-4 px-1 text-[13.5px] whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'text-[#242424] font-medium'
                                        : hasError
                                            ? 'text-red-500 font-regular'
                                            : 'text-[#a1a1aa] font-regular hover:text-[#242424]'
                                        }`}
                                >
                                    <span className="flex items-center gap-2 whitespace-nowrap">
                                        {hasError && <ErrorIcon className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                                        {tab.label}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="tabIndicator"
                                            className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#242424] z-10"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Split Layout Container - Full Height Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-[100px] custom-scrollbar relative">
                    <div className="max-w-5xl mr-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                            >
                                {activeTab === 'info' && (
                                    <ProductInfoTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        categories={categories}
                                        brands={brands}
                                        sellers={sellers}
                                        showErrors={showErrors}
                                        errors={errors}
                                    />
                                )}
                                 {activeTab === 'details' && (
                                    <ProductDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        showErrors={showErrors}
                                        errors={errors}
                                    />
                                )}
                                {activeTab === 'variants' && (
                                    <VariationsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        errors={errors}
                                    />
                                )}
                                {activeTab === 'reviews' && (
                                    <ReviewsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                )}
                                {activeTab === 'qa' && (
                                    <QATab
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>


                {/* Desktop Sidebar - Persistent on lg screens */}
                <aside className="hidden lg:flex flex-col w-[380px] border-l border-gray-100 bg-white shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="p-8 space-y-10">
                        <section>
                            <div className="mb-6">
                                <h3 className="text-[15px] font-medium text-[#242424] tracking-tight">Visibility & Status</h3>
                                <p className="text-[12px] text-[#71717a] mt-1 font-regular">Control how this product appears in the storefront.</p>
                            </div>

                            <ProductStatusManager 
                                formData={formData} 
                                setFormData={setFormData} 
                            />
                        </section>
                    </div>
                </aside>

                <FinalizeProductModal 
                    isOpen={showFinalizeModal}
                    onClose={() => setShowFinalizeModal(false)}
                    onFinalize={handleFinalSubmit}
                    formData={formData}
                    setFormData={setFormData}
                    isSaving={isSaving}
                />
            </div>

            <MobileFloatingControls
                activeTab={activeTab}
                tabs={TABS}
                onNext={handleNextTab}
                onSave={handleSave}
                onDiscard={() => {
                    if (confirm('Discard all changes and clear saved draft?')) {
                        localStorage.removeItem(STORAGE_KEY);
                        router.push('/admin/products');
                    }
                }}
            />
        </div>
    );
}





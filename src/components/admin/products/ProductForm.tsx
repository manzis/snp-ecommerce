'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DynamicAdminNav from '@/components/layout/DynamicAdminNav';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories, fetchBrands, fetchSellers, Category, Brand, Seller } from '@/services/productService';
import { generateSEOSlug } from '@/utils/seoUtils';
import SaveIcon from '@/components/icons/TickIcon';
import ErrorIcon from '@/components/icons/ErrorIcon';
import FinalizeProductModal from '@/components/admin/products/FinalizeProductModal';
import ProductStatusManager from '@/components/admin/products/ProductStatusManager';
import MobileFloatingControls from '@/components/admin/products/MobileFloatingControls';
import { useAdminToast } from '@/components/admin/ui/AdminToastProvider';

// Split Tab Components
import ProductInfoTab from '@/components/admin/add/ProductInfoTab';
import ProductDetailsTab from '@/components/admin/add/ProductDetailsTab';
import VariationsTab from '@/components/admin/add/VariationsTab';
import ReviewsTab from '@/components/admin/add/ReviewsTab';
import QATab from '@/components/admin/add/QATab';

const TABS = [
    { id: 'info', label: 'Product Information' },
    { id: 'details', label: 'Product Details' },
    { id: 'variants', label: 'Variations' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'qa', label: 'QA Section' },
];

interface ProductFormProps {
    initialData?: any;
    mode: 'create' | 'edit';
    onSave: (data: any) => Promise<{ success: boolean; message?: string }>;
    storageKey?: string;
}

export default function ProductForm({ initialData, mode, onSave, storageKey }: ProductFormProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('info');
    const [isSaving, setIsSaving] = useState(false);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const { showAdminToast } = useAdminToast();

    // Data for selectors
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [allBanners, setAllBanners] = useState<any[]>([]);

    const defaultFormData = {
        name: '',
        title: '',
        slug: '',
        original_price: '',
        discounted_price: '',
        discount_percentage: '',
        images: [],
        brand_id: '',
        category_id: '',
        seller_id: '',
        rating: 4.5,
        stock_status: 'in_stock',
        stock_count: 0,
        is_published: false,
        is_draft: true,
        product_info: {
            description: '',
            ingredients_image: '',
            highlight_image: '',
            manufacture_info: {},
            other_details: {}
        },
        product_variants: [],
        highlights: [],
        reviews: [],
        qa: [],
        tags: [],
        linked_banner_ids: [],
        temp_sizes: '',
        temp_flavours: '',
        hasManuallyEditedSlug: mode === 'edit',
        has_variants: false
    };

    // Unified Form State
    const [formData, setFormData] = useState<any>(defaultFormData);

    const [showErrors, setShowErrors] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const loadMetadata = async () => {
        const { fetchBanners } = await import('@/services/bannerService');
        const [catData, brandData, sellerData, bannerData] = await Promise.all([
            fetchCategories(false),
            fetchBrands(false),
            fetchSellers(),
            fetchBanners()
        ]);
        setCategories(catData || []);
        setBrands(brandData || []);
        setSellers(sellerData || []);
        setAllBanners(bannerData || []);
    };

    useEffect(() => {
        const loadData = async () => {
            await loadMetadata();

            if (mode === 'edit' && initialData) {
                // Pre-process initial data to match form structure
                // Normalize variants: API returns size/flavour objects, form expects flat labels
                const normalizedVariants = initialData.product_variants?.map((v: any) => {
                    const sizeLabel = v.size?.size_label || v.product_sizes?.size_label || v.size_label;
                    const flavourName = v.flavour?.flavour_name || v.product_flavours?.flavour_name || v.flavour_name;
                    const imageUrl = v.flavour?.image_url || v.product_flavours?.image_url || v.image_url;
                    return {
                        ...v,
                        size_label: sizeLabel,
                        flavour_name: flavourName,
                        image_url: imageUrl
                    };
                }) || [];

                setFormData({
                    ...defaultFormData,
                    ...initialData,
                    product_info: initialData.product_info?.[0] || initialData.product_info || defaultFormData.product_info,
                    product_variants: normalizedVariants,
                    linked_banner_ids: initialData.product_banners?.map((pb: any) => pb.banner_id) || [],
                    hasManuallyEditedSlug: true,
                    has_variants: normalizedVariants.some((v: any) => 
                        !!v.size_id || 
                        !!v.flavour_id ||
                        !!v.size_label ||
                        !!v.flavour_name
                    )
                });
            } else if (storageKey) {
                // Restore state from localStorage if in create mode
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    try {
                        const { formData: savedForm, activeTab: savedTab } = JSON.parse(saved);
                        if (savedForm) setFormData(savedForm);
                        if (savedTab) setActiveTab(savedTab);
                    } catch (e) {
                        console.error('Failed to restore product state', e);
                    }
                }
            }
        };
        loadData();
    }, [initialData, mode]);

    // Persist state on change (only for create mode)
    useEffect(() => {
        if (mode === 'create' && storageKey) {
            localStorage.setItem(storageKey, JSON.stringify({ formData, activeTab }));
        }
    }, [formData, activeTab, mode, storageKey]);

    // Refs for resilient Autosave
    const isDiscarding = React.useRef(false);
    const formDataRef = React.useRef(formData);
    const isSavingRef = React.useRef(isSaving);

    useEffect(() => {
        formDataRef.current = formData;
        isSavingRef.current = isSaving;
    }, [formData, isSaving]);

    // Autosave Draft Logic on Unload
    useEffect(() => {
        if (mode !== 'create') return;

        const performAutosave = () => {
            if (isDiscarding.current || isSavingRef.current) return;
            
            const currentData = formDataRef.current;
            // Check if there is meaningful data to save it
            if (!currentData.name?.trim() && !currentData.title?.trim() && (!currentData.images || currentData.images.length === 0)) {
                return; // Nothing to save
            }

            const url = '/api/admin/products/autosave';
            
            // Use fetch with keepalive for modern graceful exit handling
            try {
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentData),
                    keepalive: true
                })
                .then((res) => {
                    if (res.ok) {
                        showAdminToast('Product Saved as Draft !', 'success');
                    }
                })
                .catch(e => console.error("Autosave fetch failed:", e));
            } catch (e) {
                // Fallback to sendBeacon 
                const blob = new Blob([JSON.stringify(currentData)], { type: 'application/json' });
                navigator.sendBeacon(url, blob);
                showAdminToast('Product Saved as Draft !', 'success');
            }
        };

        const handleBeforeUnload = () => {
            performAutosave();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            performAutosave();
        };
    }, [mode]);

    // Auto-generate slug from name and brand (SEO Optimized)
    useEffect(() => {
        if (mode === 'create' && formData.name && !formData.hasManuallyEditedSlug) {
            const brandObj = (brands || []).find(b => b.id === formData.brand_id);
            const brandName = brandObj ? brandObj.name : undefined;
            const generatedSlug = generateSEOSlug(formData.name, brandName);
            setFormData((prev: any) => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.brand_id, brands, mode]);

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
            }
        }, 150);
    };

    const handleNextTab = () => {
        const { isValid, firstTab } = validateAll();
        
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
        } else {
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

        const res = await onSave(dataToSave);
        setIsSaving(false);
        if (res.success) {
            isDiscarding.current = true;
            setShowFinalizeModal(false);
            if (mode === 'create' && storageKey) {
                localStorage.removeItem(storageKey);
            }
            showAdminToast(mode === 'edit' ? 'Product updated successfully.' : 'Product created successfully.', 'success');
            router.push('/admin/products');
        } else {
            showAdminToast(`Error: ${res.message}`, 'error');
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-white font-rubik overflow-hidden">
            <div className="flex-none bg-white z-[100] border-b border-gray-100">
                <DynamicAdminNav overrideTitle={mode === 'edit' ? formData.title : undefined}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                isDiscarding.current = true;
                                router.back();
                            }}
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
                            <span>{mode === 'edit' ? 'Save Changes' : 'Save Product'}</span>
                        </button>
                    </div>
                </DynamicAdminNav>

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

            <div className="flex-1 flex overflow-hidden">
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
                                        onRefreshMetadata={loadMetadata}
                                        showErrors={showErrors}
                                        errors={errors}
                                    />
                                )}
                                 {activeTab === 'details' && (
                                    <ProductDetailsTab
                                        formData={formData}
                                        setFormData={setFormData}
                                        banners={allBanners}
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
                    mode={mode}
                />
            </div>

            <MobileFloatingControls
                activeTab={activeTab}
                tabs={TABS}
                onNext={handleNextTab}
                onSave={handleSave}
                onDiscard={() => {
                    if (confirm('Discard all changes?')) {
                        isDiscarding.current = true;
                        if (mode === 'create' && storageKey) {
                            localStorage.removeItem(storageKey);
                        }
                        router.push('/admin/products');
                    }
                }}
                mode={mode}
            />
        </div>
    );
}
